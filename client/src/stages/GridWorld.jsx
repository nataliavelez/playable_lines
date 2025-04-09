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
    const initialPlayerStatesRef = useRef(null);
    const latestPlayerChange = round.get('latestPlayerChange');
    
    // Get playerStates only once for initialization
    useEffect(() => {
        if (!initialPlayerStatesRef.current) {
            initialPlayerStatesRef.current = round.get('playerStates');
        }
    }, [round]);

    // handle move request to make sure player doesn't collide with other players
    useEffect(() => {
        const handleMoveRequest = (move) => {
            player.set("moveRequest", move);
        };
        EventBus.on('moveRequest', handleMoveRequest);
        return () => {
            EventBus.off('moveRequest', handleMoveRequest);
        };
    }, []);

    // handle water action
    useEffect(() => {
        const handleWaterAction = (action) => {
            player.set("waterAction", action);
        };
        EventBus.on('waterAction', handleWaterAction);
        return () => {
            EventBus.off('waterAction', handleWaterAction);
        };
    }, []);
    
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
            console.log(`🔸 Received latest player change for ${latestPlayerChange.id}`);
            EventBus.emit("update-player-state", latestPlayerChange);
        }
    }, [latestPlayerChange]);

    const currentScene = (scene) => {
        // Allow player to submit to move to next stage, 
        // Not currently needed because rounds are working on the basis of time. 
        if (scene.complete) {
            player.stage.set("submit", true);
        }
    };

    // Only render PhaserGame once initialPlayerStates is available
    if (!initialPlayerStatesRef.current) {
        return <div>Loading game...</div>;
    }

    return (
        <div id="app">
            <PhaserGame 
                ref={phaserRef} 
                currentActiveScene={currentScene} 
                mapName={round.get('mapName')}
                playerId={player.id}
                playerStates={initialPlayerStatesRef.current}
                isVisible={isVisible}
            />
        </div>
    )
}