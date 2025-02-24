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