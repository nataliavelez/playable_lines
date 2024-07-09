import React from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";
import { Button } from "../components/Button";

export function Result() {
    const player = usePlayer();
    const players = usePlayers();

    // Count how many players have more, less, or the same score as the current player
    const playerRoundScore = player.round.get("score")
    const roundScores = players.map((p) => p.round.get("score"));
    const morePlayers = roundScores.filter((s) => s > playerRoundScore).length;
    const samePlayers = roundScores.filter((s) => s === playerRoundScore).length;
    const lessPlayers = roundScores.filter((s) => s < playerRoundScore).length;

    // The same but for the cumulative score!
    const playerCumScore = player.get("cumScore");
    const cumScores = players.map((p) => p.get("cumScore"));
    const morePlayersCum = cumScores.filter((s) => s > playerCumScore).length;
    const samePlayersCum = cumScores.filter((s) => s === playerCumScore).length;
    const lessPlayersCum = cumScores.filter((s) => s < playerCumScore).length;
    console.log(cumScores)
  
  return (
    <div>
        <h2>Last Round: </h2>
      <p>You got {playerRoundScore} amount of water in the last round!</p>
      <p>This was more than {lessPlayers} players, the same as {samePlayers} players, and less than {morePlayers} players</p>
      <br /> <br />
        <h2>Overall: </h2>
      <p>Overall, in all the rounds, you have gotten {playerCumScore} amounts of water. </p>
      <p>This was more than {lessPlayersCum} players, the same as {samePlayersCum} players, and less than {morePlayersCum} players</p>
      <br /> <br />
      <p>Press the button to continue to the next round</p>

      <Button handleClick={() => player.stage.set("submit", true)}>
        Continue
      </Button>
    </div>
  );
}