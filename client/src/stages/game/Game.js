import { EventBus } from './EventBus';
import { Scene } from 'phaser';
import _ from 'lodash';
import { GameLog } from './GameConfig';
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
        
        // Simple debounce for movement to prevent rapid key presses
        this.lastMoveTime = 0;
        this.moveDebounceTime = 150; // ms between moves
        
        // Player readiness tracking
        this.readyPlayers = new Set();
        this.allPlayersReady = false;
        
        // Safety timeout to remove overlay after a maximum wait time
        this.waitingTimeoutId = null;
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
      GameLog.log('Setting waiting state:', isWaiting);
      
      // Clear any existing waiting timeout
      if (this.waitingTimeoutId) {
        clearTimeout(this.waitingTimeoutId);
        this.waitingTimeoutId = null;
      }
      
      if (this.waitingOverlay && this.waitingText) {
          this.waitingOverlay.visible = isWaiting;
          this.waitingText.visible = isWaiting;
          
          // Disable input while waiting
          this.input.keyboard.enabled = !isWaiting;
          
          // If we're waiting, set a safety timeout
          if (isWaiting) {
            this.waitingTimeoutId = setTimeout(() => {
              GameLog.log('🚨 Safety timeout triggered - forcing game to start');
              this.allPlayersReady = true;
              this.setWaitingState(false);
            }, 10000); // 10 seconds maximum wait time
          }
      }
    }
    
    updateWaitingText(readyCount, totalPlayers) {
      if (this.waitingText) {
        this.waitingText.setText(`Waiting for players...\n${readyCount}/${totalPlayers} ready`);
      }
    }
    
    checkAllPlayersReady() {
      const totalPlayers = Object.keys(this.players || {}).length;
      const readyCount = this.readyPlayers.size;
      
      GameLog.log(`Ready players: ${readyCount}/${totalPlayers}`);
      
      // Update the waiting text
      this.updateWaitingText(readyCount, totalPlayers);
      
      if (totalPlayers > 0 && readyCount === totalPlayers) {
        this.allPlayersReady = true;
        this.setWaitingState(false);
        GameLog.log('All players ready, game starting!');
      }
    }
    
    markPlayerReady(playerId) {
      if (!this.readyPlayers.has(playerId)) {
        GameLog.log(`Marking player ${playerId} as ready`);
        this.readyPlayers.add(playerId);
        
        try {
          // Notify server that this player is ready
          EventBus.emit('playerReady', { playerId });
        } catch (error) {
          GameLog.error('Error emitting playerReady event:', error);
        }
        
        this.checkAllPlayersReady();
      }
    }

    shutdown() {
      // Clear timeout to prevent memory leaks
      if (this.waitingTimeoutId) {
        clearTimeout(this.waitingTimeoutId);
        this.waitingTimeoutId = null;
      }
      
      // Clear all event listeners
      this.events.removeAllListeners();
      
      try {
        // Remove EventBus subscriptions
        EventBus.off('update-player-state', this.updatePlayerState);
        EventBus.off('visibility-change', this.handleVisibilityChange);
        EventBus.off('player-ready', this.handlePlayerReady);
      } catch (error) {
        GameLog.error('Error removing event listeners:', error);
      }
      
      // Reset player readiness tracking
      this.readyPlayers = new Set();
      this.allPlayersReady = false;
      
      // Clear sounds
      if (this.collectWaterSound) this.collectWaterSound.destroy();
      if (this.successSound) this.successSound.destroy();
      if (this.othersSuccessSound) this.othersSuccessSound.destroy();
      
      // Destroy all containers and sprites
      if (this.players) {
        Object.values(this.players).forEach(player => {
          if (player.container) player.container.destroy(true);
          if (player.sprite) player.sprite.destroy(true);
          if (player.indicator) player.indicator.destroy(true);
        });
      }
      
      // Clear grid engine
      if (this.gridEngine) {
        try {
          this.gridEngine.removeAllCharacters();
        } catch (error) {
          GameLog.warn('Failed to remove characters from grid engine:', error);
        }
      }

      // Clear tilemap
      if (this.trialTilemap) {
        this.trialTilemap.destroy();
      }

      // Clear player references
      this.players = {};
      this.playerId = null;
      this.complete = false;

      GameLog.log("Game scene shutdown complete");
    }

    // Add this method to ensure the scene cleans up properly
    destroy() {
      this.shutdown();
      super.destroy();
    }

    init() {
      // get map name from registry
      this.mapName = this.registry.get('mapName');
      this.mapFileName = `maps/${this.mapName}.json`;

      // get speed from regisrty
      this.speed = this.registry.get("speed");
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
      this.readyPlayers = new Set(); // Reset ready players set
      this.allPlayersReady = false; // Reset all players ready flag
      
      // Cache for source and target tiles to avoid repeated lookups
      this.sourceTiles = new Set();
      this.targetTiles = new Set();

      try {
        // Make sure event handlers are bound properly
        this.updatePlayerState = this.updatePlayerState.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handlePlayerReady = this.handlePlayerReady.bind(this);
  
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
        }
        
        // Scan and cache source/target tiles
        this.scanSpecialTiles();
  
        // Sounds
        this.collectWaterSound = this.sound.add('collectWater');
        this.successSound = this.sound.add('success');
        this.othersSuccessSound = this.sound.add('othersSuccess');
  
        // Remove any existing event listeners before setting up new ones
        EventBus.off('update-player-state', this.updatePlayerState);
        EventBus.off('visibility-change', this.handleVisibilityChange);
        EventBus.off('player-ready', this.handlePlayerReady);
  
        // Get playerId from registry first 
        this.playerId = this.registry.get("playerId");
        
        // Initialize players from registry
        this.initPlayers(this.registry.get("initialPlayerStates"), this.playerId);
  
        // Create waiting overlay and show it until all players are ready
        this.createWaitingOverlay();
        const totalPlayers = Object.keys(this.players || {}).length;
        this.updateWaitingText(0, totalPlayers);
        this.setWaitingState(true);
        
        // Set up event listeners
        EventBus.emit('current-scene-ready', this);
        EventBus.on('update-player-state', this.updatePlayerState);
        EventBus.on('visibility-change', this.handleVisibilityChange);
        EventBus.on('player-ready', this.handlePlayerReady);
        
        GameLog.log("Game scene created with map:", this.registry.get('mapName'));
        
        // Mark this player as ready after a short delay
        // This gives time for the scene to fully load
        setTimeout(() => {
          if (this.scene && this.scene.isActive() && this.playerId) {
            try {
              this.markPlayerReady(this.playerId);
            } catch (error) {
              GameLog.error('Error marking player ready:', error);
              // Force ready state after error
              this.allPlayersReady = true;
              this.setWaitingState(false);
            }
          }
        }, 1500);
      } catch (error) {
        GameLog.error('Error in create method:', error);
        // If there's any error in setup, force the game to start anyway
        this.allPlayersReady = true;
        if (this.waitingOverlay) {
          this.waitingOverlay.visible = false;
        }
        if (this.waitingText) {
          this.waitingText.visible = false;
        }
        if (this.input && this.input.keyboard) {
          this.input.keyboard.enabled = true;
        }
      }
    }

    initPlayers(playerStates, currentPlayerId) {
        this.playerId = currentPlayerId;
        this.player = this.players[currentPlayerId];
        
        GameLog.log(`Initializing players for round with states:`, JSON.stringify(playerStates));

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
            
            // Explicitly log carrying state for debugging
            GameLog.log(`Player ${id} initialized with carrying=${carrying}, score=${score}`);
        });

        this.gridEngineConfig = {
          cacheTileCollisions: true,
            characters: Object.entries(this.players).map(([id, player]) => ({
                id,
                sprite: player.sprite,
                container: player.container,
                offsetY: 16,
                startPosition: { x: player.container.x , y: player.container.y  },
                speed: this.speed
            }))
        };
            
        this.gridEngine.create(this.trialTilemap, this.gridEngineConfig);

        //create animations
        this.createPlayerAnimations();

        //play idle animation on start
        Object.entries(this.players).forEach(([id, player]) => {
          const direction = playerStates[id].direction || 'down';
          player.sprite.play(`idle_${direction}`);
        });
    }

    // Gets states for a single player from empirica and updates that player
    updatePlayerState(payload) {
        const { id, changes, state } = payload;
        
        // Support both new format (changes) and old format (state) for backward compatibility
        const playerChanges = changes || state;
        
        if (!playerChanges || !this.gridEngine || !this.gridEngine.hasCharacter(id)) {
            GameLog.warn(`updatePlayerState: Invalid payload or player not in grid engine - id: ${id}`);
            return;
        }
        
        const currentPos = this.gridEngine.getPosition(id);
        const currentDirection = this.gridEngine.getFacingDirection(id);
        const currentlyCarrying = this.isCarrying(id);

        GameLog.log(`updatePlayerState: Updating player ${id}, current carrying: ${currentlyCarrying}, changes:`, JSON.stringify(playerChanges));

        // Handle position and direction changes
        if (playerChanges.position && (currentPos.x !== playerChanges.position.x || currentPos.y !== playerChanges.position.y)) {
            if (id === this.playerId) {
                // Local player moves smoothly
                if (this.isVisible) {
                    this.gridEngine.move(id, playerChanges.direction);
                    this.playMoveAnimation(id, playerChanges.direction);
                }
            } else { 
                // Remote players teleport to maintain sync
                this.gridEngine.setPosition(id, playerChanges.position);
                if (this.isVisible) {
                    this.playMoveAnimation(id, playerChanges.direction);
                }
            }
        }
        
        // Always update direction to ensure sync
        if (playerChanges.direction && currentDirection !== playerChanges.direction) {
            this.gridEngine.turnTowards(id, playerChanges.direction);
            if (!this.gridEngine.isMoving(id)) {
                this.players[id].sprite.play(`idle_${playerChanges.direction}`);
            }
        }

        // Handle carrying state changes - this is where water pickup is managed
        if (playerChanges.carrying !== undefined) {
            // Check if there's an actual change 
            const carryingChanged = currentlyCarrying !== playerChanges.carrying;
            
            // ALWAYS update local state regardless of whether it changed
            this.players[id].carrying = playerChanges.carrying;
            this.players[id].indicator.visible = playerChanges.carrying;
            
            GameLog.log(`🚰 Game: Player ${id} carrying set to ${playerChanges.carrying}, changed: ${carryingChanged}`);
            
            // Update score when it changes with carrying state
            if (playerChanges.score !== undefined && playerChanges.score !== this.players[id].score) {
                GameLog.log(`Player ${id} score updated: ${this.players[id].score} -> ${playerChanges.score}`);
                this.players[id].score = playerChanges.score;
            }
            
            // Only play effects if the carrying state actually changed
            if (carryingChanged) {
                GameLog.log(`🚰 Game: Playing water effects for player ${id}`);
                const currentDirection = this.gridEngine.getFacingDirection(id);
                
                // Play water animation
                this.playWaterAnimation(id, currentDirection);
                
                // Handle pickup/dropoff effects
                if (playerChanges.carrying) {
                    // Pickup effects
                    if (id === this.playerId) {
                        this.collectWaterSound.play();
                    }
                } else {
                    // Dropoff effects
                    const position = this.gridEngine.getFacingPosition(id);
                    this.createSparkleEffect(position.x, position.y);
                    
                    if (this.isVisible) {
                        if (id === this.playerId) {
                            this.successSound.play();
                        } else if (this.othersSuccessSound) {
                            try {
                                this.othersSuccessSound.play();
                            } catch (error) {
                                GameLog.warn('⚠️ Failed to play sound:', error);
                            }
                        }
                    }
                }
            }
        }
    }

    update() {
      if (!this.playerId || !this.allPlayersReady) return;
  
      // Movement
      const cursors = this.input.keyboard.createCursorKeys();
      const currentTime = this.time.now;
      
      // Only process movement if enough time has passed since the last move
      if (!this.gridEngine.isMoving(this.playerId) && 
          (currentTime - this.lastMoveTime > this.moveDebounceTime)) {
        let direction = null;
        if (cursors.left.isDown) direction = "left";
        else if (cursors.right.isDown) direction = "right";
        else if (cursors.up.isDown) direction = "up";
        else if (cursors.down.isDown) direction = "down";

        if (direction) {
          const currentPos = this.gridEngine.getPosition(this.playerId);
          const currentDirection = this.gridEngine.getFacingDirection(this.playerId);
          const newPosition = this.getNewPosition(currentPos, direction);

          // Only emit moveRequest if we're changing position or direction
          if (currentDirection !== direction || 
            currentPos.x !== newPosition.x || 
            currentPos.y !== newPosition.y) {
            
            // Update the last move time
            this.lastMoveTime = currentTime;
            
            EventBus.emit("moveRequest", {
                curPos: currentPos,
                newPos: newPosition,
                direction: direction
            });
          }
        }
      }
  
      // Water Carrying
      let player = this.players[this.playerId];
      const action = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      if (Phaser.Input.Keyboard.JustDown(action)) {
          const isNearSource = this.nearSource(this.playerId);
          const isNearTarget = this.nearTarget(this.playerId);
          const isCarrying = player.carrying;
          
          GameLog.log(`🚰 Water action attempted - Near source: ${isNearSource}, Near target: ${isNearTarget}, Carrying: ${isCarrying}`);
          
          if (!isCarrying && isNearSource) {
              // Request pickup
              GameLog.log(`🚰 Attempting water pickup for player ${this.playerId}`);
              try {
                  // Store current state for verification
                  const initialCarrying = player.carrying;
                  const verificationTime = Date.now();
                  
                  EventBus.emit('waterAction', {
                      carrying: true
                  });
                  GameLog.log(`🚰 Water pickup event emitted successfully`);
                  
                  // Add verification check after a delay
                  setTimeout(() => {
                      const currentCarrying = this.players[this.playerId].carrying;
                      GameLog.log(`🚰 Verifying water pickup: was ${initialCarrying}, now ${currentCarrying}, elapsed ${Date.now() - verificationTime}ms`);
                      
                      // If the carrying state hasn't changed after 1 second, try again
                      if (!currentCarrying && Date.now() - verificationTime > 1000) {
                          GameLog.log(`🚰 Water pickup verification failed, retrying`);
                          EventBus.emit('waterAction', {
                              carrying: true,
                              retryCount: 1
                          });
                      }
                  }, 1000);
              } catch (error) {
                  GameLog.error('Error emitting water pickup event:', error);
              }
          } else if (isCarrying && isNearTarget) {
              // Request dropoff
              GameLog.log(`🚰 Attempting water dropoff for player ${this.playerId}`);
              try {
                  // Store current state for verification
                  const initialCarrying = player.carrying;
                  const initialScore = player.score;
                  const verificationTime = Date.now();
                  
                  EventBus.emit('waterAction', {
                      carrying: false,
                      score: player.score + 1
                  });
                  GameLog.log(`🚰 Water dropoff event emitted successfully`);
                  
                  // Add verification check after a delay
                  setTimeout(() => {
                      const currentCarrying = this.players[this.playerId].carrying;
                      const currentScore = this.players[this.playerId].score;
                      GameLog.log(`🚰 Verifying water dropoff: carrying was ${initialCarrying}, now ${currentCarrying}, score was ${initialScore}, now ${currentScore}, elapsed ${Date.now() - verificationTime}ms`);
                      
                      // If the carrying state hasn't changed after 1 second, try again
                      if (currentCarrying && Date.now() - verificationTime > 1000) {
                          GameLog.log(`🚰 Water dropoff verification failed, retrying`);
                          EventBus.emit('waterAction', {
                              carrying: false,
                              score: player.score + 1,
                              retryCount: 1
                          });
                      }
                  }, 1000);
              } catch (error) {
                  GameLog.error('Error emitting water dropoff event:', error);
              }
          } else {
              GameLog.log(`🚰 Water action conditions not met - nothing happened`);
          }
      }

  }
  
  
  


    createPlayerAnimations() {
      GameLog.log("Creating player animations")
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
              frameRate: this.speed * 4,
              repeat: 0
          });

          // Idle animations (using the first frame of each direction)
          this.anims.create({
              key: `idle_${dir}`,
              frames: this.anims.generateFrameNumbers('bunny', { start: animsConfig[dir].start, end: animsConfig[dir].start + 1 }),
              frameRate: this.speed * 2,
              repeat: -1,
              yoyo: true
          });
      });

      // Water animations
      directions.forEach(dir => {
        this.anims.create({
            key: `water_${dir}`,
            frames: this.anims.generateFrameNumbers('bunny', { start: waterAnimsConfig[dir], end: waterAnimsConfig[dir] + 1 }),
            frameRate: this.speed * 2,
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
        player.sprite.anims.play(`walk_${direction}`).on(
          'animationcomplete',
          () => {player.sprite.anims.play('idle_' + direction)}
      );
      }
    }
    

    // helpers for carrying
    nearSource(id) {
      try {
        const position = this.gridEngine.getFacingPosition(id);
        let foundSource = false;
        
        // First do a debug check
        if (!this.trialTilemap || !this.trialTilemap.layers) {
          GameLog.error('nearSource: trialTilemap or layers is undefined');
          return false;
        }

        // Log the position we're checking
        GameLog.log(`Checking for source at position: (${position.x}, ${position.y})`);
        
        for (let i = 0; i < this.trialTilemap.layers.length; i++) {
          const layer = this.trialTilemap.layers[i];
          const tile = this.trialTilemap.getTileAt(position.x, position.y, false, layer.name);
          
          if (tile) {
            // Log tile info for debugging
            if (tile.properties) {
              GameLog.log(`Tile at (${position.x}, ${position.y}) in layer ${layer.name} has properties:`, 
                         JSON.stringify(tile.properties));
            } else {
              GameLog.log(`Tile at (${position.x}, ${position.y}) in layer ${layer.name} has no properties`);
            }
            
            if (tile.properties && tile.properties.source) {
              foundSource = true;
              break;
            }
          }
        }
        
        return foundSource;
      } catch (error) {
        GameLog.error('Error in nearSource:', error);
        return false;
      }
    }

    nearTarget(id) {
      try {
        const position = this.gridEngine.getFacingPosition(id);
        let foundTarget = false;
        
        // First do a debug check
        if (!this.trialTilemap || !this.trialTilemap.layers) {
          GameLog.error('nearTarget: trialTilemap or layers is undefined');
          return false;
        }
        
        for (let i = 0; i < this.trialTilemap.layers.length; i++) {
          const layer = this.trialTilemap.layers[i];
          const tile = this.trialTilemap.getTileAt(position.x, position.y, false, layer.name);
          
          if (tile && tile.properties && tile.properties.target) {
            foundTarget = true;
            break;
          }
        }
        
        return foundTarget;
      } catch (error) {
        GameLog.error('Error in nearTarget:', error);
        return false;
      }
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
        GameLog.warn('Failed to create sparkle effect:', error);
      }
    }

    handleVisibilityChange = (isVisible) => {
      this.isVisible = isVisible;
    }
    
    handlePlayerReady = (data) => {
      try {
        const { id, readyCount, totalPlayers, reset, roundNumber } = data;
        
        GameLog.log(`Received player ready event:`, data);
        
        // If this is a reset signal, clear all ready players
        if (reset) {
          GameLog.log(`Resetting ready players for round ${roundNumber || 'unknown'}`);
          this.readyPlayers.clear();
          this.allPlayersReady = false;
          this.updateWaitingText(0, totalPlayers);
          this.setWaitingState(true);
          return;
        }
        
        // Add this player to our local ready set
        if (id && !this.readyPlayers.has(id)) {
          GameLog.log(`Player ${id} is ready from server notification`);
          this.readyPlayers.add(id);
        }
        
        // Update UI with server's count if provided
        if (readyCount !== undefined && totalPlayers !== undefined) {
          GameLog.log(`Ready status from server: ${readyCount}/${totalPlayers}`);
          this.updateWaitingText(readyCount, totalPlayers);
          
          // If all players are ready according to the server, enable game
          if (readyCount === totalPlayers) {
            this.allPlayersReady = true;
            this.setWaitingState(false);
            GameLog.log('All players ready according to server, game starting!');
          }
        } else {
          // Fall back to local check if server counts not provided
          this.checkAllPlayersReady();
        }
      } catch (error) {
        GameLog.error('Error handling player ready event:', error);
        // Force ready state after error
        this.allPlayersReady = true;
        this.setWaitingState(false);
      }
    }

    // Scan and cache all source and target tiles
    scanSpecialTiles() {
      try {
        if (!this.trialTilemap || !this.trialTilemap.layers) {
          GameLog.error('scanSpecialTiles: trialTilemap or layers is undefined');
          return;
        }
        
        // Clear existing caches
        this.sourceTiles = new Set();
        this.targetTiles = new Set();
        
        // Log tilemap data for debugging
        GameLog.log(`Scanning tilemap: ${this.registry.get('mapName')}`);
        GameLog.log(`Tilemap has ${this.trialTilemap.layers.length} layers`);
        
        // Scan all tiles in all layers
        for (let layerIndex = 0; layerIndex < this.trialTilemap.layers.length; layerIndex++) {
          const layer = this.trialTilemap.layers[layerIndex];
          GameLog.log(`Scanning layer: ${layer.name}`);
          
          // Loop through all tiles in the layer
          for (let y = 0; y < this.trialTilemap.height; y++) {
            for (let x = 0; x < this.trialTilemap.width; x++) {
              const tile = this.trialTilemap.getTileAt(x, y, false, layer.name);
              
              if (tile && tile.properties) {
                if (tile.properties.source) {
                  this.sourceTiles.add(`${x},${y}`);
                  GameLog.log(`Found source tile at (${x}, ${y}) in layer ${layer.name}`);
                }
                if (tile.properties.target) {
                  this.targetTiles.add(`${x},${y}`);
                  GameLog.log(`Found target tile at (${x}, ${y}) in layer ${layer.name}`);
                }
              }
            }
          }
        }
        
        GameLog.log(`Found ${this.sourceTiles.size} source tiles and ${this.targetTiles.size} target tiles`);
      } catch (error) {
        GameLog.error('Error scanning special tiles:', error);
      }
    }
}
