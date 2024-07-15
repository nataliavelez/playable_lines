import React from "react";
import { usePlayer, usePlayers, useRound } from "@empirica/core/player/classic/react";
import { Button } from "../components/Button";

export function Result() {
    const player = usePlayer();
    const players = usePlayers();
    const round = useRound();

    const playerStates = round.get("playerStates");
    const playerRoundScore = playerStates[player.id]?.score;

    // Count how many players have more, less, or the same score as the current player
    const roundScores = Object.values(playerStates).map(state => state.score);
    const morePlayers = roundScores.filter((s) => s > playerRoundScore).length;
    const samePlayers = roundScores.filter((s) => s === playerRoundScore).length - 1; // -1 to discount current player
    const lessPlayers = roundScores.filter((s) => s < playerRoundScore).length;

    // The same but for the cumulative score!
    const playerCumScore = player.get("cumScore");
    const cumScores = players.map((p) => p.get("cumScore"));
    const morePlayersCum = cumScores.filter((s) => s > playerCumScore).length;
    const samePlayersCum = cumScores.filter((s) => s === playerCumScore).length - 1;
    const lessPlayersCum = cumScores.filter((s) => s < playerCumScore).length;
  
  return (
    <div>
        <h2>Last Round: </h2>
      <p>You watered {playerRoundScore} plants in the last round!</p>
      <p>This was more than {lessPlayers} players, the same as {samePlayers} players, and less than {morePlayers} players</p>
      <br /> <br />
        <h2>Overall: </h2>
      <p>Overall, in all the rounds, you have watered {playerCumScore} plants. </p>
      <p>This was more than {lessPlayersCum} players, the same as {samePlayersCum} players, and less than {morePlayersCum} players</p>
      <br /> <br />
      <p>Press the button to continue to the next round</p>

      <Button handleClick={() => player.stage.set("submit", true)}>
        Continue
      </Button>
    </div>
  );
}