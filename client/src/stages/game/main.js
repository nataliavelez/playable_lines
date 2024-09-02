import { Game } from './Game';
import Phaser from 'phaser';
import { GridEngine } from 'grid-engine';

// Find out more information about the Game Config at:
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 512,
    height: 512,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [Game],
    plugins: {
        scene: [
          {
            key: 'gridEngine',
            plugin: GridEngine,
            mapping: 'gridEngine'
          }
        ]
      }
};

const StartGame = (parent, mapName, playerStates, playerId) => {

    return new Phaser.Game({
        ...config,
        parent,
        callbacks: {
          preBoot: (game) => {
              game.registry.set('mapName', mapName);
              game.registry.set('initialPlayerStates', playerStates);
              game.registry.set('playerId', playerId);
          }
      }
    });

}

export default StartGame;
