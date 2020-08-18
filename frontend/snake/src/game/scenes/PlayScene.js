import { Scene } from 'phaser'
import { update,create } from '../snake'

export default class PlayScene extends Scene {
  constructor () {
    super({ key: 'PlayScene' })
  }

  create () {
    create(this);
  }

  update (time) {
      update(time);
  }
}