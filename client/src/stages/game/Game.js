import { EventBus } from './EventBus';
import { Scene } from 'phaser';
import _ from 'lodash';
//import Phaser from 'phaser';

export class Game extends Scene {
    constructor () {
        super('Game');
        this.isVisible = true;

        // TO DO, move this elswhere, prob just need to have the numbers in the vallback
        this.playerColors = {
          white: 0xFFFFFF,  // White (default)
          red: 0xFF0000,  // Red
          green: 0x00FF00,  // Green
          blue: 0x0000FF,  // Blue
          yellow: 0xFFFF00,  // Yellow
          cyan: 0x00FFFF,  // Cyan
          orange: 0xFF8000,  // Orange
          purple: 0x8000FF   // Purple
        };
      
    }

    createWaitingOverlay() {
      // Create semi-transparent black overlay
      this.waitingOverlay = this.add.rectangle(0, 0, 
          this.cameras.main.width, 
          this.cameras.main.height, 
          0x000000, 0.7);
      this.waitingOverlay.setOrigin(0);
      this.waitingOverlay.setDepth(999);  // High depth to appear on top
  
      // Create "Waiting for players" text
      this.waitingText = this.add.text(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2,
          'Waiting for all players...',
          {
              font: '24px Arial',
              fill: '#ffffff'
          }
      );
      this.waitingText.setOrigin(0.5);
      this.waitingText.setDepth(1000);  // Even higher depth than overlay
    }

    setWaitingState(isWaiting) {
      console.log('Setting waiting state:', isWaiting);
      if (this.waitingOverlay && this.waitingText) {
          this.waitingOverlay.visible = isWaiting;
          this.waitingText.visible = isWaiting;
          
          // Disable input while waiting
          this.input.keyboard.enabled = !isWaiting;
      }
    }

    shutdown() {
      // Clear all event listeners
      this.events.removeAllListeners();
      
      // Clear sounds
      if (this.othersSuccessSound) {
          this.othersSuccessSound.destroy();
      }
      
      // Clear grid engine
      if (this.gridEngine) {
          this.gridEngine.removeAllCharacters();
      }

      // Clear player references
      this.players = {};
      this.playerId = null;

  }

    init() {
      // get map name from registry
      this.mapName = this.registry.get('mapName');
      this.mapFileName = `maps/${this.mapName}.json`;
    }

    preload() { 
      this.load.setPath('assets');

      // Tile Images
      this.load.image('Water_1', 'Water_1.png');
      this.load.image('Grass_tiles_v2', 'Grass_tiles_v2.png');
      this.load.image('Water well', 'Water well.png');
      this.load.image('Farming Plants', 'Farming Plants.png');
      this.load.image('Tilled_Dirt', 'Tilled_Dirt.png');
      this.load.image('Fences', 'Fences.png');
      this.load.image('Mushrooms, Flowers, Stones', 'Mushrooms, Flowers, Stones.png');
      this.load.image('Trees, stumps and bushes', 'Trees, stumps and bushes.png');
      this.load.image('indicator', 'water_ready.png');
      
      // Tile Maps
      this.load.tilemapTiledJSON(this.mapName, this.mapFileName);

      // Spritesheet
      this.load.spritesheet('bunny', 'bunny_spritesheet.png', {
          frameWidth: 48,
          frameHeight: 48
      }); 

      // Sounds
      this.load.audio('success', '352661__foolboymedia__complete-chime.mp3');
      this.load.audio('othersSuccess', '342759__rhodesmas__score-counter-01.wav');
      this.load.audio('collectWater', '135936__bradwesson__collectcoin.wav');
    }

    create(){
      this.players = [];
      this.playerId = null;
      this.complete = false; // do not touch this! tells Empirica to advance trial

      //tile map
      this.trialTilemap = this.make.tilemap({ key: this.registry.get('mapName') });
      this.tilesets = this.trialTilemap.tilesets.map(tileset => tileset.name);
      this.tilesets.forEach(tileset => {
          this.trialTilemap.addTilesetImage(tileset);
      });
      
      //layers
      for (let i = 0; i < this.trialTilemap.layers.length; i++) {
          const layer = this.trialTilemap.createLayer(i, this.tilesets, 0, 0);
          layer.scale = 2;
          
          if (this.trialTilemap.layers[i].name == 'Top View') {
            layer.depth = 10;
          }
          //console.log(layer.depth);
      }

      // Sounds
      this.collectWaterSound = this.sound.add('collectWater');
      this.successSound = this.sound.add('success');
      this.othersSuccessSound = this.sound.add('othersSuccess');

      this.initPlayers(this.registry.get("initialPlayerStates"), this.registry.get("playerId"));

      EventBus.emit('current-scene-ready', this);
      EventBus.on('update-player-states', this.updatePlayerStates.bind(this));
      EventBus.on('visibility-change', this.handleVisibilityChange.bind(this));
      //console.log("Game scene created");

     // Get playerId from registry first
     this.playerId = this.registry.get("playerId");
  }
      
    initPlayers(playerStates, currentPlayerId) {
        this.playerId = currentPlayerId;
        this.player = this.players[currentPlayerId];
        //console.log("Current player ID:", this.playerId)
        //console.log("Initializing players:", playerStates);

        Object.entries(playerStates).forEach(([id, state]) => {
            const sprite = this.add.sprite(0, 0, 'bunny');
            const carrying = state.carrying;
            const score = state.score;
            const name = state.name;

            sprite.setTint(this.playerColors[state.color]);
            sprite.setScale(2); // set size of sprite 
            sprite.setDepth(1); // set depth of sprite


            // Create water indicator for is carrying
            const indicator = this.add.sprite(48, 25, "indicator");

            // create plumbob (which in this case is rectangle showing active player)
            const plumbob = this.add.graphics();
            plumbob.lineStyle(2, 0xFFFFFF, .75);  
            plumbob.strokeRect(38, 52, 20, 20);
            plumbob.visible = id === this.playerId // only show for active player
            indicator.visible = state.carrying;

            // Create name text
            const nameText = this.add.text(48, 10, name, { fontSize: '12px', fill: '#FFFFFF', fontStyle: 'bold'});
            nameText.setOrigin(0.5, 0.5); // Center the text horizontally

            // Create container for the plumbob, water indicator, name text and sprite
            const container = this.add.container(state.position.x, state.position.y, [plumbob, sprite, indicator, nameText]);

            this.players[id] = { sprite, container, indicator, carrying, score };
            console.log(`Created sprite for player ${id} at position:`, state.position, `, direction:`, state.direction, `, tint: `, state.color, `, carrying: `, state.carrying, `, score: `, state.score, `, name: `, state.name);

        });

        this.gridEngineConfig = {
          cacheTileCollisions: true,
            characters: Object.entries(this.players).map(([id, player]) => ({
                id,
                sprite: player.sprite,
                container: player.container,
                offsetY: 16,
                //offsetx: 16,
                startPosition: { x: player.container.x , y: player.container.y  },
                speed: 2.5 // Adjust this value to control movement speed
            }))
        };
        //console.log("GridEngine config:", JSON.stringify(this.gridEngineConfig, null, 2));
            
        this.gridEngine.create(this.trialTilemap, this.gridEngineConfig);

        //create animations
        this.createPlayerAnimations();

        //play idle animation on start
        Object.entries(this.players).forEach(([id, player]) => {
          const direction = playerStates[id].direction || 'down';
          player.sprite.play(`idle_${direction}`);
      });

        //console.log("Characters in GridEngine:", this.gridEngine.getAllCharacters());
    }


    // Gets states for all other players from empirica and does stuff in the game with them
    updatePlayerStates(playerStates) {
      Object.entries(playerStates).forEach(([id, state]) => {
        if (id !== this.playerId && this.gridEngine.hasCharacter(id)) {
          const currentPos = this.gridEngine.getPosition(id);
          const currentDirection = this.gridEngine.getFacingDirection(id);
          const currentlyCarrying = this.isCarrying(id);

          // Handle position and direction changes
          if (currentPos.x !== state.position.x || currentPos.y !== state.position.y) {
              // Only update position if the tile isn't blocked
              if (!this.gridEngine.isTileBlocked(state.position)) {
                  this.gridEngine.setPosition(id, state.position);
                  
                  // Play movement animation
                  this.playMoveAnimation(id, state.direction);
              }
          }

          // Handle direction changes separately
          if (currentDirection !== state.direction) {
              this.gridEngine.turnTowards(id, state.direction);
          }

          // Handle carrying state changes
          if (currentlyCarrying !== state.carrying) {
              this.players[id].carrying = state.carrying;
              this.players[id].indicator.visible = state.carrying;
              
              // Play water animation
              this.playWaterAnimation(id, currentDirection);
              
              // Handle water drop-off effects
              if (!state.carrying) {
                  const position = this.gridEngine.getFacingPosition(id);
                  this.createSparkleEffect(position.x, position.y);
                  
                  // Play sound if visible and sound system is ready
                  if (this.isVisible && this.othersSuccessSound) {
                      try {
                          this.othersSuccessSound.play();
                      } catch (error) {
                          console.warn('⚠️ Failed to play sound:', error);
                      }
                  }
              }
          }
      });
    }

    update() {
      if (!this.playerId) return;
  
      const cursors = this.input.keyboard.createCursorKeys();
      const action = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
      let direction = null;
      let player = this.players[this.playerId];

              if (cursors.left.isDown) direction = "left";
              else if (cursors.right.isDown) direction = "right";
              else if (cursors.up.isDown) direction = "up";
              else if (cursors.down.isDown) direction = "down";
  
              if (direction) {
                  const currentPos = this.gridEngine.getPosition(this.playerId);
                  const currentDirection = this.gridEngine.getFacingDirection(this.playerId);
                  const newPosition = this.getNewPosition(currentPos, direction);
  
                      // Move player if tile is not blocked
          this.gridEngine.move(this.playerId, direction);
          EventBus.emit("moveRequest", {
              curPos: currentPos,
              newPos: newPosition,
                      direction: direction
                  });

              }
  
      // Handle spacebar action for carrying water
      if (Phaser.Input.Keyboard.JustDown(action)) {
          const currentDirection = this.gridEngine.getFacingDirection(this.playerId);
          const facingPosition = this.gridEngine.getFacingPosition(this.playerId);
  
          if (!player.carrying && this.nearSource(this.playerId)) {
              player.carrying = true;
              EventBus.emit('player-state-change', this.playerId, { carrying: player.carrying });
  
              this.playWaterAnimation(this.playerId, currentDirection);
              this.collectWaterSound.play();
  
          } else if (player.carrying && this.nearTarget(this.playerId)) {
              player.carrying = false;
              player.score = player.score + 1;
  
              EventBus.emit('player-state-change', this.playerId, {
                  carrying: player.carrying,
                  score: player.score
              });
  
              this.playWaterAnimation(this.playerId, currentDirection);
              this.createSparkleEffect(facingPosition.x, facingPosition.y);
              this.successSound.play();
          }
  
          player.indicator.visible = player.carrying;
      }
  }
  
  
  


    createPlayerAnimations() {
      console.log("Creating player animations")
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
          // Walking animations
          this.anims.create({
              key: `walk_${dir}`,
              frames: this.anims.generateFrameNumbers('bunny', animsConfig[dir]),
              frameRate: 8,
              repeat: -1,
          });

          // Idle animations (using the first frame of each direction)
          this.anims.create({
              key: `idle_${dir}`,
              frames: this.anims.generateFrameNumbers('bunny', { start: animsConfig[dir].start, end: animsConfig[dir].start + 1 }),
              frameRate: 4,
              repeat: -1,
              yoyo: true
          });
      });

      // Water animations
      directions.forEach(dir => {
        this.anims.create({
            key: `water_${dir}`,
            frames: this.anims.generateFrameNumbers('bunny', { start: waterAnimsConfig[dir], end: waterAnimsConfig[dir] + 1 }),
            frameRate: 4,
            repeat: 0,
        });
      });


    }

    //helpers for movement
    canMoveTo(newPosition) {
      return !this.gridEngine.isTileBlocked(newPosition);
    }
  

    getNewPosition(currentPos, direction) {
      switch (direction) {
        case 'left':
          return { x: currentPos.x - 1, y: currentPos.y };
        case 'right':
          return { x: currentPos.x + 1, y: currentPos.y };
        case 'up':
          return { x: currentPos.x, y: currentPos.y - 1 };
        case 'down':
          return { x: currentPos.x, y: currentPos.y + 1 };
        default:
          return currentPos;
      }
    }

    playMoveAnimation(id, direction) {
      const player = this.players[id];
      if (player && player.sprite.anims) {
        player.sprite.anims.play(`walk_${direction}`, true);
        // Stop the walking animation after a short delay
        this.time.delayedCall(250, () => {
          player.sprite.anims.play(`idle_${direction}`, true);
        });
      }
    }

    // helpers for carrying
    nearSource(id) {
      const position = this.gridEngine.getFacingPosition(id);

      return this.trialTilemap.layers.some((layer) => {
        const tile = this.trialTilemap.getTileAt(position.x, position.y, false, layer.name);
        return tile?.properties?.source
      });
    }

    nearTarget(id) {
      const position = this.gridEngine.getFacingPosition(id);

      return this.trialTilemap.layers.some((layer) => {
        const tile = this.trialTilemap.getTileAt(position.x, position.y, false, layer.name);
        return tile?.properties?.target
      });
    }

    isCarrying(id) {
      return this.players[id].carrying;
    }

    playWaterAnimation(id, direction) {
      const player = this.players[id];
      if (player && player.sprite.anims) {
        player.sprite.anims.play('water_' + direction).on(
            'animationcomplete',
            () => {player.sprite.anims.play('idle_' + direction)}
        );
      }
    }

    createSparkleEffect(x, y) {
    // Queue sparkle effect if scene not ready
      if (!this.scene?.manager) {
        this.events.once('update', () => {
            this.createSparkleEffect(x, y);
        });
        return;
      }

      try {
        // Create particle manager
          const emitter = this.add.particles(x*32 + 16, y*32 + 16, 'indicator', {
            x: x,
            y: y,
            lifespan: { min: 600, max: 800 },
            speed: { min: 40, max: 80 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.6, end: 0 },
            quantity: 2,
            frequency: 25,
            emitting: true,
          // particleClass: Phaser.GameObjects.Star,
            tint: [ 0x10a5f5 ],
            alpha: { start: 1, end: 0 },
            blendMode: 'ADD',
            //points: 5,
            //innerRadius: 3,
            //outerRadius: 6,
            rotate: { min: -180, max: 180 },
            gravityY: -20  // Makes particles float upward slightly
        });

        if (emitter) {
          emitter.setDepth(2);
          this.time.delayedCall(750, () => {
              if (emitter && !emitter.destroyed) {
                  emitter.destroy();
              }
          });
        }
      } catch (error) {
        console.warn('Failed to create sparkle effect:', error);
      }
    }

    handleVisibilityChange = (isVisible) => {
      this.isVisible = isVisible;
    }
    
    
}
