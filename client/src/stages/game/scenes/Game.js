import { EventBus } from '../EventBus';
import { Scene, Input } from 'phaser';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.complete = false; // do not touch this! tells Empirica to advance trial
        this.trialTilemap = this.make.tilemap({ key: "test-map" });
        this.tilesets = this.trialTilemap.tilesets.map(tileset => tileset.name);
        this.tilesets.forEach(tileset => {
            this.trialTilemap.addTilesetImage(tileset);
        });

        for (let i = 0; i < this.trialTilemap.layers.length; i++) {
            const layer = this.trialTilemap.createLayer(i, this.tilesets, 0, 0);
            layer.scale = 2;
            
            if (this.trialTilemap.layers[i].name == 'Top View') {
              layer.depth = 10;
            }
            console.log(layer.depth);
        }

        this.playerSprite = this.add.sprite(0, 0, "bunny");
        this.playerSprite.depth = 1;
        this.playerSprite.scale = 2;
        this.playerSprite.carrying = false;

        console.log(this.playerSprite.depth);

        this.playerSprite.setFrame(this.getStopFrame('down'));
        //this.cameras.main.startFollow(this.playerSprite, true);
        // this.cameras.main.setFollowOffset(-this.playerSprite.width, -this.playerSprite.height);

        this.createPlayerAnimation.call(this, 'idle_up', 4, 5);
        this.createPlayerAnimation.call(this, 'idle_right', 12, 13);
        this.createPlayerAnimation.call(this, 'idle_down', 0, 1);
        this.createPlayerAnimation.call(this, 'idle_left', 8, 9);

        this.createPlayerAnimation.call(this, 'up', 6, 7);
        this.createPlayerAnimation.call(this, 'right', 14, 15);
        this.createPlayerAnimation.call(this, 'down', 2, 3);
        this.createPlayerAnimation.call(this, 'left', 10, 11);

        this.createPlayerAnimation.call(this, 'water_up', 22, 23, 0);
        this.createPlayerAnimation.call(this, 'water_right', 20, 21, 0);
        this.createPlayerAnimation.call(this, 'water_down', 18, 19, 0);
        this.createPlayerAnimation.call(this, 'water_left', 16, 17, 0);

        this.indicator = this.add.sprite(48, 20, "indicator");
        this.plumbob = this.add.graphics();
        this.plumbob.lineStyle(2, 0xFFFFFF, .75);
        this.plumbob.strokeRect(38, 52, 20, 20);
        
        this.container = this.add.container(0, 0, [this.plumbob, this.playerSprite, this.indicator]);
        // this.cameras.main.startFollow(this.container, true);        

        this.gridEngineConfig = {
            characters: [
              {
                id: "bunny",
                sprite: this.playerSprite,
                offsetY: 16,
                container: this.container,
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
          this.playerSprite.anims.play('idle_'+direction);
          //this.playerSprite.setFrame(this.getStopFrame(direction));
        });

        EventBus.emit('current-scene-ready', this);
    }

    createPlayerAnimation(name,startFrame,endFrame,repeat
      ) {
        if (typeof repeat === 'undefined') { repeat = -1; }

        this.anims.create({
          key: name,
          frames: this.anims.generateFrameNumbers("bunny", {
            start: startFrame,
            end: endFrame,
          }),
          frameRate: 4,
          repeat: repeat,
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
        const action = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // move sprite when arrow keys are pressed
        if (cursors.left.isDown) { 
            this.gridEngine.move("bunny", "left");
        } else if (cursors.right.isDown) {
            this.gridEngine.move("bunny", "right");
        } else if (cursors.up.isDown) {
            this.gridEngine.move("bunny", "up");
        } else if (cursors.down.isDown) {
            this.gridEngine.move("bunny", "down");
        }
        
        // use action button (spacebar) to load and unload water
        if (Input.Keyboard.JustDown(action)) {
          const direction = this.gridEngine.getFacingDirection('bunny');

          if (!this.isCarrying() & this.nearSource()) {
            this.playerSprite.carrying = true;
            this.playerSprite.anims.play('water_'+direction).on(
              'animationcomplete',
              () => {this.playerSprite.anims.play('idle_'+direction)}
            );

          } else if (this.isCarrying() & this.nearTarget()) {
            this.playerSprite.carrying = false;
            this.playerSprite.anims.play('water_'+direction).on(
              'animationcomplete',
              () => {this.playerSprite.anims.play('idle_'+direction)}
            );

          }

        }

        // display a water emote when character is carrying water
        this.indicator.visible = this.isCarrying();
        //this.text.text = 'carrying?:'+this.isCarrying();
    }

    changeScene ()
    {
        this.scene.start('GameOver');
    }

    nearSource() {
      const position = this.gridEngine.getFacingPosition("bunny");

      return this.trialTilemap.layers.some((layer) => {
        const tile = this.trialTilemap.getTileAt(position.x, position.y, false, layer.name);
        return tile?.properties?.source
      });
    }

    nearTarget() {
      const position = this.gridEngine.getFacingPosition("bunny");

      return this.trialTilemap.layers.some((layer) => {
        const tile = this.trialTilemap.getTileAt(position.x, position.y, false, layer.name);
        return tile?.properties?.target
      });
    }

    isCarrying() {
      return this.playerSprite.carrying
    }

}