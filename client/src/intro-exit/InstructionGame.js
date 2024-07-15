// InstructionGame.js
import Phaser from 'phaser';
import { Scene, Input } from 'phaser';

export class InstructionGame extends Scene {
    constructor() {
        super('InstructionGame');
    }

    preload() {
        this.load.setPath('assets');

        this.load.image('Water_1', 'Water_1.png');
        this.load.image('Grass_tiles_v2', 'Grass_tiles_v2.png');
        this.load.image('Water well', 'Water well.png');
        this.load.image('Farming Plants', 'Farming Plants.png');
        this.load.image('Tilled_Dirt', 'Tilled_Dirt.png');
        this.load.image('Fences', 'Fences.png');
        this.load.image('Mushrooms, Flowers, Stones', 'Mushrooms, Flowers, Stones.png');
        this.load.image('indicator', 'water_ready.png');
        
        this.load.tilemapTiledJSON('test-map', 'test_map.json');

        this.load.spritesheet('bunny', 'bunny_spritesheet.png', {
            frameWidth: 48,
            frameHeight: 48
        }); 
    }

    create() {
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
        }

        this.playerSprite = this.add.sprite(0, 0, "bunny");
        this.playerSprite.depth = 1;
        this.playerSprite.scale = 2;
        this.playerSprite.carrying = false;

        this.indicator = this.add.sprite(48, 20, "indicator");
        this.plumbob = this.add.graphics();
        this.plumbob.lineStyle(2, 0xFFFFFF, .75);
        this.plumbob.strokeRect(38, 52, 20, 20);
        
        this.container = this.add.container(0, 0, [this.plumbob, this.playerSprite, this.indicator]);       

        this.gridEngineConfig = {
            characters: [
              {
                id: "bunny",
                sprite: this.playerSprite,
                offsetY: 16,
                container: this.container,
                startPosition: { x: 8, y: 8 },
                speed: 3
              },
            ],
          };
        
        this.gridEngine.create(this.trialTilemap, this.gridEngineConfig);
        this.createPlayerAnimations();
        this.playerSprite.anims.play('idle_down', true);

        this.gridEngine.movementStarted().subscribe(({ direction }) => {
            this.playerSprite.anims.play('walk_'+direction, true);
        });
        
        this.gridEngine.movementStopped().subscribe(({ direction }) => {
          this.playerSprite.anims.stop();
          this.playerSprite.anims.play('idle_'+direction, true);
        });
    
        this.gridEngine.directionChanged().subscribe(({ direction }) => {
          this.playerSprite.anims.play('idle_'+direction, true);
          //this.playerSprite.setFrame(this.getStopFrame(direction));
        });


    }

    update() {
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
    }

    createPlayerAnimations() {
        const directions = ['up', 'down', 'left', 'right'];
        const animsConfig = {
            up: { start: 4, end: 7 },
            down: { start: 0, end: 3 },
            left: { start: 8, end: 11 },
            right: { start: 12, end: 15 }
        };
        const waterAnimsConfig = {
            up: 22, 
            down: 18,
            left: 16,
            right: 20
          };

        directions.forEach(dir => {
            this.anims.create({
                key: `walk_${dir}`,
                frames: this.anims.generateFrameNumbers('bunny', animsConfig[dir]),
                frameRate: 8,
                repeat: -1,
            });

            this.anims.create({
                key: `idle_${dir}`,
                frames: this.anims.generateFrameNumbers('bunny', { start: animsConfig[dir].start, end: animsConfig[dir].start + 1 }),
                frameRate: 4,
                repeat: -1,
                yoyo: true
            });
        });

        //water animations
        directions.forEach(dir => {
            this.anims.create({
                key: `water_${dir}`,
                frames: this.anims.generateFrameNumbers('bunny', { start: waterAnimsConfig[dir], end: waterAnimsConfig[dir] + 1 }),
                frameRate: 4,
                repeat: 0,
            });
          });
        
    }

    // Helper functions for water collection and plant watering
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