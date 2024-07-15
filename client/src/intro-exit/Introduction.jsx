import React from "react";
import { Button } from "../components/Button";
import './KeySymbols.css';
import { InstructionPhaserGame } from "./InstructionPhaserGame";

export function Introduction({ next }) {
  return (
    <div className="mt-3 sm:mt-5 p-20">
      <h3 className="text-lg leading-6 font-medium text-gray-900">
        Instructions
      </h3>
      <div className="mt-2 mb-6">
        <p className="text-sm text-gray-500">
          You will be playing a multiplayer game with up to 8 other players. 
          In the game you will walk around in various environments and collect water (from the ground or from a well) and use that to water nearby plants.  
          Your goal is to water as many plants as possible (you may water the same plant twice!). 
          Your remuneration for the experiment will depend on how well you do in the task. 
          <b>For each plant you water you will receive $X.XX</b>. There will be four rounds (different environments) in the game.
          <br /><br />
          Below, we quickly explain how to play the game (don't worry it is very simple), 
          before giving you a chance to practice by yourself (it will not yet be multiplayer).
          When you are confident with the instructions of the game, please press 'next' to proceed to the multiplayer verison of the game.   
          <br /><br />
          <b>Game play Instructions:</b>          
          Use the arrow keys 
            (<span className="key-styling">&larr;</span>
             <span className="key-styling">&uarr;</span>
             <span className="key-styling">&rarr;</span>
             <span className="key-styling">&darr;</span>)
          to move your character around the screen. 
          When you are near a water source press the <span className="key-styling space-key">SPACE BAR</span> to collect water, 
          and when you are near a plant press the <span className="key-styling space-key">SPACE BAR</span> to water the plant. 
          An animation will show when you are collecting/disposing water and when you are holding water.  
        </p>
      </div>
      <div className="mb-6">
        <InstructionPhaserGame />
      </div>
      <Button handleClick={next} autoFocus>
        <p>Next</p>
      </Button>
    </div>
  );
}
