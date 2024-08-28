import { ClassicListenersCollector } from "@empirica/core/admin/classic";
import { getMapInfo } from './getMapInfo.js';
export const Empirica = new ClassicListenersCollector();

Empirica.onGameStart(({ game }) => {
  const treatment = game.get("treatment");
  const { playerCount, universalizability } = treatment;

  // add round with 2 stages
  const round = game.addRound({
    name: `Debug`,
    universalizability: universalizability
  })
  round.addStage({ name: "Game", duration: 300 });  
  round.addStage({ name: "Feedback", duration: 30 });

  //Randomly set colours for players
  // for now just with two players, but need to change for more players
  const colors = ["white", "red", "green", "blue", "yellow", "cyan", "orange", "purple"].slice(0, playerCount);
  const shuffledColors = colors.sort(() => Math.random() - 0.5); //permute colours array
  game.players.forEach((player, i) => player.set("color", shuffledColors[i]));

  // Set cum score
  game.players.forEach((player) => player.set("cumScore", 0)); // init cumulative Scores
});


Empirica.onRoundStart(({ round }) => {
  const universalizability = round.get("universalizability");

  // Get number of players, for now just use the treatment, but later we should have an option to get active players
  const treatment = round.currentGame.get("treatment");
  const { playerCount } = treatment;

  const mapInfo = getMapInfo(universalizability); // depends on universaliabilty condition
  round.set("mapUniversalizablity", universalizability);

  const mapNames = Object.keys(mapInfo);
  const mapName =  mapNames[0];

  // set map info
  round.set("mapName", mapName);
  const startPositions = mapInfo[mapName].slice(0, playerCount); 
  startPositions.sort(() => Math.random() - 0.5); //modifies in place
  round.set("startPositions", startPositions);

  // Log details of each round
  console.log(`Debug map universalizability:`, round.get("mapUniversalizablity"));
  console.log(`Debug map name:`, round.get("mapName")); 
  console.log(`Debug  Starting positions:`, round.get("startPositions")); 
});

Empirica.onStageStart(({ stage }) => {});

Empirica.onStageEnded(({ stage }) => {});

Empirica.onRoundEnded(({ round }) => {});

Empirica.onGameEnded(({ game }) => {});