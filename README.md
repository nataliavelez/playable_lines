# Empirica-Phaser template
Natalia Velez, June 2024

This repository is a basic template to get started embedding video games into Enmpirica experiments with Phaser!

Supported game types:
* Top-down 2D gridworld games (implemented using [Grid-Engine](https://annoraaq.github.io/grid-engine/))
* (TODO) Pong

Uri's Commit from 6/5:
update to client/src/Stages/GridWorld.jsx  - save the emited player location from phaser and update the other players' location. This saves this information to the database and also propagates it to other players using empirica.
update to client/src/Stages/game/scences/game.js  - added an gridEngine.positionChangeStarted event detector that emits an event to react when player's position changes. 
