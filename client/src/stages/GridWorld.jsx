import React from "react";
import { useRef, useState, useEffect } from 'react';
import { usePlayer, usePlayers, useRound } from "@empirica/core/player/classic/react";
import { PhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus';
import { GameLog } from './game/GameConfig';

export function GridWorld() {
    const phaserRef = useRef();
    const player = usePlayer();
    const round = useRound();
    const [isVisible, setIsVisible] = useState(!document.hidden);
    const [playerStates, setPlayerStates] = useState(null);
    const [gameKey, setGameKey] = useState(0); // Add a key to force remount between rounds
    const roundNumber = round.get('number');
    const latestPlayerChange = round.get('latestPlayerChange');
    const latestPlayerReady = round.get('latestPlayerReady');
    
    // Track round changes to reset player states
    useEffect(() => {
        GameLog.log(`Round ${roundNumber} initialized`);
        const roundPlayerStates = round.get('playerStates');
        
        if (roundPlayerStates) {
            // Force a clean recreation of the game for each round
            GameLog.log(`Setting player states for round ${roundNumber}`);
            setPlayerStates(null); // First clear state
            
            // Use setTimeout to ensure state clearing happens before setting new state
            setTimeout(() => {
                setPlayerStates(roundPlayerStates);
                // Increment key to force a complete remount of PhaserGame
                setGameKey(prevKey => prevKey + 1);
                GameLog.log(`Set new game key: ${gameKey+1} for round ${roundNumber}`);
            }, 50);
            
            // Force a reset of the player readiness for the new round
            try {
                if (EventBus) {
                    GameLog.log('Notifying game about new round');
                    // This will tell the game scene to reset its waiting overlay
                    EventBus.emit("player-ready", {
                        reset: true,
                        roundNumber: roundNumber,
                        totalPlayers: Object.keys(roundPlayerStates).length
                    });
                }
            } catch (error) {
                GameLog.error('Error sending reset signal:', error);
            }
        }
    }, [roundNumber]);

    // handle move request to make sure player doesn't collide with other players
    useEffect(() => {
        const handleMoveRequest = (move) => {
            try {
                player.set("moveRequest", move);
            } catch (error) {
                GameLog.error('Error setting moveRequest:', error);
            }
        };
        
        try {
            EventBus.on('moveRequest', handleMoveRequest);
            return () => {
                EventBus.off('moveRequest', handleMoveRequest);
            };
        } catch (error) {
            GameLog.error('Error setting up moveRequest listener:', error);
            return () => {};
        }
    }, [player]);

    // handle water action
    useEffect(() => {
        const handleWaterAction = (action) => {
            try {
                GameLog.log(`🚰 GridWorld: Received waterAction event with payload:`, JSON.stringify(action));
                
                // First attempt: Use the normal player.set() method
                player.set("waterAction", action);
                GameLog.log(`🚰 GridWorld: Successfully set waterAction on player ${player.id}`);
                
                // Second attempt: Set a special flag to ensure the server notices
                // this works around potential Empirica event system issues
                const timestamp = Date.now();
                GameLog.log(`🚰 GridWorld: Setting waterActionBackup with timestamp ${timestamp}`);
                
                player.round.set("waterActionBackup", {
                    playerId: player.id,
                    action: action,
                    timestamp: timestamp
                });
            } catch (error) {
                GameLog.error('Error setting waterAction:', error);
                
                // If primary method fails, try the backup method
                try {
                    const timestamp = Date.now();
                    GameLog.log(`🚰 GridWorld: Primary method failed, trying backup with timestamp ${timestamp}`);
                    
                    player.round.set("waterActionBackup", {
                        playerId: player.id,
                        action: action,
                        timestamp: timestamp
                    });
                } catch (backupError) {
                    GameLog.error('Error setting waterActionBackup:', backupError);
                }
                
                // Also retry the primary method after a delay
                setTimeout(() => {
                    try {
                        GameLog.log(`🚰 GridWorld: Retrying waterAction after error`);
                        player.set("waterAction", action);
                    } catch (retryError) {
                        GameLog.error('Failed to retry waterAction:', retryError);
                    }
                }, 200);
            }
        };
        
        try {
            EventBus.on('waterAction', handleWaterAction);
            return () => {
                EventBus.off('waterAction', handleWaterAction);
            };
        } catch (error) {
            GameLog.error('Error setting up waterAction listener:', error);
            return () => {};
        }
    }, [player]);
    
    // handle player ready signal
    useEffect(() => {
        const handlePlayerReady = (data) => {
            try {
                // Add round number for context
                const readyData = { 
                    ...data, 
                    playerId: player.id,
                    roundNumber: roundNumber 
                };
                player.set("playerReady", readyData);
            } catch (error) {
                GameLog.error('Error setting playerReady:', error);
            }
        };
        
        try {
            EventBus.on('playerReady', handlePlayerReady);
            return () => {
                EventBus.off('playerReady', handlePlayerReady);
            };
        } catch (error) {
            GameLog.error('Error setting up playerReady listener:', error);
            return () => {};
        }
    }, [player, roundNumber]);
    
    //visibility change listener
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Track and emit individual player state changes
    useEffect(() => {
        if (latestPlayerChange && EventBus) {
            try {
                GameLog.log(`🔸 Received latest player change for ${latestPlayerChange.id}:`, JSON.stringify(latestPlayerChange));
                
                // Specifically log carrying state changes for debugging
                if (latestPlayerChange.changes && 'carrying' in latestPlayerChange.changes) {
                    GameLog.log(`🚰 GridWorld: Received carrying state update for player ${latestPlayerChange.id}: ${latestPlayerChange.changes.carrying}`);
                }
                
                EventBus.emit("update-player-state", latestPlayerChange);
            } catch (error) {
                GameLog.error('Error emitting update-player-state:', error);
            }
        }
    }, [latestPlayerChange]);
    
    // Track and emit player readiness status
    useEffect(() => {
        if (latestPlayerReady && EventBus) {
            try {
                GameLog.log(`🔹 Player ready update: ${JSON.stringify(latestPlayerReady)}`);
                // Add current round number for context
                const readyData = { 
                    ...latestPlayerReady,
                    roundNumber: roundNumber
                };
                EventBus.emit("player-ready", readyData);
            } catch (error) {
                GameLog.error('Error emitting player-ready:', error);
            }
        }
    }, [latestPlayerReady, roundNumber]);

    // Clean up EventBus when component unmounts
    useEffect(() => {
        return () => {
            try {
                GameLog.log('Cleaning up GridWorld event listeners');
                EventBus.off('moveRequest');
                EventBus.off('waterAction');
                EventBus.off('playerReady');
                EventBus.off('update-player-state');
                EventBus.off('player-ready');
            } catch (error) {
                GameLog.error('Error cleaning up event listeners:', error);
            }
        };
    }, []);

    const currentScene = (scene) => {
        // Allow player to submit to move to next stage, 
        // Not currently needed because rounds are working on the basis of time. 
        try {
            if (scene.complete) {
                player.stage.set("submit", true);
            }
        } catch (error) {
            GameLog.error('Error in currentScene callback:', error);
        }
    };

    // Only render PhaserGame once playerStates is available
    if (!playerStates) {
        return <div>Loading game...</div>;
    }

    return (
        <div id="app">
            <PhaserGame 
                key={gameKey}
                ref={phaserRef} 
                currentActiveScene={currentScene} 
                mapName={round.get('mapName')}
                playerId={player.id}
                playerStates={playerStates}
                isVisible={isVisible}
            />
        </div>
    )
}