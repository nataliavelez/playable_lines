import { EventBus } from '../EventBus';
import { Scene } from 'phaser';


export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    create ()
    {

        this.complete = false;
        this.cloudCityTilemap = this.make.tilemap({ key: "cloud-city-map" });
        this.cloudCityTilemap.addTilesetImage("Cloud City", "tiles");
        for (let i = 0; i < this.cloudCityTilemap.layers.length; i++) {
            const layer = this.cloudCityTilemap.createLayer(i, "Cloud City", 0, 0);
            layer.scale = 3;
        }

        this.playerSprite = this.add.sprite(0, 0, "player");
        this.playerSprite.scale = 1.5;

        this.text = this.add.text(0, -10, "Player 1");
        this.text.setColor("#000000");

        this.goal = this.add.polygon(13*48+24, 7*48+24, [[0,48], [24, 0], [48,48]], 0xffffff);
        //this.goal = this.add.rectangle(13*48+24,7*48+24,48,48,0xffffff,.5);
        this.goal.postFX.addGlow();

        this.container = this.add.container(0, 0, [this.playerSprite, this.text]);
        this.cameras.main.startFollow(this.container, true);
        this.cameras.main.setFollowOffset(-this.playerSprite.width, -this.playerSprite.height);

        this.gridEngineConfig = {
            characters: [
              {
                id: "player",
                sprite: this.playerSprite,
                container: this.container,
                walkingAnimationMapping: 6,
                startPosition: { x: 8, y: 8 },
              },
            ],
          };
        
        this.gridEngine.create(this.cloudCityTilemap, this.gridEngineConfig);
        
        this.gridEngine
        .positionChangeStarted()
        .subscribe(({ charId, enterTile }) => {
          
            EventBus.emit('position-change', enterTile.x, enterTile.y);
            
        });


        this.gridEngine
        .positionChangeStarted()
        .subscribe(({ charId, exitTile, enterTile }) => {
            if ((enterTile.x == 13) & (enterTile.y == 6)) {
                this.cameras.main.fadeOut(1000, 0, 0, 0, function(camera, progress) {
                    if (progress == 1) {
                        this.changeScene();
                    }
                });
            }
        });

        EventBus.emit('current-scene-ready', this);
    }

    update ()
    {
        const cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown) { 
            this.gridEngine.move("player", "left");
        } else if (cursors.right.isDown) {
            this.gridEngine.move("player", "right");
        } else if (cursors.up.isDown) {
            this.gridEngine.move("player", "up");
        } else if (cursors.down.isDown) {
            this.gridEngine.move("player", "down");
        }
        
   
    }

    movePlayer(reactCallback)
    {
        onUpdate: () => {
                    if (reactCallback)
                    {
                        reactCallback({
                            x: Math.floor(this.container.x),
                            y: Math.floor(this.container.y)
                        });
                    }
                }
    }
    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
