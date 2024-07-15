import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    // Load background image (small size)
    preload() {
        this.load.image('background', 'assets/bg.png');
    }

    // Go to Preloader scence
    create() {
        this.scene.start('Preloader');
    }
}
