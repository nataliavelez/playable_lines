import { ClassicListenersCollector } from "@empirica/core/admin/classic";
export const Empirica = new ClassicListenersCollector();

Empirica.onGameStart(({ game }) => {
  const round = game.addRound({
    name: `Round`,
   });
   round.addStage( {name: "game", duration: 30 });
   round.addStage({ name: "result", duration: 30 });


   //Randomly set colours for players
   const colors = ["white", "red"] //, "green", "blue", "yellow", "cyan", "orange", "purple"];
   const shuffledColors = colors.sort(() => Math.random() - 0.5); //permute colours array
   game.players.forEach((player, i) => player.set("color", shuffledColors[i]));

   //	starting positions
   const startPositions = [
      { x: 8, y: 8 },
      { x: 10, y: 10 },
    ];
    const shuffledStartPositions = startPositions.sort(() => Math.random() - 0.5);
    //set starting position for player and partner
    game.players.forEach((player, i) => player.set("startPos", shuffledStartPositions[i]));

    //set initial cumulative Scores
    game.players.forEach((player) => player.set("cumScore", 0));
});


Empirica.onRoundStart(({ round }) => {});

Empirica.onStageStart(({ stage }) => {

});

Empirica.onStageEnded(({ stage }) => {
    //update round scores and get total scores.
    if (game.stage.get("name") === "game") {
      console.log("Calculating scores");
      players.forEach((player) => {
        const roundScore = player.round.get("score");
        const cumScore = player.get("cumScore") + roundScore;
        game.player.set("cumScore", cumScore);
      });
    }
});

Empirica.onRoundEnded(({ round }) => {});

Empirica.onGameEnded(({ game }) => {});