import { ClassicListenersCollector } from "@empirica/core/admin/classic";
import { getMapInfo } from './getMapInfo.js';
export const Empirica = new ClassicListenersCollector();

Empirica.onGameStart(({ game }) => {
  const treatment = game.get("treatment");
  const { numRounds, playerCount, exp1Order } = treatment;
  const randIndices = [...Array(numRounds-1).keys()].sort(() => Math.random() - 0.5)

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
  const universalizabiltyOrder = expandOrderString(exp1Order);

  // get random index for each round
  function generateRandomSequence(x, n) {
    const result = [];
    for (let i = 0; i < n * x; i++) {
      result.push(Math.floor(Math.random() * x));
    }
    return result;
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
    round.addStage({ name: "Feedback", duration: 30 });

  }

  //Randomly set colours for players
  // for now just with two players, but need to change for more players
  const colors = ["white", "red", "green", "blue", "yellow", "cyan", "orange", "purple"].slice(0, playerCount);
  const shuffledColors = colors.sort(() => Math.random() - 0.5); //permute colours array
  game.players.forEach((player, i) => player.set("color", shuffledColors[i]));

  // Set cum score
  game.players.forEach((player) => player.set("cumScore", 0)); // init cumulative Scores
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
  console.log(`Round ${roundNumber} map universalizability:`, round.get("mapUniversalizablity"));
  console.log(`Round ${roundNumber} map name:`, round.get("mapName")); 
  console.log(`Round ${roundNumber} Starting positions:`, round.get("startPositions")); 
});

Empirica.onStageStart(({ stage }) => {});

Empirica.onStageEnded(({ stage }) => {});

Empirica.onRoundEnded(({ round }) => {});

Empirica.onGameEnded(({ game }) => {});