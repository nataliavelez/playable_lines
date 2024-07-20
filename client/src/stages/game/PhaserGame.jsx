import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import StartGame from './main';
import { EventBus } from './EventBus';

export const PhaserGame = forwardRef(function PhaserGame({ mapName, playerId, playerStates, isVisible }, ref) {
    const game = useRef();

    useLayoutEffect(() => {
        if (game.current === undefined) {
            game.current = StartGame("game-container", mapName, playerStates, playerId);
            
            if (ref !== null) {
                ref.current = { game: game.current, scene: null };
            }
        }

        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
            }
        }
    }, [ref, mapName]);

    useEffect(() => {
        if (game.current) {
            EventBus.emit('visibility-change', isVisible);
        }
    }, [isVisible]);

    useEffect(() => {
        if (game.current) {
            EventBus.emit('update-player-states', playerStates);
        }
    }, [playerStates]);

    return  <div id="game-container"> </div>
});