import React from "react";
import { useRef, useState, useEffect } from 'react';
import { usePlayer, usePlayers, useRound } from "@empirica/core/player/classic/react";
import { PhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus';
import { runPerformanceTest } from './game/performanceTest.js';

export function GridWorld() {
    const phaserRef = useRef();
    const player = usePlayer();
    const players = usePlayers();
    const round = useRound();
    const [isVisible, setIsVisible] = useState(!document.hidden);
  
    const initializePlayers = () => {
        if (!round.get('playerX')) {
            round.set('playerX', {});
            round.set('playerY', {});
            round.set('playerDirection', {});
            round.set('playerCarrying', {});
            round.set('playerScore', {});
            round.set('playerColor', {});
            round.set('playerName', {});
        }

        const sortedPlayers = [...players].sort((a, b) => a.id.localeCompare(b.id));
        sortedPlayers.forEach((p, i) => {
            if (!round.get('playerX')[p.id]) {
                const startPosition = round.get('startPositions')[i];
                round.set('playerX', { ...round.get('playerX'), [p.id]: startPosition.x });
                round.set('playerY', { ...round.get('playerY'), [p.id]: startPosition.y });
                round.set('playerDirection', { ...round.get('playerDirection'), [p.id]: 'down' });
                round.set('playerCarrying', { ...round.get('playerCarrying'), [p.id]: false });
                round.set('playerScore', { ...round.get('playerScore'), [p.id]: 0 });
                round.set('playerColor', { ...round.get('playerColor'), [p.id]: p.get('color') });
                round.set('playerName', { ...round.get('playerName'), [p.id]: p.get('participantIdentifier') });
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
        const handlePlayerXChange = (playerId, x) => {
            round.set('playerX', { ...round.get('playerX'), [playerId]: x });
        };

        const handlePlayerYChange = (playerId, y) => {
            round.set('playerX', { ...round.get('playerY'), [playerId]: y });
        };

        const handlePlayerDirectionChange = (playerId, direction) => {
            round.set('playerDirection', { ...round.get('playerDirection'), [playerId]: direction });
        };

        const handlePlayerCarryingChange = (playerId, carrying) => {
            round.set('playerCarrying', { ...round.get('playerCarrying'), [playerId]: carrying });
        };

        const handlePlayerScoreChange = (playerId, score) => {
            round.set('playerScore', { ...round.get('playerScore'), [playerId]: score });
            if (playerId === player.id) {
                player.round.set("score", score);
                const prevCumScore = player.get("cumScore") || 0;
                const newCumScore = prevCumScore + 1;
                player.set("cumScore", newCumScore);
            }
        };

        EventBus.on('player-x-change', handlePlayerXChange);
        EventBus.on('player-y-change', handlePlayerYChange);
        EventBus.on('player-direction-change', handlePlayerDirectionChange);
        EventBus.on('player-carrying-change', handlePlayerCarryingChange);
        EventBus.on('player-score-change', handlePlayerScoreChange);

        return () => {
            EventBus.off('player-x-change', handlePlayerXChange);
            EventBus.off('player-y-change', handlePlayerYChange);
            EventBus.off('player-direction-change', handlePlayerDirectionChange);
            EventBus.off('player-carrying-change', handlePlayerCarryingChange);
            EventBus.off('player-score-change', handlePlayerScoreChange);
        };
    }, []);



    const currentScene = (scene) => {
        // Allow player to submit to move to next stage, 
        // Not currently needed becuase rounds are working on the basis of time. 
        if (scene.complete) {
            player.stage.set("submit", true);
        }

    };
    
    //if (!round.get('playerStates') || Object.keys(round.get('playerStates')).length !== players.length) {
    //    return <div>Loading...</div>;
    //}

    // Tests
    const setupPerformanceTest = () => {

        const handlePlayerStateChangeOld = (playerId, updates, round, player) => {
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
        
                //console.log(`Player ${playerId}: Round Score: ${updates.score}, Cumulative Score: ${newCumScore}`);
            };
                
            //Stores every state update with a timestamp, appended into an array for the whole round.
            //round.set('stateUpdates', [
            //    ...(round.get('stateUpdates') || []),
            //    {
            //       playerId: playerId,
            //        ...updates,
            //        timestamp: Date.now()
            //    }
            //]);
            //console.log(round.get('playerStates'))
            //console.log('updates:', round.get('stateUpdates'));
        };

        const handlePlayerStateChangeNoSpread = (playerId, updates, round, player) => {
            const playerStates = round.get('playerStates');
            if (updates.x !== undefined) playerStates[playerId].position.x = updates.x;
            if (updates.y !== undefined) playerStates[playerId].position.y = updates.y;
            if (updates.direction !== undefined) {
              playerStates[playerId].direction = updates.direction;
            }
            if (updates.carrying !== undefined) {
              playerStates[playerId].carrying = updates.carrying;
            }
            if (updates.score !== undefined) {
              playerStates[playerId].score = updates.score;
              if (playerId === player.id) {
                player.round.set("score", updates.score);
                const prevCumScore = player.get("cumScore") || 0;
                const newCumScore = prevCumScore + 1;
                player.set("cumScore", newCumScore);
              }
            }
            round.set('playerStates', playerStates);
        };

        // Make the test function available globally
        window.runGridWorldPerformanceTest = (iterations) => {
            runPerformanceTest(handlePlayerStateChangeOld, handlePlayerStateChangeNoSpread, round, player, iterations);
        };
    };

    // Call setupPerformanceTest in a useEffect to ensure it's only set up once
    useEffect(() => {
        setupPerformanceTest();
    }, []);


    return (
        <div id="app">
            <PhaserGame 
                ref={phaserRef} 
                currentActiveScene={currentScene} 
                mapName={round.get('mapName')}
                playerId={player.id}
                playerX={round.get('playerX')}
                playerY={round.get('playerY')}
                playerDirection={round.get('playerDirection')}
                playerCarrying={round.get('playerCarrying')}
                playerScore={round.get('playerScore')}
                playerColor={round.get('playerColor')}
                playerName={round.get('playerName')} 
                isVisible={isVisible}
            />
        </div>
    )
}