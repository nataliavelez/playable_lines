import { ClassicListenersCollector } from "@empirica/core/admin/classic";
export const Empirica = new ClassicListenersCollector();

Empirica.onGameStart(({ game }) => {
  const round = game.addRound({
    name: `Round`,
   });
   round.addStage({name: "Grid-Engine Example", duration:10000});

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

   
});


Empirica.onRoundStart(({ round }) => {});

Empirica.onStageStart(({ stage }) => {});

Empirica.onStageEnded(({ stage }) => {
  //update round scores and get total scores.
  //const roundScore = stage
});

Empirica.onRoundEnded(({ round }) => {});

Empirica.onGameEnded(({ game }) => {});