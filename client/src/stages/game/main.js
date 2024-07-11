import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import Phaser from 'phaser';
import { Preloader } from './scenes/Preloader';
import { GridEngine } from 'grid-engine';

// Find out more information about the Game Config at:
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 512,
    height: 512,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        Game,
        GameOver
    ],
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

const StartGame = (parent, mapName) => {
    return new Phaser.Game({
        ...config,
        parent,
        callbacks: {
          preBoot: (game) => {
              game.registry.set('mapName', mapName);
          }
      }
    });


}

export default StartGame;
