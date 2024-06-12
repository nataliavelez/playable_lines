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

    //const partners = players.filter((p) => p.id !== player.id);
    const partner = players.filter((p) => p.id !== player.id)[0];
    const PartnerPos = partner.round.get("position");
    const tempPlayerPos = player.round.get("position");

    // Event emitted from the PhaserGame component
    const currentScene = (scene) => {
        console.log('Change scene!');
        console.log(scene);
        EventBus.emit('NewGame',players)



        if (scene.complete) {
            player.stage.set("submit", true);
        }

        EventBus.on('player_generated',(message)=>{
            console.log(message);

            
            player.round.set("position", {
                x:Math.floor(Math.random() * (8 - 4) + 4),
                y:Math.floor(Math.random() * (8 - 4) + 4)
            });

           let ThisPartners=[];

            players.forEach(p => {
                let ThisPlayer = {
                    id : p.get("participantIdentifier"),
                    position:p.round.get("position")
                }
                ThisPartners.push(ThisPlayer)
            });
            
            console.log(ThisPartners);

            scene.AddPlayers(ThisPartners,player.get("participantIdentifier"));//send new players to


           
            console.log(ThisPartners);

        })
  

       

        
        EventBus.on('position-change', (PlayerName,x,y) => {
            console.log('position-change-recieved:'+PlayerName+' x:'+ x +' y:'+y)
           if(player.get("participantIdentifier")===PlayerName){
            
           }
            
            player.round.set("position", {x:x,y:y});
            
           

              let ThisPartners=[];

              players.forEach(p => {
                  let ThisPlayer = {
                      id : p.get("participantIdentifier"),
                      position:p.round.get("position")
                  }
                  ThisPartners.push(ThisPlayer)
              });
              
              console.log(ThisPartners);
  
              scene.MovePlayers(ThisPartners);//send new players to

          
             
           

            
        });
         


    }

    return (
        <div id="app">
             
             <div id = 'Player2'>Player 2: <pre>{`{\n  x: ${PartnerPos.x},y: ${PartnerPos.y}\n}`}</pre>
              </div>
              
              <div id = 'Player1'>Player 1: <pre>{`{\n  x: ${tempPlayerPos.x},y: ${tempPlayerPos.y}\n}`}</pre>
              </div>

            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            
           
        </div>
    )
}

