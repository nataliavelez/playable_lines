import React from "react";
import { usePlayer, useRound } from "@empirica/core/player/classic/react";
import { Button } from "../components/Button";

export function Result() {
    const player = usePlayer();
    const round = useRound();

    const playerStates = round.get("playerStates");
    const playerRoundScore = playerStates[player.id]?.score; // get the player's score from the round
    const playerCumScore = player.get("cumScore"); // get the player's cumulative score
  
    const roundEarnings = (playerRoundScore * 0.10).toFixed(2);
    const totalEarnings = (playerCumScore * 0.10).toFixed(2);

  return (
    <div>
        <h2>Last Round: </h2>
      <p>You watered {playerRoundScore} plants in the last round! This earned you ${roundEarnings}</p>
      <br /> <br />
        <h2>Overall: </h2>
      <p>In total, you have watered {playerCumScore} plants and earned ${totalEarnings}. </p>
      <br /> <br />
      <p>Press the button to continue to the next round</p>

      <Button handleClick={() => player.stage.set("submit", true)}>
        Continue
      </Button>
    </div>
  );
}