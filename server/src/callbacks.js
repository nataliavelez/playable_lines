import { ClassicListenersCollector } from "@empirica/core/admin/classic";
import { getMapInfo } from './getMapInfo.js';

export const Empirica = new ClassicListenersCollector();
import fs from "fs";
import path from "path";


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
    round.addStage({ name: "Game", duration: 90 });  
    round.addStage({ name: "Feedback", duration: 20 });

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
  const playerStates = {};

  // Populate player states
  players.forEach((p, i) => {
      playerStates[p.id] = {
          position: startPositions[i],
          direction: 'down',
          carrying: false,
          score: 0,
          color: p.get('color'),
          name: p.get('nickname'),
      };
  });
  round.set('playerStates', playerStates); // set 
  console.log("🔹 Server initialized player states:", round.get("playerStates"));

  // Get obstacles from tilemap and make bitmash
  const obstacles = getObstaclesFromTilemap(mapName);
  round.set("obstacles", obstacles);
  console.log("🔹 Initial obstacles:", obstacles);

});

Empirica.onStageStart(({ stage }) => {

});

Empirica.onStageEnded(({ stage }) => {});

Empirica.onRoundEnded(({ round }) => {});

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
  //get vars
  const round = player.currentRound;
  const { curPos, newPos, direction } = moveRequest;

  const obstacles = new Set(round.get("obstacles"));
  const playerStates = round.get("playerStates");

  // Get current positions from playerStates
  const playerPositions = new Set(
    Object.values(playerStates).map(state => 
      positionToKey(state.position.x, state.position.y)
    )
  );

  // Check if move is valid
  if (
    newPos.x > 0 && newPos.x < 15 && 
    newPos.y > 0 && newPos.y < 15 &&
    !obstacles.has(positionToKey(newPos.x, newPos.y)) &&
    !playerPositions.has(positionToKey(newPos.x, newPos.y))
  ) {
    // Update player state
    playerStates[player.id].position = newPos;
    playerStates[player.id].direction = direction;
      round.set("playerStates", playerStates);

  } else if (playerStates[player.id].direction !== direction) {
    // Just update direction if move wasn't valid
    playerStates[player.id].direction = direction;
    round.set("playerStates", playerStates);
  }

});
});

// Function to process Tilemap from JSON file
function getObstaclesFromTilemap(mapName) {
  // Read the JSON file
  filePath = path.resolve("../client/public/assets/maps", `${mapName}.json`);
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