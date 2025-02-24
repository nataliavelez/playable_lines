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
  

    useEffect(() => {
        if (!Array.isArray(round.get('loadedPlayers'))) {
            console.log('⚠️ Fixing loadedPlayers state (was not an array)');
            round.set('loadedPlayers', []);
        }
    
        if (!round.get('allPlayersLoaded')) {
            round.set('allPlayersLoaded', false);
        }
    
        const handleGameLoaded = (loadedPlayerId) => {
            console.log(`🔹 Player ${loadedPlayerId} just loaded`);
    
            const loadedPlayers = round.get('loadedPlayers') || [];
    
            // 🔥 Ensure no duplicates and force sync across clients
            const newLoadedPlayers = [...new Set([...loadedPlayers, loadedPlayerId])];
    
            console.log(`🔹 New loaded players:`, newLoadedPlayers, `Total needed: ${players.length}`);
    
            round.set('loadedPlayers', newLoadedPlayers);
    
            // 🔥 RECHECK AFTER A SHORT DELAY (ensures data syncs properly)
            setTimeout(() => {
                const finalCheck = round.get('loadedPlayers') || [];
                console.log(`🔍 Final verification of loadedPlayers:`, finalCheck);
    
                if (finalCheck.length === players.length && !round.get('allPlayersLoaded')) {
                    console.log('✅ All players loaded! Emitting event.');
                    round.set('allPlayersLoaded', true);
                    EventBus.emit('all-players-loaded', true);
                }
            }, 500);
        };
    
        EventBus.on('game-loaded', handleGameLoaded);
    
        return () => {
            EventBus.off('game-loaded', handleGameLoaded);
        };
    }, [players, round]);
    
    
    // handle player state changes, and update to empirica state
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
            //EventBus.emit('update-player-states', newPlayerStates);
        };

        EventBus.on('player-state-change', handlePlayerStateChange);

        // stop listening to player state changes when component unmounts (i.e., if player leaves the game)
        return () => {
            EventBus.off('player-state-change', handlePlayerStateChange);
        };
    }, []);

    // handle move request to make sure player doesn't collide with other players
    useEffect(() => {
        const handleMoveRequest = (playerId, move) => {
            const playerStates = round.get('playerStates') || {};
            const currentDirection = playerStates[playerId].direction;

            // Only check for player collisions since obstacles were already checked
            const playerCollision = Object.entries(playerStates).some(([otherId, p]) =>
                otherId !== playerId && 
                p.position.x === move.x && 
                p.position.y === move.y
            );
        
            if (!playerCollision) {
                // Use handlePlayerStateChange through EventBus to ensure updates
                EventBus.emit('player-state-change', playerId, {
                    x: move.x,
                    y: move.y,
                    direction: move.direction
                });

            } else if (currentDirection !== move.direction) {
                EventBus.emit('player-state-change', playerId, {
                    direction: move.direction
                });     
            }
        };
        
        EventBus.on('move-request', handleMoveRequest);
        return () => {
            EventBus.off('move-request', handleMoveRequest);
        };
    }, []);
    
    
    useEffect(() => {
        if (!round.get('browserActive')) {
            round.set('browserActive', []);
        }
    
    // Append the new activity update to the existing array
        round.set('browserActive', [
            ...(round.get('browserActive') || []),
            {
                playerId: player.id,
                browserActive: isVisible,
                timestamp: Date.now()
            }
        ]);

        console.log(`🔄 Updated browser activity for ${player.id}: ${isVisible} at ${new Date().toISOString()}`);
    }, [isVisible])

    

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