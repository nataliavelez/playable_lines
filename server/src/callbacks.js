import { ClassicListenersCollector } from "@empirica/core/admin/classic";
import { getMapInfo } from './getMapInfo.js';
export const Empirica = new ClassicListenersCollector();

Empirica.onGameStart(({ game }) => {
  const treatment = game.get("treatment");
  const { numRounds } = treatment;
  const { playerCount } = treatment;
  const { universalizability } = treatment;

  // get map info for learn and test rounds
  const mapInfoLearn = getMapInfo(universalizability); // depends on universaliabilty condition
  const mapNamesLearn = Object.keys(mapInfoLearn).sort(() => Math.random() - 0.5); // permuted
  const mapInfoTest = getMapInfo("medium");
  const mapNamesTest = Object.keys(mapInfoTest).sort(() => Math.random() - 0.5); // permuted
  
  // add rounds
  for (let i = 0; i < numRounds; i++) {
    const round = game.addRound({
      name: `Round ${i + 1}`,
    });
    round.addStage({ name: "game", duration: 30 });  
    round.addStage({ name: "result", duration: 30 });

    //set map name, details, and get permuted start positions
    let startPositions; // init outside of if logic to access outside of it.
    if (i !== numRounds - 1) {
      round.set("roundType", "learn");
      round.set("mapUniversalizablity", universalizability);
      round.set("mapName", mapNamesLearn[i]);
      startPositions = mapInfoLearn[mapNamesLearn[i]].sort(() => Math.random() - 0.5);
    } else { 
      round.set("roundType", "test");
      round.set("mapUniversalizablity", "medium");
      round.set("mapName", mapNamesTest[0]); // for now just one map for test round
      startPositions = mapInfoLearn[mapNamesTest[0]].sort(() => Math.random() - 0.5);
    }

    // set start position for each player in each round
    game.players.forEach((player, i) => player.set("startPos", startPositions[i]));
  }

  //Randomly set colours for players
  // for now just with two players, but need to change for more players
  const colors = ["white", "red"] //, "green", "blue", "yellow", "cyan", "orange", "purple"];
  const shuffledColors = colors.sort(() => Math.random() - 0.5); //permute colours array
  game.players.forEach((player, i) => player.set("color", shuffledColors[i]));

  // Set cum score
  game.players.forEach((player) => player.set("cumScore", 0)); // init cumulative Scores
});


Empirica.onRoundStart(({ round }) => {});

Empirica.onStageStart(({ stage }) => {

});

Empirica.onStageEnded(({ stage }) => {
  if (stage.get("name") !== "game") return;

  console.log("End of game stage. Calculating scores");
  const players = stage.currentGame.players;
  players.forEach((player) => {
    const roundScore = player.round.get("score");
    const cumScore = player.get("cumScore") + roundScore;
    player.set("cumScore", cumScore);
  });
});

Empirica.onRoundEnded(({ round }) => {});

Empirica.onGameEnded(({ game }) => {});