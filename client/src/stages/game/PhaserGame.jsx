import PropTypes from 'prop-types';
import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import StartGame from './main';
import { EventBus } from './EventBus';

export const PhaserGame = forwardRef(function PhaserGame({ currentActiveScene, mapName, playerId, playerStates, isVisible }, ref) {
    const game = useRef();

    useLayoutEffect(() => {
        // Only initialize or reinitialize when needed
        if (game.current === undefined) {
            console.log(`Initializing game with map: ${mapName}`);
            
            // Create new game
            game.current = StartGame("game-container", mapName, playerStates, playerId);
            
            if (ref !== null) {
                ref.current = { game: game.current, scene: null };
            }
        }

        return () => {
            if (game.current) {
                console.log('Cleaning up game on unmount');
                game.current.destroy(true);
                game.current = undefined;
            }
        }
    }, [ref, mapName]); // When mapName changes, component will unmount and remount

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
            if (ref.current) {
                ref.current.scene = scene;
            }
        };

        EventBus.on('current-scene-ready', handleSceneChange);

        return () => {
            EventBus.off('current-scene-ready', handleSceneChange);
        }
    }, [currentActiveScene, ref]); 

    return  <div id="game-container"> </div>
});

// Props definitions
PhaserGame.propTypes = {
    currentActiveScene: PropTypes.func,
    mapName: PropTypes.string.isRequired,
    playerId: PropTypes.string.isRequired,
    playerStates: PropTypes.object.isRequired,
    isVisible: PropTypes.bool
}
