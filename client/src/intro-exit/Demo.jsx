import React from "react";
import { Button } from "../components/Button";
import '../components/KeySymbols.css';
import { InstructionPhaserGame } from "./InstructionPhaserGame";

export function Demo({ next }) {
  return (
    <div className="mt-3 sm:mt-5 p-20">
      <h3 className="text-lg leading-6 font-medium text-gray-900">
        Instructions & Demo
      </h3>
      <p className="text-sm text-gray-500 space-y-1.5">
          Please read the instructions below and play the demo game to get familiar with the gameplay.
          When you are comfortable with the rules and gameplay, press 'Next' to proceed. 
      </p>
      <div className="mt-2 mb-6">
        <p className="text-sm text-gray-500">
          <b>Gameplay instructions</b> <br />    
        </p>
        <ul className="list-disc list-inside text-sm text-gray-500 space-y-1.5">
          <li>
            To move your character, <img src="assets/bunny.png" alt="bunny" className="inline-block align-middle w-8 h-8 m-1"></img>, use the arrow keys
            (<span className="key-styling">&larr;</span>
             <span className="key-styling">&uarr;</span>
             <span className="key-styling">&rarr;</span>
             <span className="key-styling">&darr;</span>).
          </li>
          <li>
            To pick up water, press the <span className="key-styling space-key">SPACE BAR</span> when you are next to and facing a water source (a well, <img src="assets/Water well.png" alt="Water Tile" className="inline-block align-middle w-6 h-6 m-1"></img>,  or ground water, <img src="assets/Water_1.png" alt="Water Tile" className="inline-block align-middle w-6 h-6 m-1"></img>).
          </li>
          <li>
            To water a plant (a sapling, <img src="assets/sapling.png" alt="Grass Tile" className="inline-block align-middle w-6 h-6 m-1"></img>),  press the <span className="key-styling space-key">SPACE BAR</span> when you are next to and facing it. 
            Note: there may be other plants in the game (e.g., <img src="assets/sunflower.png" alt="sunfloer" className="inline-block align-middle w-6 h-6 m-1"></img> and <img src="assets/bush.png" alt="bush" className="inline-block align-middle w-6 h-6 m-1"></img>), but they cannot be watered.
          </li>
          <li>
            When you successfully pick up water, you’ll see your watering can appear in your character’s hand, <img src="assets/watering_bunny.png" alt="watering bunny" className="inline-block align-middle w-8 h-8 m-1"></img>, and a sound will play.  
            A water drop, <img src="assets/water_ready.png" alt="Water Drop" className="inline-block align-middle w-5 h-5 m-1"></img>, will be displayed above your character to remind you that you are carrying water.
          </li>
          <li>
            Another watering can animation, <img src="assets/watering_bunny.png" alt="watering bunny" className="inline-block align-middle w-8 h-8 m-1"></img>,  will appear and another sound will play when you successfully water a plant.
          </li>
          <li>
            When other players pick up and drop off water, a different sound will play.
          </li>
        </ul>
      </div>
      <p className="text-sm text-gray-500">
          <b>Game Demo </b> <br />      
      </p>
      <div className="mb">
        <InstructionPhaserGame />
      </div>
      <Button handleClick={next}>
        <p>Next</p>
      </Button>
    </div>
  );
}
