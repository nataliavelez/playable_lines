import {
  usePlayer,
  useRound,
  useStage,
} from "@empirica/core/player/classic/react";
import React from "react";
import { Timer } from "./components/Timer";
import { Avatar } from "./components/Avatar";

export function Profile() {
  const player = usePlayer();
  const round = useRound();
  const stage = useStage();

  const playerStates = round.get('playerStates') || {};
  const roundScore = playerStates[player.id]?.score || 0; // ? is optional chaining operator
  const cumScore = player.get("cumScore") || 0;

  return (
    <div className="min-w-lg md:min-w-2xl mt-2 mx-auto px-3 py-2 text-gray-500 rounded-md grid grid-cols-3 items-center border-.5">
      <div className="flex items-center space-x-2">
        <div className="h-11 w-11">
          <Avatar player={player} />
        </div>
        <div className="leading-tight">
          <div className="text-gray-600 font-semibold">
            {round ? round.get("name") : ""}
          </div>
          <div className="text-empirica-500 font-medium">
            {stage ? stage.get("name") : ""}
          </div>
        </div>
      </div>
  
      <div className="flex justify-center">
        <Timer />
      </div>
  
      <div className="flex space-x-3 items-center justify-end">
        <div className="flex flex-col items-center">
          <div className="text-xs font-semibold uppercase tracking-wide leading-none text-gray-400">
            Round Score
          </div>
          <div className="text-3xl font-semibold !leading-none tabular-nums">
            {roundScore}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xs font-semibold uppercase tracking-wide leading-none text-gray-400">
            Total Score
          </div>
          <div className="text-3xl font-semibold !leading-none tabular-nums">
            {cumScore}
          </div>
        </div>
      </div>
    </div>
  );
}
