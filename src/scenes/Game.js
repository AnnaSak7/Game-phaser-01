import Phaser from 'phaser';

import { GameBackground, GameOver } from '../consts/SceneKeys';

import * as Colors from '../consts/Colors';

import { PressStart2P } from '../consts/Fonts';

const GameState = {
  Running: 'running',
  PlayerWon: 'player-won',
  AIWon: 'ai-won',
};

class Game extends Phaser.Scene {
  init() {
    this.gameState = GameState.Running;
    this.paddleRightVelocity = new Phaser.Math.Vector2(0, 0);

    this.leftScore = 0;
    this.rightScore = 0;
  }

  create() {
    this.scene.run(GameBackground);
    this.scene.sendToBack(GameBackground);
    //this.add.text(400, 250, 'Game');

    this.physics.world.setBounds(-100, 0, 1000, 500);

    this.ball = this.add.circle(400, 250, 10, Colors.white, 1);
    this.physics.add.existing(this.ball);
    this.ball.body.setCircle(10);
    this.ball.body.setBounce(1, 1);

    this.ball.body.setCollideWorldBounds(true, 1, 1);

    this.paddleLeft = this.add.rectangle(50, 250, 30, 100, Colors.white, 1);
    this.physics.add.existing(this.paddleLeft, true);

    this.paddleRight = this.add.rectangle(750, 250, 30, 100, Colors.white, 1);
    this.physics.add.existing(this.paddleRight, true);

    this.physics.add.collider(this.paddleLeft, this.ball);
    this.physics.add.collider(this.paddleRight, this.ball);

    const scoreStyle = {
      fontSize: 48,
      fontFamily: PressStart2P,
    };

    this.leftScoreLabel = this.add
      .text(300, 125, '0', scoreStyle)
      .setOrigin(0.5, 0.5);

    this.rightScoreLabel = this.add
      .text(500, 375, '0', scoreStyle)
      .setOrigin(0.5, 0.5);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.time.delayedCall(1500, () => {
      this.resetBall();
    });
  }

  update() {
    if (this.paused || this.gameState !== GameState.Running) {
      return;
    }

    this.processPlayerInput();
    this.updateAI();
    this.checkScore();
  }

  processPlayerInput() {
    const body = this.paddleLeft.body;

    if (this.cursors.up.isDown) {
      this.paddleLeft.y -= 10;
      body.updateFromGameObject();
    } else if (this.cursors.down.isDown) {
      this.paddleLeft.y += 10;
    }
  }

  updateAI() {
    const diff = this.ball.y - this.paddleRight.y;
    if (Math.abs(diff) < 30) {
      return;
    }

    const aiSpeed = 3;
    if (diff < 0) {
      // ball is above the paddle
      this.paddleRightVelocity.y = -aiSpeed;
      if (this.paddleRightVelocity.y < -10) {
        this.paddleRightVelocity.y = -10;
      }
    } else if (diff > 0) {
      // ball is below the paddle
      this.paddleRightVelocity.y = aiSpeed;
      if (this.paddleRightVelocity.y > 10) {
        this.paddleRightVelocity.y = 10;
      }
    }

    this.paddleRight.y += this.paddleRightVelocity.y;
    this.paddleRight.body.updateFromGameObject();
  }

  checkScore() {
    const x = this.ball.x;
    const leftBounds = -30;
    const rightBounds = 830;
    if (x >= leftBounds && x <= rightBounds)
      if (this.ball.x < leftBounds) {
        // scored on the left side
        this.incrementRightScore();
      } else if (this.ball.x > rightBounds) {
        // scored on the right side
        this.incrementLeftScore();
      }

    const maxScore = 7;
    if (this.leftScore >= maxScore) {
      //player won
      //console.log('player won');
      this.gameState = GameState.PlayerWon;
    } else if (this.rightScore >= maxScore) {
      // AI won
      //console.log('ai won');
      this.gameState = GameState.AIWon;
    }

    if (this.gameState === GameState.Running) {
      this.resetBall();
    } else {
      this.ball.active = false;
      this.physics.world.remove(this.ball.body);

      this.scene.stop(GameBackground);

      //show the game over/win screen
      this.scene.start(GameOver, {
        leftScore: this.leftScore,
        rightScore: this.rightScore,
      });
    }
  }

  incrementLeftScore() {
    this.leftScore += 1;
    this.leftScoreLabel.text = this.leftScore;
  }

  incrementRightScore() {
    this.rightScore += 1;
    this.rightScoreLabel.text = this.rightScore;
  }

  resetBall() {
    this.ball.setPosition(400, 250);
    const angle = Phaser.Math.Between(0, 360);
    const vec = this.physics.velocityFromAngle(angle, 200);

    this.ball.body.setVelocity(vec.x, vec.y);
  }
}

export default Game;
