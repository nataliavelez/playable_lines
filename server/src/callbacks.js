import { ClassicListenersCollector } from "@empirica/core/admin/classic";
export const Empirica = new ClassicListenersCollector();

Empirica.onGameStart(({ game }) => {
  // Get treatment condition information
  const treatment = game.get("treatment");
  const { numRounds } = treatment;
  const { playerCount } = treatment;
  const { universalizability } = treatment;
  
  for (let i = 0; i < numRounds; i++) {
    const round = game.addRound({
      name: `Round ${i + 1}`,
    });
  round.addStage({ name: "game", duration: 10 });  
  round.addStage({ name: "result", duration: 10 });
  round.set("roundType", "learn");
  round.set("mapUniverzalisablity", universalizability);

  // make last round a test round with medium universalizability
  if (i === numRounds - 1) {
    round.set("roundType", "test");
    round.set("mapUniverzalisablity", "medium");
  }
  }
});


Empirica.onRoundStart(({ round }) => {

});

Empirica.onStageStart(({ stage }) => {});

Empirica.onStageEnded(({ stage }) => {
  /*
  if (stage.get("name") !== "game") return;
  console.log("End of choice stage");

  const players = stage.currentGame.players;
  
  for (const player of players) {
    console.log("computing score for player ", player.id);
    const partner = players.filter((p) => p.id !== player.id)[0];
    const playerChoice = player.round.get("decision");
    const partnerChoice = partner.round.get("decision");

    let score;
    if (playerChoice === "testify" && partnerChoice === "testify") {
      score = 6;
    } else if (playerChoice === "testify" && partnerChoice === "silent") {
      score = 1;
    } else if (playerChoice === "silent" && partnerChoice === "testify") {
      score = 12;
    } else {
      score = 2;
    }
    player.round.set("score", score);
  }
  */
});

Empirica.onRoundEnded(({ round }) => {});

Empirica.onGameEnded(({ game }) => {});