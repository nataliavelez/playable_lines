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


        //players order is different for different players, so can't just do this. 
        const sortedPlayers = [...players].sort((a, b) => a.id.localeCompare(b.id));
        sortedPlayers.forEach((p, i) => {
            if (!round.get('playerStates')[p.id]) {
                console.log(`Player ${p.id}, index ${i}, position:`, round.get('startPositions'));
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
            
            //Stores every state update with a timestamp, appended into an array for the whole round.
            round.set('stateUpdates', [
                ...(round.get('stateUpdates') || []),
                {
                    playerId: playerId,
                    ...updates,
                    timestamp: Date.now()
                }
            ]);
            console.log('updates:', round.get('stateUpdates'));
        };

        const handlePlayerStateChangeNoSpread = (playerId, updates) => {
            if (updates.x !== undefined || updates.y !== undefined) {
                const playerPositions = round.get('playerPositions');
                if (!playerPositions[playerId]) {
                  playerPositions[playerId] = {};
                }
                if (updates.x !== undefined) playerPositions[playerId].x = updates.x;
                if (updates.y !== undefined) playerPositions[playerId].y = updates.y;
                round.set('playerPositions', playerPositions);
              }
            
              if (updates.direction !== undefined) {
                const playerDirections = round.get('playerDirections');
                playerDirections[playerId] = updates.direction;
                round.set('playerDirections', playerDirections);
              }
            
              if (updates.carrying !== undefined) {
                const playerCarrying = round.get('playerCarrying');
                playerCarrying[playerId] = updates.carrying;
                round.set('playerCarrying', playerCarrying);
              }
            
              if (updates.score !== undefined) {
                const playerScores = round.get('playerScores');
                playerScores[playerId] = updates.score;
                round.set('playerScores', playerScores);
            
                if (playerId === player.id) {
                  player.round.set("score", updates.score);
                  const prevCumScore = player.get("cumScore") || 0;
                  const newCumScore = prevCumScore + 1;
                  player.set("cumScore", newCumScore);
                  console.log(`Player ${playerId}: Round Score: ${updates.score}, Cumulative Score: ${newCumScore}`);
                }
              }
        };

        window.oldupdate = handlePlayerStateChange;
        window.newupdate = handlePlayerStateChangeNoSpread;

        EventBus.on('player-state-change', handlePlayerStateChange);

        // stop listening to player state changes when component unmounts (i.e., if player leaves the game)
        return () => {
            EventBus.off('player-state-change', handlePlayerStateChange);
        };
    }, []);



    const currentScene = (scene) => {
        // Allow player to submit to move to next stage, 
        // Not currently needed becuase rounds are working on the basis of time. 
        if (scene.complete) {
            player.stage.set("submit", true);
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