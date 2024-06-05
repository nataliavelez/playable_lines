import { EventBus } from '../EventBus';
import { Scene } from 'phaser';


export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.complete = false; // do not touch this! tells Empirica to advance trial
        this.tilesets = ["Water_1", "Grass_tiles_v2", "Water well", "Farming Plants", "Tilled_Dirt"];
        this.trialTilemap = this.make.tilemap({ key: "test-map" });
        this.tilesets.forEach(tileset => {
            this.trialTilemap.addTilesetImage(tileset);
        });

        for (let i = 0; i < this.trialTilemap.layers.length; i++) {
            const layer = this.trialTilemap.createLayer(i, this.tilesets, 0, 0);
            layer.scale = 3;
            
            if (this.trialTilemap.layers[i].name == 'Top View') {
              layer.depth = 10;
            }
            console.log(layer.depth);
        }

        this.playerSprite = this.add.sprite(0, 0, "bunny");
        this.playerSprite.depth = 1;
        this.playerSprite.scale = 3;

        console.log(this.playerSprite.depth);

        this.playerSprite.setFrame(this.getStopFrame('down'));
        this.cameras.main.startFollow(this.playerSprite, true);
        this.cameras.main.setFollowOffset(-this.playerSprite.width, -this.playerSprite.height);

        this.createPlayerAnimation.call(this, 'idle_up', 4, 5);
        this.createPlayerAnimation.call(this, 'idle_right', 12, 13);
        this.createPlayerAnimation.call(this, 'idle_down', 0, 1);
        this.createPlayerAnimation.call(this, 'idle_left', 8, 9);

        this.createPlayerAnimation.call(this, 'up', 6, 7);
        this.createPlayerAnimation.call(this, 'right', 14, 15);
        this.createPlayerAnimation.call(this, 'down', 2, 3);
        this.createPlayerAnimation.call(this, 'left', 10, 11);

        // this.text = this.add.text(0, -10, "Player 1");
        // this.text.setColor("#000000");

        // this.goal = this.add.polygon(13*48+24, 7*48+24, [[0,48], [24, 0], [48,48]], 0xffffff);
        // //this.goal = this.add.rectangle(13*48+24,7*48+24,48,48,0xffffff,.5);
        // this.goal.postFX.addGlow();

        // this.container = this.add.container(0, 0, [this.playerSprite, this.text]);
        // this.cameras.main.startFollow(this.container, true);
        
        

        this.gridEngineConfig = {
            characters: [
              {
                id: "bunny",
                sprite: this.playerSprite,
                offsetY: 16,
                //container: this.container,
                //walkingAnimationMapping: 1,
                startPosition: { x: 8, y: 8 },
              },
            ],
          };
        
        this.gridEngine.create(this.trialTilemap, this.gridEngineConfig);
        this.playerSprite.anims.play('idle_down');

        this.gridEngine.movementStarted().subscribe(({ direction }) => {
            this.playerSprite.anims.play(direction);
        });
        
        this.gridEngine.movementStopped().subscribe(({ direction }) => {
        this.playerSprite.anims.stop();
        this.playerSprite.setFrame(this.getStopFrame(direction));
        this.playerSprite.anims.play('idle_'+direction);
        });
    
        this.gridEngine.directionChanged().subscribe(({ direction }) => {
        this.playerSprite.setFrame(this.getStopFrame(direction));
        });

        // this.gridEngine
        // .positionChangeStarted()
        // .subscribe(({ charId, exitTile, enterTile }) => {
        //     if ((enterTile.x == 13) & (enterTile.y == 6)) {
        //         this.cameras.main.fadeOut(1000, 0, 0, 0, function(camera, progress) {
        //             if (progress == 1) {
        //                 this.changeScene();
        //             }
        //         });
        //     }
        // });

        EventBus.emit('current-scene-ready', this);
    }

    createPlayerAnimation(name,startFrame,endFrame,
      ) {
        this.anims.create({
          key: name,
          frames: this.anims.generateFrameNumbers("bunny", {
            start: startFrame,
            end: endFrame,
          }),
          frameRate: 4,
          repeat: -1,
          yoyo: true,
        });
      }
      
    getStopFrame(direction) {
        switch (direction) {
          case 'up':
            return 4;
          case 'right':
            return 12;
          case 'down':
            return 0;
          case 'left':
            return 8;
        }
      }
      

    update ()
    {
        const cursors = this.input.keyboard.createCursorKeys();

        if (cursors.left.isDown) { 
            this.gridEngine.move("bunny", "left");
        } else if (cursors.right.isDown) {
            this.gridEngine.move("bunny", "right");
        } else if (cursors.up.isDown) {
            this.gridEngine.move("bunny", "up");
        } else if (cursors.down.isDown) {
            this.gridEngine.move("bunny", "down");
        }
    }

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}