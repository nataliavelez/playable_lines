# Playable lines replays

This directory contains a react app that allows us to replay an experiment from the map name, the initial player states and the playerStateUpdates.

Still, very much a work in progress. 

Preparation steps:
- run `npm install` to install Phaser and GridEngine in the directory
- `npm run dev` to serve it locally.
- in the app you will be prompted to enter the map name (a string), the original player states (json object), and the updates (an array of json objects). These can be found in CSV form after running  `empirica export` in the empirica experiment directory (or cause that is buggy for me now can be taken directly the `tajrica.json` file of the experiment).

Gameplay:
- Space bar = pause
- right arrow = speed replay
- left arrow = slow replay