import PropTypes from 'prop-types';
import { forwardRef, useEffect, useLayoutEffect, useRef ,useState} from 'react';
import StartGame from './main';
import { EventBus } from './EventBus';

export const PhaserGame = forwardRef(function PhaserGame ({ currentActiveScene }, ref)
{
    const game = useRef();
   // const [playerPosition,setPlayerPosition] = useState({ x: 0, y: 0 });

    // Create the game inside a useLayoutEffect hook to avoid the game being created outside the DOM
    useLayoutEffect(() => {
        
        if (game.current === undefined)
        {
            game.current = StartGame("game-container");
            
            if (ref !== null)
            {
                ref.current = { game: game.current, scene: null };
            }
        }

        return () => {

            if (game.current)
            {
                game.current.destroy(true);
                game.current = undefined;
            }

        }
    }, [ref]);

    useEffect(() => {

        EventBus.on('current-scene-ready', (currentScene) => {

            if (currentActiveScene instanceof Function)
            {
                currentActiveScene(currentScene);
            }
            ref.current.scene = currentScene;
            
        });

        EventBus.on('goal-reached', () => {
            
            console.log('Goal reached!');

            
        });

        // EventBus.on('position-change', (x,y) => {
        //     console.log(playerPosition)
        //     //Object.assign(playerPosition, { x:x,y:y} )
        //     //setPlayerPosition = {...playerPosition,x:x,y:y};
        //     playerPosition.x = x;
        //     playerPosition.y=y;
        //     console.log('position x:'+x);
        //     console.log('position y:'+y);

            
        // });

        return () => {

            EventBus.removeListener('current-scene-ready');

        }
        
    }, [currentActiveScene, ref])

    return (
        
        <div id="game-container">      
         
        </div>
    );

});

// Props definitions
PhaserGame.propTypes = {
    currentActiveScene: PropTypes.func 
}
