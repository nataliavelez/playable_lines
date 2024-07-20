import PropTypes from 'prop-types';
import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import StartGame from './main';
import { EventBus } from './EventBus';

export const PhaserGame = forwardRef(function PhaserGame({ currentActiveScene, mapName, playerId, playerStates, isVisible }, ref) {
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
        const handleSceneChange = (scene) => {
            if (currentActiveScene instanceof Function) {
                currentActiveScene(scene);
            }
            ref.current.scene = scene;
        };

        EventBus.on('current-scene-ready', handleSceneChange);

        return () => {
            EventBus.off('current-scene-ready', handleSceneChange);
        }
    }, [currentActiveScene, ref]); 

    useEffect(() => {
        if (game.current) {
            EventBus.emit('update-player-states', playerStates);
        }
    }, [playerStates]);

    return  <div id="game-container"> </div>
});

// Props definitions
PhaserGame.propTypes = {
    currentActiveScene: PropTypes.func
}
