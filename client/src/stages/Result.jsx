import React from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";
import { Button } from "../components/Button";

export function Result() {
  const player = usePlayer();

  return (
    <div>
      <p>You got X amount of water!</p>
      <p>This was more than X players, the same as Y players, and less than Z players</p>
      <br />
      <p>You earned X dollars</p>
      <p>Press the button to continue to the next round</p>

      <Button handleClick={() => player.stage.set("submit", true)}>
        Continue
      </Button>
    </div>
  );
  // const players = usePlayers();
  // const partner = players.filter((p) => p.id !== player.id)[0];

  /*
  return (
    <div>
      <p>You chose: {player.round.get("decision")}</p>
      <p>Your partner chose: {partner.round.get("decision")}</p>
      <br />
      <p>You get {player.round.get("score") || "TBD"} months in jail!</p>

      <Button handleClick={() => player.stage.set("submit", true)}>
        Continue
      </Button>
    </div>
  );*/
}