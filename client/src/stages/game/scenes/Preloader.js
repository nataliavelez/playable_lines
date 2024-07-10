import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        console.log('Preloader: scene');

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;


        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(centerX, centerY, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(centerX-230, centerY, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        // Load assets
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
        this.load.tilemapTiledJSON('test-map', 'test_map.json');

        // Spritesheet
        this.load.spritesheet('bunny', 'bunny_spritesheet.png', {
            frameWidth: 48,
            frameHeight: 48
        }); 

    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the main game. 
        this.scene.start('Game');
    }
}
