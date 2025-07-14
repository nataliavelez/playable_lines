import React from "react";
import { Button } from "../components/Button";

export function Introduction({ next }) {
  return (
    <div className="mt-3 sm:mt-5 p-20">
      <h3 className="text-lg leading-6 font-medium text-gray-900">
        Introduction
      </h3>
      <div className="mt-2 mb-6">
        <p className="text-sm text-gray-500">
          You will be playing a multiplayer game with up to 8 other players. 
          In the game you will walk around in various environments (rounds), collect water, and water nearby saplings.  
          There will be <b>six different environments (rounds)</b> in the game.  Below, is an example of an environment (round) you could play in.
        </p>
        <div className="flex justify-center">
          <img src="assets/test_map.png" alt="map image" className="m-4"></img>
        </div>
        <p className="text-sm text-gray-500">
          In each environment (round), you will have <b>1 minute 30 seconds</b> to water the saplings as many times as possible (that is, you can water the same plant more than once).  
          In addition to your base payment for completing this experiment, <b> for each sapling you water you will receive a 2 cent bonus. 
          Over the course of the entire game, this could result in a total bonus of approximately $1 or $2 dollars!</b>
          <br /><br />
          On the next page, we explain how to play the game, and then give you a chance to practice by yourself before the game actually begins with other players. Please press 'next' to proceed.   
          <br /><br />
        </p>
      </div>
      <Button handleClick={next}>
        <p>Next</p>
      </Button>
    </div>
  );
}
