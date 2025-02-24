import React from "react";
import { useRef, useState, useEffect } from 'react';
import { usePlayer, usePlayers, useRound } from "@empirica/core/player/classic/react";
import { PhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus'; 

export function GridWorld() {
    const phaserRef = useRef();
    const player = usePlayer();
   // const players = usePlayers();
    const round = useRound();
    const [isVisible, setIsVisible] = useState(!document.hidden);
    const movementStates = round.get('movementStates');
    const gameState = round.get('gameState');
    const playerInfo = round.get('playerInfo');

    const combinedPlayerStates = React.useMemo(() => {
        if (!movementStates || !gameState || !playerInfo) return null;
        
        return Object.keys(movementStates).reduce((acc, id) => {
            acc[id] = {
                ...movementStates[id],
                ...gameState[id],
                ...playerInfo[id]
            };
            return acc;
        }, {});
    }, [movementStates, gameState, playerInfo]);

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
    
    //useEffect(() => {
    //    EventBus.emit("update-player-states", playerStates);
    //    console.log(`🔄 Updated player states:`, playerStates[player.id]);
    //}, [playerStates]);

    //visibility change listener
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // saving visibility changes to the round
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


    return (
        <div id="app">
            <PhaserGame 
                ref={phaserRef} 
                currentActiveScene={currentScene} 
                mapName={round.get('mapName')}
                playerId={player.id}
                playerStates={combinedPlayerStates}
                isVisible={isVisible}
            />
        </div>
    )
}