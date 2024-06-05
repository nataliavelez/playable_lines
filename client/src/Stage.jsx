import {
  usePlayer,
  usePlayers,
  useRound,
  useStage,
} from "@empirica/core/player/classic/react";
import { Loading } from "@empirica/core/player/react";
import React from "react";
import { GridWorld } from "./stages/GridWorld";
import { Result } from "./stages/Result";

export function Stage() {
  const player = usePlayer();
  const players = usePlayers();
  const round = useRound();
  const stage = useStage();


  switch (stage.get("name")) {
    case "game":
      return <GridWorld />;
    case "result":
      return <Result />;
    default:
      return <Loading />;
  }
}