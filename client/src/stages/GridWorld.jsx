import React from "react";
import { useRef, useState, useEffect } from 'react';
import { usePlayer, usePlayers, useRound } from "@empirica/core/player/classic/react";
import { PhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus';

export function GridWorld() {
    const phaserRef = useRef();
    const player = usePlayer();
    const players = usePlayers();
    const round = useRound();
    const [isVisible, setIsVisible] = useState(!document.hidden);
  
    const initializePlayers = () => {
        if (!round.get('playerStates')) {
            round.set('playerStates', {});
        }

        players.forEach((p, i) => {
            if (!round.get('playerStates')[p.id]) {
                round.set('playerStates', {
                    ...round.get('playerStates'),
                    [p.id]: { 
                        position: round.get('startPositions')[i],
                        direction: 'down',
                        carrying: false,
                        score: 0,   
                        color: p.get('color'),
                        name: p.get('participantIdentifier'),
                    }
                });
            }
        });
    };
    initializePlayers();

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
            EventBus.emit('visibility-change', !document.hidden);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    useEffect(() => {

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

            if (updates.score !== undefined && playerId === player.id) {
                const newScore = updates.score;
                player.round.set("score", newScore);
                
                // Update cumulative score
                const prevCumScore = player.get("cumScore") || 0;
                const newCumScore = prevCumScore + 1; // Increment by 1 for each successful water delivery
                player.set("cumScore", newCumScore);
        
                console.log(`Player ${playerId}: Round Score: ${updates.score}, Cumulative Score: ${newCumScore}`);
            }
        };

        EventBus.on('player-state-change', handlePlayerStateChange);

        // stop listening to player state changes when component unmounts (i.e., if player leaves the game)
        return () => {
            EventBus.off('player-state-change', handlePlayerStateChange);
        };
    }, []);



    const currentScene = (scene) => {
        if (scene.complete) {
            player.stage.set("submit", true);
        }

        if (scene.scene.key === 'Game' && round.get('playerStates')) {
            scene.initPlayers(round.get('playerStates'), player.id);
        }
    };
    
    if (!round.get('playerStates') || Object.keys(round.get('playerStates')).length !== players.length) {
        return <div>Loading...</div>;
    }

    return (
        <div id="app">
            <PhaserGame 
                ref={phaserRef} 
                currentActiveScene={currentScene} 
                mapName={round.get('mapName')}
                playerId={player.id}
                playerStates={round.get('playerStates')}
                isVisible={isVisible}
            />
        </div>
    )
}