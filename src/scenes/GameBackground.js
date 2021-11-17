import Phaser from 'phaser';

import * as Colors from '../consts/Colors';

export default class GameBackground extends Phaser.Scene {
  preload() {}

  create() {
    this.add
      .line(400, 250, 0, 0, 0, 500, 0xffffff, 1)
      .setStrokeStyle(5, Colors.white);

    this.add.circle(400, 250, 50).setStrokeStyle(5, Colors.white, 1);
  }
}
