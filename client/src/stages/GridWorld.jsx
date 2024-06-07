import React from "react";
import { useRef, useState,useEffect } from 'react';
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";

import Phaser from 'phaser';
import { PhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus';

export function GridWorld ()
{
    //  References to the PhaserGame component (game and scene are exposed)
    const player = usePlayer();
    const phaserRef = useRef();
    const players = usePlayers();
    const partner = players.filter((p) => p.id !== player.id)[0];
    const PartnerPos = partner.round.get("position");

    let [playerPosition,setPlayerPosition] = useState({ x: 0, y: 0 });
    

    player.round.set("position", playerPosition);
    const PlayerPos = player.round.get("position");

    // Event emitted from the PhaserGame component
    const currentScene = (scene) => {
        console.log('Change scene!');
        console.log(scene);
     



        if (scene.complete) {
            player.stage.set("submit", true);
        }

        EventBus.on('player_generated',(playerConf)=>{
            console.log(playerConf);
            player.round.set("config", playerConf);

            const PartnerConfig = partner.round.get("config");
            console.log(PartnerConfig);
            console.log(phaserRef);
            PartnerConfig.id+='2'
            const PhaserPlayers = phaserRef.current.scene.gridEngineConfig.characters;
            console.log(PhaserPlayers);
            PhaserPlayers.push(PartnerConfig);

            phaserRef.current.scene.gridEngine.update(phaserRef.current.scene.trialTilemap, phaserRef.current.scene.gridEngineConfig);

        })

        EventBus.on('position-change', (x,y) => {
            console.log(playerPosition)
            
            setPlayerPosition(prevPosition => ({
                x: x ,
                y: y 
              }));
              player.round.set("position", playerPosition);

          
            
            console.log('position x:'+x);
            console.log('position y:'+y);

            
        });
         


    }

    return (
        <div id="app">
             
             
              <div id = 'Player2'>Player 2: <pre>{`{\n  x: ${PartnerPos.x},y: ${PartnerPos.y}\n}`}</pre>
              </div>
              
              <div id = 'Player1'>Player 1: <pre>{`{\n  x: ${PlayerPos.x},y: ${PlayerPos.y}\n}`}</pre>
              </div>

            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
        </div>
    )
}
