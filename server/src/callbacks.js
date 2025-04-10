import { ClassicListenersCollector } from "@empirica/core/admin/classic";
import { getMapInfo, getMapObstacles } from './getMapInfo.js';

export const Empirica = new ClassicListenersCollector();

// Global cache to store obstacles and player data by round ID
const gameCache = {
  // Maps roundId -> Set of obstacle position keys
  obstacleCache: new Map(),
  // Maps roundId -> Map of playerId -> player data
  playerDataCache: new Map(),
  // Maps roundId -> Set of occupied position keys
  playerPositionCache: new Map(),
  // Maps roundId -> Set of ready player IDs
  playerReadyCache: new Map()
};

Empirica.onGameStart(({ game }) => {
  const treatment = game.get("treatment");
  const { numRounds, playerCount, exp1MapOrder } = treatment;

  // Get universalizability of each round from the order string
  function expandOrderString(str) {
    const difficultyMap = {
      'H': 'High',
      'M': 'Medium',
      'L': 'Low'
    };
  
    return str.split('')
      .flatMap(char => {
        const expanded = difficultyMap[char.toUpperCase()] || char;
        return [expanded, expanded];
      });
  }
  const universalizabiltyOrder = expandOrderString(exp1MapOrder);

  // get random index for each round
  function generateRandomSequence(x, n) {
    // Create base sequence [0, 1, ..., x-1]
    const baseSequence = Array.from({length: x}, (_, i) => i);
    
    // Function to shuffle an array
    const shuffle = array => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Generate n shuffled permutations
    return Array.from({length: n}, () => shuffle(baseSequence)).flat();
  }
  const randIndices = generateRandomSequence(2, 3); // that is two maps, for each of 3 universaliabilty levels

  // add rounds
  for (let i = 0; i < numRounds; i++) { 
    const round = game.addRound({
      name: `Round ${i + 1}`,
      number: i + 1,
      randIndex: randIndices[i],
      universalizability: universalizabiltyOrder[i]
    });
    round.addStage({ name: "Game", duration: 100 });  
    round.addStage({ name: "Feedback", duration: 30 });

  }

  //Randomly set colours for players
  // for now just with two players, but need to change for more players
  const colors = ["white", "red", "green", "blue", "yellow", "cyan", "orange", "purple"].slice(0, playerCount);
  const shuffledColors = colors.sort(() => Math.random() - 0.5); //permute colours array
  
  
  // Set player attributes
  game.players.forEach((player, i) => {
    // Parse the JSON string from participantIdentifier
    const playerData = JSON.parse(player.get("participantIdentifier"));
    
    // Set individual fields
    player.set("workerId", playerData.workerId);
    player.set("nickname", playerData.nickname);
    
    // Initialize other player attributes
    player.set("cumScore", 0);
    player.set("color", shuffledColors[i]);
  });
});


Empirica.onRoundStart(({ round }) => {
  const randIndex = round.get("randIndex");
  const roundNumber = round.get("number");
  const universalizability = round.get("universalizability");
  const roundId = round.id;

  // Initialize caches for this round
  gameCache.obstacleCache.set(roundId, new Set());
  gameCache.playerDataCache.set(roundId, new Map());
  gameCache.playerPositionCache.set(roundId, new Set());
  gameCache.playerReadyCache.set(roundId, new Set());
  
  // Set initial player readiness state
  round.set("allPlayersReady", false);

  // Reset player readiness explicitly for this new round
  round.set("latestPlayerReady", {
    id: null,
    readyCount: 0,
    totalPlayers: round.currentGame.players.length,
    timestamp: Date.now(),
    reset: true,
    roundNumber: roundNumber
  });

  console.log(`Round ${roundNumber} started - reset player readiness tracking`);

  // Get number of players, for now just use the treatment, but later we should have an option to get active players
  const treatment = round.currentGame.get("treatment");
  const { playerCount } = treatment;
  //const activePlayerCount = round.currentGame.players.filter(p => p.get("online")).length;
  //console.log("Active player count:", activePlayerCount)

  const mapInfo = getMapInfo(universalizability); // depends on universaliabilty condition
  const mapNames = Object.keys(mapInfo);
  const mapName =  mapNames[randIndex];

  // set map info
  round.set("mapName", mapName);
  const startPositions = mapInfo[mapName].slice(0, playerCount); 
  startPositions.sort(() => Math.random() - 0.5); //modifies in place
  round.set("startPositions", startPositions);

  // Log details of each round
  console.log(`Round ${roundNumber} map universalizability:`, universalizability);
  console.log(`Round ${roundNumber} map name:`, mapName); 
  console.log(`Round ${roundNumber} Starting positions:`, startPositions); 

  // Initialize player state for round
  const players = round.currentGame.players;
  
  // Create player states object
  const playerStates = {};

  // Populate player states
  players.forEach((p, i) => {
      // Complete player data
      playerStates[p.id] = {
          position: startPositions[i],
          direction: 'down',
          carrying: false,
          score: 0,
          color: p.get('color'),
          name: p.get('nickname'),
      };
      
      // Cache player positions
      gameCache.playerPositionCache.get(roundId).add(positionToKey(startPositions[i].x, startPositions[i].y));
      
      // Cache player data
      gameCache.playerDataCache.get(roundId).set(p.id, playerStates[p.id]);
  });
  
  // Store in Empirica
  round.set('playerStates', playerStates);
  
  console.log("🔹 Server initialized player states:", playerStates);

  // Get obstacles from tilemap and cache them
  const obstacles = getObstaclesFromTilemap(mapName);
  round.set("obstacles", obstacles);
  
  // Cache obstacles as a Set for fast lookups
  const obstacleSet = new Set(obstacles);
  gameCache.obstacleCache.set(roundId, obstacleSet);
  
  console.log("🔹 Initial obstacles:", obstacles);
});

Empirica.onStageStart(({ stage }) => {
  // Reset player readiness when a new stage starts
  const round = stage.round;
  if (round && stage.name === "Game") {
    const roundId = round.id;
    // Clear any existing ready players for this round
    if (gameCache.playerReadyCache.has(roundId)) {
      gameCache.playerReadyCache.get(roundId).clear();
    }
    console.log(`Stage ${stage.name} started, reset player readiness for round ${roundId}`);
  }
});

Empirica.onStageEnded(({ stage }) => {});

Empirica.onRoundEnded(({ round }) => {
  // Clean up cache when round ends
  const roundId = round.id;
  gameCache.obstacleCache.delete(roundId);
  gameCache.playerDataCache.delete(roundId);
  gameCache.playerPositionCache.delete(roundId);
  gameCache.playerReadyCache.delete(roundId);
});

Empirica.onGameEnded(({ game }) => {
  // For each player, save their round data
  game.players.forEach((player) => {

    // Get all rounds data
    const roundData = game.rounds.map(round => ({
      roundNumber: round.get("number"),
      mapName: round.get("mapName"),
      universalizability: round.get("universalizability")
    }));

    // Store rounds data on player for exit survey access
    player.set("roundsData", roundData);
    console.log("Saved round data for player:", player.id, roundData);
  });
});

//function to move game in server
Empirica.on("player", "moveRequest", (ctx, { player, moveRequest }) => {
  const round = player.currentRound;
  if (!round) {
    console.warn("No current round for player", player.id);
    return;
  }
  
  const roundId = round.id;
  const { curPos, newPos, direction } = moveRequest;
  
  // Get cached data for fast access
  const obstacleSet = gameCache.obstacleCache.get(roundId);
  const playerPositions = gameCache.playerPositionCache.get(roundId);
  const playerData = gameCache.playerDataCache.get(roundId);
  
  // Check if caches exist
  if (!obstacleSet || !playerPositions || !playerData) {
    console.warn("Cache not initialized for round", roundId);
    return;
  }
  
  const newPosKey = positionToKey(newPos.x, newPos.y);
  
  // Get current position from cache
  const playerState = playerData.get(player.id);
  if (!playerState) {
    console.warn("Player state not found in cache for player", player.id);
    return;
  }
  
  const currentPos = playerState.position;
  const curPosKey = positionToKey(currentPos.x, currentPos.y);

  // Check if move is valid
  if (
    newPos.x > 0 && newPos.x < 15 && 
    newPos.y > 0 && newPos.y < 15 &&
    !obstacleSet.has(newPosKey) &&
    !playerPositions.has(newPosKey)
  ) {
    // Update position in cache
    playerPositions.delete(curPosKey);
    playerPositions.add(newPosKey);
    
    // Update player data in cache
    playerState.position = newPos;
    playerState.direction = direction;
    
    // Update in Empirica store
    const playerStates = round.get("playerStates");
    if (playerStates && playerStates[player.id]) {
      playerStates[player.id].position = newPos;
      playerStates[player.id].direction = direction;
      round.set("playerStates", playerStates);
      
      // Set the latest change for efficient client updates (includes only what changed)
      round.set("latestPlayerChange", {
        id: player.id,
        changes: {
          position: newPos,
          direction: direction
        }
      });
    }
  } else if (playerState.direction !== direction) {
    // Just update direction if move wasn't valid
    playerState.direction = direction;
    
    // Update in Empirica store
    const playerStates = round.get("playerStates");
    if (playerStates && playerStates[player.id]) {
      playerStates[player.id].direction = direction;
      round.set("playerStates", playerStates);
      
      // Set the latest change for efficient client updates
      round.set("latestPlayerChange", {
        id: player.id,
        changes: {
          direction: direction
        }
      });
    }
  }
});

// Function to process waterAction from client with retry support
Empirica.on("player", "waterAction", (ctx, { player, waterAction }) => {
  const processWaterAction = (attempt = 1) => {
    try {
      console.log(`🚰 SERVER: Processing water action for player ${player.id} (attempt ${attempt}):`, waterAction);
      
      const round = player.currentRound;
      if (!round) {
        console.warn(`No current round for player ${player.id}`);
        if (attempt < 3) {
          console.log(`🚰 SERVER: Retrying in 100ms (attempt ${attempt})`);
          setTimeout(() => processWaterAction(attempt + 1), 100);
        }
        return;
      }
      
      const roundId = round.id;
      const { carrying, score } = waterAction;
      
      // Get cached data
      const playerData = gameCache.playerDataCache.get(roundId);
      if (!playerData) {
        console.warn(`Player data cache not found for round ${roundId}`);
        if (attempt < 3) {
          console.log(`🚰 SERVER: Retrying in 100ms (attempt ${attempt})`);
          setTimeout(() => processWaterAction(attempt + 1), 100);
        }
        return;
      }
      
      const playerState = playerData.get(player.id);
      if (!playerState) {
        console.warn(`Player state not found in cache for player ${player.id}`);
        if (attempt < 3) {
          console.log(`🚰 SERVER: Retrying in 100ms (attempt ${attempt})`);
          setTimeout(() => processWaterAction(attempt + 1), 100);
        }
        return;
      }
      
      console.log(`🚰 SERVER: Current player state before update:`, playerState);
      
      // Update player state in cache
      const oldCarrying = playerState.carrying;
      playerState.carrying = carrying;
      
      if (score !== undefined) {
        // When score is provided, it means water was delivered - increment cumulative score
        const currentCumScore = player.get("cumScore") || 0;
        player.set("cumScore", currentCumScore + 1);
        
        playerState.score = score;
      }
      
      console.log(`🚰 SERVER: Player ${player.id} carrying changed from ${oldCarrying} to ${carrying}`);
      
      // Update in Empirica store
      const playerStates = round.get("playerStates");
      if (playerStates && playerStates[player.id]) {
        playerStates[player.id].carrying = carrying;
        if (score !== undefined) {
          playerStates[player.id].score = score;
        }
        round.set("playerStates", playerStates);
        
        // Set the latest change for efficient client updates
        const changes = { carrying };
        if (score !== undefined) {
          changes.score = score;
        }
        
        // Log the changes that will be sent back to clients
        console.log(`🚰 SERVER: Setting latestPlayerChange for player ${player.id}:`, changes);
        
        // Set the change, but then immediately verify it was set
        round.set("latestPlayerChange", {
          id: player.id,
          changes
        });
        
        // Verify the change was actually set
        const verification = round.get("latestPlayerChange");
        if (verification && verification.id === player.id && 
            verification.changes && verification.changes.carrying === carrying) {
          console.log(`🚰 SERVER: Successfully processed water action for player ${player.id}`);
        } else {
          console.warn(`🚰 SERVER: Failed to verify latestPlayerChange was set correctly, retrying...`);
          if (attempt < 3) {
            console.log(`🚰 SERVER: Retrying in 100ms (attempt ${attempt})`);
            setTimeout(() => processWaterAction(attempt + 1), 100);
          }
        }
      } else {
        console.warn(`Failed to update playerStates for player ${player.id} - not found in round data`);
        if (attempt < 3) {
          console.log(`🚰 SERVER: Retrying in 100ms (attempt ${attempt})`);
          setTimeout(() => processWaterAction(attempt + 1), 100);
        }
      }
    } catch (error) {
      console.error("Error processing water action:", error);
      if (attempt < 3) {
        console.log(`🚰 SERVER: Error occurred, retrying in 100ms (attempt ${attempt})`);
        setTimeout(() => processWaterAction(attempt + 1), 100);
      }
    }
  };
  
  // Start processing with attempt 1
  processWaterAction();
});

// Function to process Tilemap from JSON file
function getObstaclesFromTilemap(mapName) {
  // Instead of reading from filesystem, use the hard-coded data
  return getMapObstacles(mapName);
}

function positionToKey(x, y) {
  return `${x},${y}`;
}

// Function to handle player readiness
Empirica.on("player", "playerReady", (ctx, { player, playerReady }) => {
  try {
    const round = player.currentRound;
    if (!round) {
      console.warn("No current round for player", player.id);
      return;
    }
    
    const roundId = round.id;
    const roundNumber = round.get('number');
    
    // Get or initialize player ready cache
    if (!gameCache.playerReadyCache.has(roundId)) {
      gameCache.playerReadyCache.set(roundId, new Set());
    }
    const readyPlayers = gameCache.playerReadyCache.get(roundId);
    
    // Mark this player as ready if not already
    if (!readyPlayers.has(player.id)) {
      readyPlayers.add(player.id);
      
      // Count total players and ready players
      const totalPlayers = Object.keys(round.get("playerStates") || {}).length;
      const readyCount = readyPlayers.size;
      
      console.log(`Player ${player.id} is ready for round ${roundNumber}. Ready players: ${readyCount}/${totalPlayers}`);
      
      // Broadcast this player's readiness to all clients
      // Set the latest player ready status for efficient client updates
      round.set("latestPlayerReady", {
        id: player.id,
        readyCount: readyCount,
        totalPlayers: totalPlayers,
        timestamp: Date.now(), // Add timestamp to ensure the update is detected
        roundNumber: roundNumber // Add round number for extra verification
      });
      
      // Debug output all ready players
      console.log(`Ready players for round ${roundNumber}: ${Array.from(readyPlayers)}`);
      
      // If all players are ready, set a flag on the round to indicate this
      if (readyCount === totalPlayers) {
        round.set("allPlayersReady", true);
        console.log(`🎮 All players (${totalPlayers}) are ready for round ${roundNumber}! Game starting.`);
      }
    }
  } catch (error) {
    console.error("Error handling playerReady event:", error);
  }
});

// Callback that runs on each round tick to check for backup water actions
Empirica.on("roundTick", ({ round }) => {
  try {
    // Check for backup water actions
    const waterActionBackup = round.get("waterActionBackup");
    if (waterActionBackup) {
      const { playerId, action, timestamp } = waterActionBackup;
      const now = Date.now();
      
      // Only process backup actions that are recent (within last 5 seconds)
      if (now - timestamp < 5000) {
        console.log(`🚰 SERVER: Found backup water action for player ${playerId}:`, action);
        
        // Find the player
        const player = round.currentGame.players.find(p => p.id === playerId);
        if (player) {
          // Process the water action (reusing the existing handler logic)
          console.log(`🚰 SERVER: Processing backup water action for player ${playerId}`);
          
          const roundId = round.id;
          const { carrying, score } = action;
          
          // Get cached data
          const playerData = gameCache.playerDataCache.get(roundId);
          if (!playerData) {
            console.warn("Player data cache not found for round", roundId);
            return;
          }
          
          const playerState = playerData.get(playerId);
          if (!playerState) {
            console.warn("Player state not found in cache for player", playerId);
            return;
          }
          
          console.log(`🚰 SERVER: Backup - Current player state before update:`, playerState);
          
          // Update player state in cache
          const oldCarrying = playerState.carrying;
          playerState.carrying = carrying;
          
          if (score !== undefined) {
            // When score is provided, it means water was delivered - increment cumulative score
            const currentCumScore = player.get("cumScore") || 0;
            player.set("cumScore", currentCumScore + 1);
            
            playerState.score = score;
          }
          
          console.log(`🚰 SERVER: Backup - Player ${playerId} carrying changed from ${oldCarrying} to ${carrying}`);
          
          // Update in Empirica store
          const playerStates = round.get("playerStates");
          if (playerStates && playerStates[playerId]) {
            playerStates[playerId].carrying = carrying;
            if (score !== undefined) {
              playerStates[playerId].score = score;
            }
            round.set("playerStates", playerStates);
            
            // Set the latest change for efficient client updates
            const changes = { carrying };
            if (score !== undefined) {
              changes.score = score;
            }
            
            // Log the changes that will be sent back to clients
            console.log(`🚰 SERVER: Backup - Setting latestPlayerChange for player ${playerId}:`, changes);
            
            round.set("latestPlayerChange", {
              id: playerId,
              changes
            });
            
            console.log(`🚰 SERVER: Successfully processed backup water action for player ${playerId}`);
            
            // Clear the backup once processed
            round.set("waterActionBackup", null);
          } else {
            console.warn(`Failed to update playerStates for player ${playerId} - not found in round data`);
          }
        } else {
          console.warn(`Player ${playerId} not found for backup water action`);
        }
      } else {
        // Clear old backup actions
        console.log(`🚰 SERVER: Clearing old backup water action (${now - timestamp}ms old)`);
        round.set("waterActionBackup", null);
      }
    }
  } catch (error) {
    console.error("Error processing backup water action:", error);
  }
});