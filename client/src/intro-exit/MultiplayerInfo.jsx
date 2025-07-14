import React from "react";
import { Button } from "../components/Button";

export function MultiplayerInfo({ next }) {
  return (
    <div className="mt-3 sm:mt-5 p-20">
      <h3 className="text-lg leading-6 font-medium text-gray-900">
        Multiplayer Information
      </h3>
      <div className="mt-2 mb-6">
        <p className="text-sm text-gray-500">
        You will play this game with up to seven more participants, each represented by a different color avatar and a nickname. Each round will start when all players press the 'next' button. 
        Please make sure that you are focused only on playing the game, as any delays on your part will mean that all other players are stuck waiting for you!
        There may be some lags in other players' movements due to internet connectivity, this is fine and will sort itself out during the game.
        <br /><br />
        Please press 'next' to proceed.
        </p>
      </div>
      <Button handleClick={next}>
        <p>Next</p>
      </Button>
    </div>
  );
}
