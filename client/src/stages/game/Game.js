import { EventBus } from './EventBus';
import { Scene } from 'phaser';

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
        
        // to allow for better updating 
        //this.lastMoveTime = 0;
        //this.moveDelay = 100;
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
          console.log(layer.depth);
      }

      this.initPlayers(this.registry.get("initialPlayerStates"), this.registry.get("playerId"));

      EventBus.emit('current-scene-ready', this);
      EventBus.on('update-player-states', this.updatePlayerStates.bind(this));
      EventBus.on('visibility-change', this.handleVisibilityChange.bind(this));
      //console.log("Game scene created");
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

        this.setupGridEngineEvents();
        //console.log("Characters in GridEngine:", this.gridEngine.getAllCharacters());
    }

    setupGridEngineEvents() {
      this.gridEngine.movementStarted().subscribe(({ charId, direction }) => {
          console.log(`Movement started for ${charId} in direction ${direction}`);
          const player = this.players[charId];
          if (player && player.sprite.anims) {
              player.sprite.anims.play(`walk_${direction}`, true);
          }
      });
  
      this.gridEngine.movementStopped().subscribe(({ charId, direction }) => {
          console.log(`Movement stopped for ${charId} in direction ${direction}`);
          const player = this.players[charId];

          //animations
          if (player && player.sprite.anims) {
              player.sprite.anims.stop();
              player.sprite.anims.play(`idle_${direction}`, true);
          }  

      });
  
      this.gridEngine.directionChanged().subscribe(({ charId, direction }) => {
          console.log(`direction changed for ${charId} in direction ${direction}`);
          const player = this.players[charId];
          if (player && player.sprite.anims) {
              player.sprite.anims.play(`idle_${direction}`, true);
          }
          if (charId === this.playerId) {
            EventBus.emit('player-state-change', this.playerId, { direction: direction } );
        }
      });
  
      this.gridEngine.positionChangeStarted().subscribe(({ charId, exitTile, enterTile }) => {
          console.log(`Position change started for ${charId} from (${exitTile.x}, ${exitTile.y}) to (${enterTile.x}, ${enterTile.y})`)
          const direction = this.gridEngine.getFacingDirection(charId);
          if (charId === this.playerId) {
              EventBus.emit('player-state-change', this.playerId, { x: enterTile.x, y: enterTile.y, direction: direction } );
          }
      });

    }

  // Gets states for all other players from empirica and does stuff in the game with them
    updatePlayerStates(playerStates) {
      console.log("Updating player states:", playerStates);
      //this means that updates happen in order of player id (might want to randomise or something.)
      Object.entries(playerStates).forEach(([id, state]) => {
          if (id !== this.playerId && this.gridEngine.hasCharacter(id)) {
            const currentPos = this.gridEngine.getPosition(id);
            const currentDirection = this.gridEngine.getFacingDirection(id);
            const currentlyCarrying = this.isCarrying(id);

            if (currentPos.x !== state.position.x || currentPos.y !== state.position.y || currentDirection !== state.direction) {
              if (this.canMoveTo(id, state.position)) {
                  // Set position first
                this.gridEngine.setPosition(id, state.position);
                this.playMoveAnimation(id, currentDirection);
              }
            }

                  // Immediately set direction after position
            if (currentDirection !== state.direction) {
                this.gridEngine.turnTowards(id, state.direction);
            }

                  // Play movement animation with the new direction
                  this.playMoveAnimation(id, state.direction);
              }
          }

            if (currentlyCarrying !== state.carrying) {
              this.players[id].carrying = state.carrying;
              this.players[id].indicator.visible = state.carrying;
              
              // Play water animation
              this.playWaterAnimation(id, currentDirection);
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
      
        if (cursors.left.isDown) { 
          direction = "left";
        } else if (cursors.right.isDown) {
            direction = "right";
        } else if (cursors.up.isDown) {
            direction = "up";
        } else if (cursors.down.isDown) {
            direction = "down";
        }
  
      if (direction) {
          this.gridEngine.move(this.playerId, direction);
      }

      // Use space bay to load and unload water
      if (Phaser.Input.Keyboard.JustDown(action)) {
        const currentDirection = this.gridEngine.getFacingDirection(this.playerId);

        if (!player.carrying && this.nearSource(this.playerId)) {
            player.carrying = true;
            EventBus.emit('player-state-change', this.playerId, {carrying: player.carrying});

            // Play animation whens loading water
            this.playWaterAnimation(this.playerId, currentDirection);

        } else if (player.carrying && this.nearTarget(this.playerId)) {
            player.carrying = false;
            player.score = player.score + 1; // Increment score
            //player.score = currentScore; //update in local game
            
            // Emit the updated score in playerStates
            EventBus.emit('player-state-change', this.playerId, {
              carrying: player.carrying, 
              score: player.score
          });

            // play animation when unloading water
            // placing here means that main player can NOT do the animation whenever they press spacebar (like others who can only when loading or unloading)
            // regardless of if they are near a target or not. Putting belwo allows them to do it whenever (but not other players).
            this.playWaterAnimation(this.playerId, currentDirection);
        }

        // Update indicator visibility
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
    canMoveTo(id, newPosition) {
      // Check if the new position is within the map bounds
      if (newPosition.x < 0 || newPosition.y < 0 || 
          newPosition.x >= this.trialTilemap.width || newPosition.y >= this.trialTilemap.height) {
        return false;
      }

      // Check for collisions with map objects
      const collisionLayers = this.trialTilemap.layers.filter(layer => layer.properties.collides);
      for (const layer of collisionLayers) {
        const tile = this.trialTilemap.getTileAt(newPosition.x, newPosition.y, false, layer.name);
        if (tile && tile.properties.collides) {
          return false;
        }
      }

      // Check for collisions with other players
      for (const playerId in this.players) {
        if (playerId !== id) {
          const playerPos = this.gridEngine.getPosition(playerId);
          if (playerPos.x === newPosition.x && playerPos.y === newPosition.y) {
            return false;
          }
        }
      }

      return true;
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

    handleVisibilityChange = (isVisible) => {
      this.isVisible = isVisible;
    }
    
}
