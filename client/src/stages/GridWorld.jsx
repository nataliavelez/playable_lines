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
    const roundNumber = round.get('number');
    const latestPlayerChange = round.get('latestPlayerChange');
    const latestPlayerReady = round.get('latestPlayerReady');
    
    // Track round changes to reset player states
    useEffect(() => {
        GameLog.log(`Round ${roundNumber} initialized`);
        const roundPlayerStates = round.get('playerStates');
        
        if (roundPlayerStates) {
            GameLog.log('Setting player states for new round');
            setPlayerStates(roundPlayerStates);
            
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
                player.set("waterAction", action);
            } catch (error) {
                GameLog.error('Error setting waterAction:', error);
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
                GameLog.log(`🔸 Received latest player change for ${latestPlayerChange.id}`);
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