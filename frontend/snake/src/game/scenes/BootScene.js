import { Scene } from 'phaser'



export default class BootScene extends Scene {
  constructor () {
    super({ key: 'BootScene' })
  }

  preload () {
    this.load.setBaseURL('http://labs.phaser.io');

    this.load.image('food', 'assets/games/snake/food.png');
    this.load.image('body', 'assets/games/snake/body.png');
  }

  create () {
    this.scene.start('PlayScene')
  }
}