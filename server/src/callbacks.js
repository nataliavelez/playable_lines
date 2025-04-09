import { ClassicListenersCollector } from "@empirica/core/admin/classic";
import { getMapInfo } from './getMapInfo.js';

export const Empirica = new ClassicListenersCollector();
import fs from "fs";
import path from "path";

// Global cache to store obstacles and player data by round ID
const gameCache = {
  // Maps roundId -> Set of obstacle position keys
  obstacleCache: new Map(),
  // Maps roundId -> Map of playerId -> player data
  playerDataCache: new Map(),
  // Maps roundId -> Set of occupied position keys
  playerPositionCache: new Map()
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
    round.addStage({ name: "Game", duration: 100000 });  
    round.addStage({ name: "Feedback", duration: 5 });

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

});

Empirica.onStageEnded(({ stage }) => {});

Empirica.onRoundEnded(({ round }) => {
  // Clean up cache when round ends
  const roundId = round.id;
  gameCache.obstacleCache.delete(roundId);
  gameCache.playerDataCache.delete(roundId);
  gameCache.playerPositionCache.delete(roundId);
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

// Function to process waterAction from client
Empirica.on("player", "waterAction", (ctx, { player, waterAction }) => {
  const round = player.currentRound;
  if (!round) {
    console.warn("No current round for player", player.id);
    return;
  }
  
  const roundId = round.id;
  const { carrying, score } = waterAction;
  
  // Get cached data
  const playerData = gameCache.playerDataCache.get(roundId);
  if (!playerData) {
    console.warn("Player data cache not found for round", roundId);
    return;
  }
  
  const playerState = playerData.get(player.id);
  if (!playerState) {
    console.warn("Player state not found in cache for player", player.id);
    return;
  }
  
  // Update player state in cache
  playerState.carrying = carrying;
  if (score !== undefined) {
    // When score is provided, it means water was delivered - increment cumulative score
    const currentCumScore = player.get("cumScore") || 0;
    player.set("cumScore", currentCumScore + 1);
    
    playerState.score = score;
  }
  
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
    
    round.set("latestPlayerChange", {
      id: player.id,
      changes
    });
  }
});

// Function to process Tilemap from JSON file
function getObstaclesFromTilemap(mapName) {
  // Read the JSON file
  const filePath = path.resolve("../client/public/assets/maps", `${mapName}.json`);
  const fileContent = fs.readFileSync(filePath, "utf8");
  const tiledJson = JSON.parse(fileContent);

  // Find the "obstacles" layer
  const obstaclesLayer = tiledJson.layers.find(layer => layer.name === "obstacles");
  
  if (!obstaclesLayer) {
    throw new Error("Layer 'obstacles' not found");
  }
  const { width, height, data } = obstaclesLayer;
  // Extract (x, y) coordinates of all non-zero values
  const staticObstacles = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const index = y * width + x;
      if (data[index] !== 0) {
        staticObstacles.push(`${x},${y}`); // Store as "x,y"
      }
    }
  }
  return staticObstacles;
}

function positionToKey(x, y) {
  return `${x},${y}`;
}