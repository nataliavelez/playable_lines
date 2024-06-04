import React from "react";
import { useRef, useState } from 'react';
import { usePlayer } from "@empirica/core/player/classic/react";

import Phaser from 'phaser';
import { PhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus';

export function GridWorld ()
{
    //  References to the PhaserGame component (game and scene are exposed)
    const player = usePlayer();
    const phaserRef = useRef();

    // Event emitted from the PhaserGame component
    const currentScene = (scene) => {
        console.log('Change scene!');
        console.log(scene);

        if (scene.complete) {
            player.stage.set("submit", true);
        }
    }

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
        </div>
    )
}
