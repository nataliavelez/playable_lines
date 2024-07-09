import { EventBus } from '../EventBus';
import { Scene, Input } from 'phaser';

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

    handleVisibilityChange = (isVisible) => {
      this.isVisible = isVisible;
    }

    checkGridEngineState() {
      console.log("Checking GridEngine state:");
      console.log("GridEngine initialized:", !!this.gridEngine);
      console.log("Current player ID:", this.playerId);
      if (this.gridEngine) {
          console.log("Characters in GridEngine:", this.gridEngine.getAllCharacters());
          console.log("Current player in GridEngine:", this.gridEngine.hasCharacter(this.playerId));
      }
  }

    create(){
      this.players = [];
      this.playerId = null;
      this.complete = false; // do not touch this! tells Empirica to advance trial

      //tile map
      this.trialTilemap = this.make.tilemap({ key: "test-map" });
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


      this.createPlayerAnimations();

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
            const sprite = this.add.sprite(state.position.x, state.position.y, 'bunny');
            const carrying = state.carrying;
            const score = state.score;
            const name = state.name;
            console.log("Player name:", name);
            sprite.setTint(this.playerColors[state.color]);
            //sprite.tintFill = true;


            // Create water indicator for is carrying
            const indicator = this.add.sprite(48, 20, "indicator");

            // create plumbob (which in this case is rectangle showing active player)
            const plumbob  = this.add.graphics();
            plumbob.lineStyle(2, 0xFFFFFF, .75);
            plumbob.strokeRect(38, 52, 20, 20);
            plumbob.visible = id === this.playerId // only show for active player
            indicator.visible = state.carrying;

            // Create name text
            const nameText = this.add.text(0, -10, name, { fontSize: '12px', fill: '#FFFFFF' });

            // Create container for the plumbob, water indicator, name text and sprite
            const container = this.add.container(state.position.x , state.position.y, [plumbob, sprite, indicator, nameText]);
            //container.setDepth(2);

            this.players[id] = { sprite, container, indicator, carrying, score };
            console.log(`Created sprite for player ${id} at position:`, state.position, `, direction:`, state.direction, `, tint: `, state.color, `, carrying: `, state.carrying, `, score: `, state.score, `, name: `, state.name);

        });

        this.gridEngineConfig = {
          cacheTileCollisions: true,
            characters: Object.entries(this.players).map(([id, player]) => ({
                id,
                sprite: player.sprite,
                container: player.container,
                startPosition: { x: player.container.x , y: player.container.y  },
                speed: 2 // Adjust this value to control movement speed
            }))
        };
        //console.log("GridEngine config:", JSON.stringify(this.gridEngineConfig, null, 2));
            
        this.gridEngine.create(this.trialTilemap, this.gridEngineConfig);

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

          //set position of player now
          //const enterTile = this.gridEngine.getPosition(charId);
          //this.gridEngine.setPosition(charId, enterTile);
      });
  
      this.gridEngine.directionChanged().subscribe(({ charId, direction }) => {
          console.log(`direction changed for ${charId} in direction ${direction}`);
          const player = this.players[charId];
          if (player && player.sprite.anims) {
              player.sprite.anims.play(`idle_${direction}`, true);
          }
      });
  
      this.gridEngine.positionChangeStarted().subscribe(({ charId, exitTile, enterTile }) => {
          console.log(`Position change started for ${charId} from (${exitTile.x}, ${exitTile.y}) to (${enterTile.x}, ${enterTile.y})`)
          const player = this.players[charId];
          if (charId === this.playerId) {
              EventBus.emit('player-state-change', this.playerId, { x: enterTile.x, y: enterTile.y } );
          }
      });

      // currently either (1) it is slow to update if just use positionChangeFinished or 
      // (2) it is synchronous if use started, but doesn't update the player if browswer isn't upen (with Move)
      // (3) it is syncronoss but no animation if use eiter with setPosition
      // need to use movementstopped as it doesn't listen to setPosition.

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

            if (currentPos.x !== state.position.x || currentPos.y !== state.position.y) {
              if (this.isVisible) {
                this.gridEngine.moveTo(id, state.position);
            } else {
                this.gridEngine.setPosition(id, state.position);
            }
            }

            if (currentDirection !== state.direction) {
                this.gridEngine.turnTowards(id, state.direction);
            }

            if (currentlyCarrying !== state.carrying) {
              this.players[id].carrying = state.carrying;
              this.players[id].indicator.visible = state.carrying;
              
              // Play water animation
              this.playWaterAnimation(id, currentDirection);
            }

            //this.gridEngine.setPosition(id, state.position); // updates even when not on screen but jumpy / not a minated
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
          const position = this.gridEngine.getPosition(this.playerId);
          EventBus.emit('player-state-change', this.playerId, {direction: direction});
      }

      // Use space bay to load and unload water
      if (Phaser.Input.Keyboard.JustDown(action)) {
        const position = this.gridEngine.getPosition(this.playerId);
        const currentDirection = this.gridEngine.getFacingDirection(this.playerId);
        let isNowCarrying = player.carrying; // Get current carrying state
        let currentScore = player.score;

        if (!player.carrying && this.nearSource(this.playerId)) {
            isNowCarrying = true;
            player.carrying = true;
            console.log('Picked up water', currentScore);

            // Play animation whens loading water
            this.playWaterAnimation(this.playerId, currentDirection);

        } else if (player.carrying && this.nearTarget(this.playerId)) {
            isNowCarrying = false;
            player.carrying = false;
            currentScore = currentScore + 1; // Increment score
            console.log('Dropped off water, new score:', currentScore);

            // play animation when unloading water
            // For ease of reference, we could have the main player showing the animation regarless of if loading or unloading
            // but the only way we can do that with other players is to add a new "spacebar" item for the playerstate. Prob not worth it. 
            this.playWaterAnimation(this.playerId, currentDirection);
        }

        // Update indicator visibility
        this.players[this.playerId].indicator.visible = isNowCarrying;

        // Update the score in the local game state
        this.players[this.playerId].score = currentScore;

        EventBus.emit('player-state-change', this.playerId, {carrying: isNowCarrying, score: currentScore} );
        

      }
  
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

    getMovementDirection(from, to) {
      if (from.x < to.x) return 'right';
      if (from.x > to.x) return 'left';
      if (from.y < to.y) return 'down';
      if (from.y > to.y) return 'up';
      return null; // default direction
  }

    getStopFrame(direction) {
      switch(direction) {
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
      player.sprite.anims.play('water_' + direction).on(
          'animationcomplete',
          () => {player.sprite.anims.play('idle_' + direction)}
      );
  }

    
}
