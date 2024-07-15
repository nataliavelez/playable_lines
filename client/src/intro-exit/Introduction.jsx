import React from "react";
import { Button } from "../components/Button";
import '../components/KeySymbols.css';
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
          In the game you will walk around in various environments and collect water, and water nearby plants.  
          There will be four different environments in the game. 
          In each environment, you will have <b>3 minutes</b> to water as many plants as possible (and you can water the same plant more than once).  
          <b> For each plant you water you will receive $X.XX</b>. 
          <br /><br />
          Below, we explain how to play the game, before giving you a chance to practice by yourself.
          When you are confident with the instructions and gameplay, please press 'next' to proceed.   
          <br /><br />
          <b>Gameplay instructions</b> <br />         
          Use the arrow keys 
            (<span className="key-styling">&larr;</span>
             <span className="key-styling">&uarr;</span>
             <span className="key-styling">&rarr;</span>
             <span className="key-styling">&darr;</span>)
          to move your character around the screen. 
          When you are next to and facing a water source (either a well or ground water) press the <span className="key-styling space-key">SPACE BAR</span> to collect water, 
          and when you are next to and facing a plant press the <span className="key-styling space-key">SPACE BAR</span> to water the plant. 
          An animation will show when you are collecting/disposing water and when you are holding water.  
        </p>
      </div>
      <div className="mb-6">
        <InstructionPhaserGame />
      </div>
      <Button handleClick={next}>
        <p>Next</p>
      </Button>
    </div>
  );
}
