import React from "react";
import { useRef, useState,useEffect } from 'react';
import { usePlayer, usePlayers, useRound } from "@empirica/core/player/classic/react";

import Phaser from 'phaser';
import { PhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus';
import { Game } from "../Game.jsx";

export function GridWorld() {
    //  References to the PhaserGame component (game and scene are exposed)
    const player = usePlayer();
    const phaserRef = useRef();
    const players = usePlayers();
    const round = useRound();
    const [isDataReady, setIsDataReady] = useState(false);

    console.log("player", player.get("participantIdentifier"));

    // Set player positions first time component is run, but only once
    // saved directly to round so it is shared state
    useEffect(() => {
        if (!round.get('playerStates')) {
            round.set('playerStates', {});
        }
    
        // Initialize player state if not set
        if (!round.get('playerStates')[player.id]) {
            round.set('playerStates', {
                ...round.get('playerStates'),
                [player.id]: { 
                    position: player.get('startPos'),
                    direction: 'down', // default direction
                    carrying: false,
                    score: 0,   
                    color: player.get('color'),
                    name: player.get('participantIdentifier'),
                }
            });
        }

            const handlePlayerStateChange = (playerId, updates) => {
                round.set('playerStates', {
                    ...round.get('playerStates'),
                    [playerId]: {
                        ...round.get('playerStates')[playerId],
                        ...(updates.x !== undefined || updates.y !== undefined ? {
                            position: {
                                ...round.get('playerStates')[playerId].position,
                                ...(updates.x !== undefined ? { x: updates.x } : {}),
                                ...(updates.y !== undefined ? { y: updates.y } : {})
                            }
                        } : {}),
                        ...(updates.direction !== undefined ? { direction: updates.direction } : {}),
                        ...(updates.carrying !== undefined ? { carrying: updates.carrying } : {}),
                        ...(updates.score !== undefined ? { score: updates.score } : {}),
                        ...(updates.name !== undefined ? { name: updates.name } : {}),
                        ...(updates.color !== undefined ? { color: updates.color } : {})
                    }
                });

                // updates player round score 
                if (updates.score !== undefined && playerId === player.id) {
                    player.round.set("score", updates.score);
                }
            };
    
        EventBus.on('player-state-change', handlePlayerStateChange);

        // Check if all necessary data is available
        if (round.get('playerStates') && Object.keys(round.get('playerStates')).length === players.length) {
            setIsDataReady(true);
        }
    
        return () => {
            EventBus.off('player-state-change', handlePlayerStateChange);
        };
    }, []);

    // Event emitted from the PhaserGame component
    const currentScene = (scene) => {
        // player finished scene
        if (scene.complete) {
            player.stage.set("submit", true);
        }

        //Initialise players 
        if (scene.scene.key === 'Game') {
            scene.initPlayers(round.get('playerStates'), player.id);
        }

    };

    if (!isDataReady) {
        return <div>Loading...</div>;
    }

    return (
        <div id="app">
            <PhaserGame 
                ref={phaserRef} 
                currentActiveScene={currentScene} 
                playerStates={round.get('playerStates')} //keeps phaser aware of player states
            />
        </div>
    )
}

