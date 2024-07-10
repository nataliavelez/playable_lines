import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        // Get map name
        EventBus.on('set-map-name', (mapName) => {
            this.mapName = mapName;
            this.mapFileName = `${mapName}.json`;
            console.log('Map name in Preloader:', this.mapName);
        });

        //  Show the background image
        this.add.image(512, 384, 'background');

        // Progress bar. 
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.add.rectangle(centerX, centerY, 468, 32).setStrokeStyle(1, 0xffffff); // bar outline.
        const bar = this.add.rectangle(centerX-230, centerY, 4, 28, 0xffffff); //bar
        this.load.on('progress', (progress) => { //  'progress' event emitted by the LoaderPlugin
            bar.width = 4 + (460 * progress); //  Update progress bar (464px = 100%)
        });
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
        this.load.image('indicator', 'water_ready.png');
        
        // Tile Maps
        this.load.tilemapTiledJSON(this.mapName, this.mapFileName);

        // Spritesheet
        this.load.spritesheet('bunny', 'bunny_spritesheet.png', {
            frameWidth: 48,
            frameHeight: 48
        }); 

    }

    create() {
        //  Could create global objects here that the rest of the game can use. i.e. Global animations. 
        //  Move to the main game. 
        this.scene.start('Game');
    }

    shutdown() {
        EventBus.off('set-map-name'); // remove listener to avoid memory leak
    }
}
