import React from "react";
import { useRef, useState, useEffect } from 'react';
import { usePlayer, usePlayers, useRound } from "@empirica/core/player/classic/react";
import { PhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus'; 

export function GridWorld() {
    const phaserRef = useRef();
    const player = usePlayer();
    const round = useRound();
    const [isVisible, setIsVisible] = useState(!document.hidden);
    const playerStates = round.get('playerStates');
    const [previousState, setPreviousState] = useState(null); // to only save updates.


    // Mount handlers on start up
    useEffect(() => {
        // Move request handler
        const handleMoveRequest = (move) => {
            player.set("moveRequest", move);
        };
    
        // Water action handler
        const handleWaterAction = (action) => {
            player.set("waterAction", action);
        };
    
        // Visibility change handler
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };
    
        // Set up all event listeners
        EventBus.on('moveRequest', handleMoveRequest);
        EventBus.on('waterAction', handleWaterAction);
        document.addEventListener('visibility-change', handleVisibilityChange);
    
        // Clean up all listeners on unmount
        return () => {
            EventBus.off('move-request', handleMoveRequest);
            EventBus.off('water-action', handleWaterAction);
            document.removeEventListener('visibility-change', handleVisibilityChange);
        };
    }, []);

    // save updates to the round
    useEffect(() => {
        if (!round.get('playerStateUpdates')) {
            round.set('playerStateUpdates', []);
        }
    
        if (playerStates && playerStates[player.id]) {
            const currentState = playerStates[player.id];
            
            // Only record changes
            if (previousState) {
                const changes = {};
                let hasChanges = false;
    
                // Compare current state with previous state
                Object.keys(currentState).forEach(key => {
                    if (JSON.stringify(currentState[key]) !== JSON.stringify(previousState[key])) {
                        changes[key] = currentState[key];
                        hasChanges = true;
                    }
                });
    
                // Only send to game if there are actual changes
                if (hasChanges) {
                     // Emit specific changes instead of whole state
                    EventBus.emit('player-state-change', {
                        playerId: player.id,
                        changes
                    });
    
                    console.log(`📝 Recorded state update for ${player.id}:`, changes);
                }
            }
    
            setPreviousState(currentState);
        }
    }, [playerStates]);

    
    const currentScene = (scene) => {
        // Allow player to submit to move to next stage, 
        // Not currently needed becuase rounds are working on the basis of time. 
        if (scene.complete) {
            player.stage.set("submit", true);
        }

    };

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