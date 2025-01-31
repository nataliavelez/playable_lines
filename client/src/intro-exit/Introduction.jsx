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
          In the game you will walk around in various environments (rounds), collect water, and water nearby plants.  
          There will be <b>six different environments (rounds)</b> in the game. 
          In each environment, you will have <b>3 minutes</b> to water as many plants as possible (and you can water the same plant more than once).  
          <b> For each plant you water you will receive $X.XX</b>. 
          <br /><br />
          Below, we explain how to play the game, and then give you a chance to practice by yourself before the game actually begins.
          When you are confident with the instructions and gameplay, please press 'next' to proceed.   
          <br /><br />
          <b>Gameplay instructions</b> <br />         
          Use the arrow keys 
            (<span className="key-styling">&larr;</span>
             <span className="key-styling">&uarr;</span>
             <span className="key-styling">&rarr;</span>
             <span className="key-styling">&darr;</span>)
          to move your character around the screen. 
          When you are next to and facing a water source (either a well, <img src="assets/Water well.png" alt="Water Tile" className="inline-block align-middle w-6 h-6"></img>,  or ground water, <img src="assets/Water_1.png" alt="Water Tile" className="inline-block align-middle w-6 h-6"></img>) press the <span className="key-styling space-key">SPACE BAR</span> to collect water, 
          and when you are next to and facing a plant (well, a sapling, <img src="assets/sapling.png" alt="Grass Tile" className="inline-block align-middle w-6 h-6"></img>) 
          press the <span className="key-styling space-key">SPACE BAR</span> to water it. 
          When you successfully pick up water, you’ll see your watering can appear in your character’s hand, <img src="assets/watering_bunny.png" alt="watering bunny" className="inline-block align-middle w-8 h-8"></img>, and a sound will play.  
          A water drop, <img src="assets/water_ready.png" alt="Water Drop" className="inline-block align-middle w-6 h-6"></img>, will be displayed above your character to remind you that you are carrying water.  
          Another watering can animation will appear and another sound will play when you successfully water a plant.
          When other players pick up and drop off water, a different sound will play.
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
