import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { GridEngine } from 'grid-engine'

class ReplaySceneClass extends Phaser.Scene {
  constructor() {
    super('ReplayScene')
    this.replayData = null
    this.replayIndex = 0
    this.replayTime = 0
    this.replaySpeed = 1
    this.isPaused = false
  }

  init(data) {
    this.mapName = data.mapName
    this.initialState = data.initialState
    this.updates = data.updates
    console.log(data.mapName)
    console.log(data.initialState)
    console.log(this.updates)

    // Find the earliest timestamp
    this.earliestTimestamp = Math.min(...this.updates.map(update => update.timestamp))

    // Adjust all timestamps relative to the earliest, later won't be necessary when we I record relative timestamps
    this.updates = this.updates.map(update => ({
        ...update,
        adjustedTimestamp: update.timestamp - this.earliestTimestamp
    }))

    this.replayTime = 0;
    this.lastUpdateTime = 0;
    this.totalDuration = Math.max(...this.updates.map(update => update.adjustedTimestamp));
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
    
    this.load.tilemapTiledJSON('map', `maps/${this.mapName}.json`);
    this.load.spritesheet('bunny', 'bunny_spritesheet.png', { frameWidth: 48, frameHeight: 48 });
  }

  create() {
    this.createMap()
    this.initPlayers(this.initialState)
    this.setupControls()
    this.createAnimations()
    this.setupGridEngineEvents()
    this.replayStartTime = this.time.now

    //pause text
    this.pauseText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'REPLAY PAUSED', {
        font: '32px Arial',
        fill: '#ffffff'
    });
    this.pauseText.setOrigin(0.5);
    this.pauseText.setDepth(100); // Ensure it's on top of other game objects
    this.pauseText.visible = false; // Hide it initially

    // dims screen when paused
    this.pauseOverlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000);
    this.pauseOverlay.setOrigin(0);
    this.pauseOverlay.setDepth(99); // Just below the pause text
    this.pauseOverlay.alpha = 0.5;
    this.pauseOverlay.visible = false;

    //create time elapsed text
    this.timerText = this.add.text(10, 10, 'Time: 00:00', {
        font: '24px Arial',
        fill: '#ffffff'
    });
    this.timerText.setDepth(100); // Ensure it's on top of other game objects

    // text to show replay speed
    this.speedText = this.add.text(this.cameras.main.width - 10, 10, 'Speed: 1x', {
        font: '20px Arial',
        fill: '#ffffff'
    });
    this.speedText.setOrigin(1, 0); // Align to top right corner
    this.speedText.setDepth(100); // Ensure it's on top of other game objects
  }

  createMap() {
    this.trialTilemap = this.make.tilemap({ key: "map" });
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
    }

    initPlayers(playerStates) {
        this.players = {};
        Object.entries(playerStates).forEach(([id, state]) => {
            const sprite = this.add.sprite(0, 0, 'bunny');
            sprite.setTint(this.getPlayerColor(state.color));
            sprite.setScale(2);
            sprite.setDepth(1);

            const indicator = this.add.sprite(48, 25, "indicator");
            indicator.visible = state.carrying;

            const nameText = this.add.text(48, 10, state.name, { fontSize: '12px', fill: '#FFFFFF', fontStyle: 'bold'});
            nameText.setOrigin(0.5, 0.5);

            const container = this.add.container(state.position.x, state.position.y, [sprite, indicator, nameText]);

            this.players[id] = { sprite, container, indicator, carrying: state.carrying, score: state.score };
        });

        this.gridEngineConfig = {
            characters: Object.entries(this.players).map(([id, player]) => ({
                id,
                sprite: player.sprite,
                container: player.container,
                offsetY: 16,
                startPosition: { x: player.container.x, y: player.container.y },
            }))
        };

        this.gridEngine.create(this.trialTilemap, this.gridEngineConfig);
    }

    setupGridEngineEvents() {
        this.gridEngine.movementStarted().subscribe(({ charId, direction }) => {
            const player = this.players[charId];
            if (player && player.sprite.anims) {
                player.sprite.anims.play(`walk_${direction}`, true);
            }
        });
    
        this.gridEngine.movementStopped().subscribe(({ charId, direction }) => {
            const player = this.players[charId];
            if (player && player.sprite.anims) {
                player.sprite.anims.stop();
                player.sprite.anims.play(`idle_${direction}`, true);
            }
        });
    }

    setupControls() {
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    
        // Disable key repeat events
        this.input.keyboard.removeCapture(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.keyboard.removeCapture(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.input.keyboard.removeCapture(Phaser.Input.Keyboard.KeyCodes.LEFT);
    }

    createAnimations() {
        const directions = ['up', 'down', 'left', 'right'];
        const animsConfig = {
            up: { start: 4, end: 7 },
            down: { start: 0, end: 3 },
            left: { start: 8, end: 11 },
            right: { start: 12, end: 15 }
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
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseText.visible = this.isPaused;
        this.pauseOverlay.visible = this.isPaused;
    }

    speedUp() {
        this.replaySpeed = Math.min(this.replaySpeed * 2, 8);
        this.updateSpeedDisplay();
    }

    slowDown() {
        this.replaySpeed = Math.max(this.replaySpeed / 2, 0.25);
        this.updateSpeedDisplay();
    }

    update(time, delta) {
        this.handleInput();
        this.updateReplay(time, delta);
    }
    
    handleInput() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.togglePause();
        }
        if (Phaser.Input.Keyboard.JustDown(this.rightKey)) {
            this.speedUp();
        }
        if (Phaser.Input.Keyboard.JustDown(this.leftKey)) {
            this.slowDown();
        }
    }
    
    updateReplay(time, delta) {
        if (!this.isPaused) {
            // Update the replay time based on the updates, not real time
            while (this.replayIndex < this.updates.length &&
                   this.updates[this.replayIndex].adjustedTimestamp <= this.replayTime) {
                const update = this.updates[this.replayIndex];
                this.applyStateChange(update.playerId, update);
                this.lastUpdateTime = update.adjustedTimestamp;
                this.replayIndex++;
            }
    
            // If there are more updates, advance time to the next update
            if (this.replayIndex < this.updates.length) {
                const nextUpdateTime = this.updates[this.replayIndex].adjustedTimestamp;
                this.replayTime = Math.min(this.replayTime + (delta * this.replaySpeed), nextUpdateTime);
            } else {
                // If we've reached the end, set the time to the last update time
                this.replayTime = this.lastUpdateTime;
                this.isPaused = true;
            }
        }
    
        // Update timer display with current time and total duration
        this.timerText.setText(`Time: ${this.formatTime(this.replayTime)} / ${this.formatTime(this.totalDuration)}`);
    }
  
    applyStateChange(playerId, updates) {
        const player = this.players[playerId];
        if (!player) return;

        if (updates.x !== undefined || updates.y !== undefined) {
            const newPos = {
                x: (updates.x !== undefined ? updates.x : player.container.x),
                y: (updates.y !== undefined ? updates.y : player.container.y)
            };
            if (this.replaySpeed && this.replaySpeed > 1) {
                this.gridEngine.setPosition(playerId, { x: newPos.x , y: newPos.y });
            } else {
                this.gridEngine.moveTo(playerId, { x: newPos.x , y: newPos.y });
            }
        }

        if (updates.direction !== undefined) {
            player.sprite.play(`idle_${updates.direction}`);
        }

        if (updates.carrying !== undefined) {
            player.carrying = updates.carrying;
            player.indicator.visible = updates.carrying;
        }

        if (updates.score !== undefined) {
            player.score = updates.score;
        }
    }

    getPlayerColor(colorName) {
        const colors = {
            white: 0xFFFFFF,
            red: 0xFF0000,
            green: 0x00FF00,
            blue: 0x0000FF,
            yellow: 0xFFFF00,
            cyan: 0x00FFFF,
            orange: 0xFF8000,
            purple: 0x8000FF
        };
        return colors[colorName] || colors.white;
    }

    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateSpeedDisplay() {
        this.speedText.setText(`Speed: ${this.replaySpeed}x`);
    }
}

function ReplayScene({ mapName, initialState, updates }) {
  const gameRef = useRef(null)

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 512,
      height: 512,
      parent: 'game-container',
      backgroundColor: '#028af8',
      scene: [ReplaySceneClass],
      plugins: {
        scene: [{
          key: 'gridEngine',
          plugin: GridEngine,
          mapping: 'gridEngine'
        }]
      }
    }

    const game = new Phaser.Game(config)
    game.scene.start('ReplayScene', { mapName, initialState, updates })

    gameRef.current = game

    return () => {
      game.destroy(true)
    }
  }, [mapName, initialState, updates])

  return <div id="game-container" />
}

export default ReplayScene