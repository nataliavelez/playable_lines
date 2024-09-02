import PropTypes, { object } from 'prop-types';
import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import StartGame from './main';
import { EventBus } from './EventBus';

export const PhaserGame = forwardRef(
    function PhaserGame({ currentActiveScene, mapName, playerId, playerX, playerY, playerDirection, playerCarrying, playerScore, playerColor, playerName, isVisible }, ref) {
    const game = useRef();

    useLayoutEffect(() => {
        if (game.current === undefined) {
            
            // to simplify, use old player states to initialize
            const playerStates = Object.keys(playerX).reduce((acc, id) => {
                acc[id] = {
                    position: { x: playerX[id], y: playerY[id] },
                    direction: playerDirection[id],
                    carrying: playerCarrying[id],
                    score: playerScore[id],
                    color: playerColor[id],
                    name: playerName[id]
                };
                return acc;
            }, {});
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
            EventBus.emit('update-player-x', playerX);
        }
    }, [playerX]);

    useEffect(() => {
        if (game.current) {
            EventBus.emit('update-player-y', playerY);
        }
    }, [playerY]);

    useEffect(() => {
        if (game.current) {
            EventBus.emit('update-player-direction', playerDirection);
        }
    }, [playerDirection]);

    useEffect(() => {
        if (game.current) {
            EventBus.emit('update-player-carrying', playerCarrying);
        }
    }, [playerCarrying]);   

    useEffect(() => {
        if (game.current) {
            EventBus.emit('update-player-score', playerScore);
        }
    }, [playerScore]);
    

    return  <div id="game-container"> </div>
});

// Props definitions
PhaserGame.propTypes = {
    currentActiveScene: PropTypes.func
}
