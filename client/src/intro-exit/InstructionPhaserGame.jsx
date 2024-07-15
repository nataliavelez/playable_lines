// InstructionPhaserGame.jsx
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GridEngine } from "grid-engine";
import { InstructionGame } from './InstructionGame';

export function InstructionPhaserGame() {
    const gameRef = useRef(null);

    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            parent: 'instruction-game-container',
            width: 512,
            height: 512,
            backgroundColor: '#028af8',
            scene: [InstructionGame],
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

        const game = new Phaser.Game(config);
        gameRef.current = game;

        return () => {
            game.destroy(true);
        };
    }, []);

    return <div id="instruction-game-container" />;
}