import PIXI from 'expose-loader?PIXI!phaser-ce/build/custom/pixi.js';
import p2 from 'expose-loader?p2!phaser-ce/build/custom/p2.js';
import Phaser from 'phaser';

export const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  "scale": {
    "mode": 0,
    "autoCenter": 2
  },
  physics: {
    default: 'arcade',
    arcade: {
      // debug: true,
    }
  }
};

const game = new Phaser.Game(config);
let green, player, cursors, shadow, fire, ships, score, health, gameOver, maxScore;
let life = 1000;
let cCounter = 1000;
let cDown = true;
let level = 1;
const max = localStorage.getItem('savedScore') || 0;

function preload (){
  this.load.image('green', './assets/img/green.gif');

  this.load.spritesheet(
    'dragonDown',
    './assets/img/gg/dragon_down.png',
    {
      frameWidth: 146,
      frameHeight: 122,
    }
  );
  this.load.spritesheet(
    'dragonUp',
    './assets/img/gg/dragon_up.png',
    {
      frameWidth: 146,
      frameHeight: 143,
    }
  );
  this.load.spritesheet(
    'dragonLeft',
    './assets/img/gg/dragon_left.png',
    {
      frameWidth: 146,
      frameHeight: 146,
    }
  );
  this.load.spritesheet(
    'dragonRight',
    './assets/img/gg/dragon_right.png',
    {
      frameWidth: 146,
      frameHeight: 146,
    }
  );

  this.load.spritesheet(
    'fireDie',
    './assets/img/gg/fireDie/fireball_die.png',
    {
      frameWidth: 120,
      frameHeight: 172,
    }
  );
  this.load.spritesheet(
    'fireball',
    './assets/img/gg/fireBall/fireball.png',
    {
      frameWidth: 220,
      frameHeight: 124,
    }
  );

  this.load.image('ship_01', './assets/img/ship/ship(1).png');
  this.load.image('ship_02', './assets/img/ship/ship(2).png');
  this.load.image('ship_03', './assets/img/ship/ship(3).png');
  this.load.image('ship_04', './assets/img/ship/ship(4).png');
  this.load.image('ship_05', './assets/img/ship/ship(5).png');

  this.load.spritesheet(
    'shipDie',
    './assets/img/ship/Breath.png',
    {
      frameWidth: 192,
      frameHeight: 192,
    }
  );
}

function create (){

  green = this.add.tileSprite(0, 0, config.width, config.height, 'green').setOrigin(0, 0);
  player = this.physics.add
    .sprite(400, 300, 'dragonDown')
    .setOrigin(0.5)
    .setDepth(1);
  // shadow = this.add.ellipse( //-- створює еліпс
  //   player.x,
  //   player.y+200,
  //   player.width,
  //   player.height/2 + 10,
  //   0x000000,
  //   0.5
  // )
  // .setOrigin(0.5).setScale(0.6);

  shadow = this.physics.add.sprite(400, 300, 'dragonDown')
    .setOrigin(0.5)
    .setScale(0.6)
    .setDepth(0)
    .setTint(0x000000)
    .setAlpha(0.5);

  fire = this.physics.add.group();
  ships = this.physics.add.group();

  /*
    Анімація з одного кадру

  this.anims.create({
    key: 'up',
    frames: [{
      key: 'gg_top',
      // frame: 0,
    }]
  });
  this.anims.create({
    key: 'down',
    frames: [{
      key: 'gg_bottom',
      // frame: 0,
    }]
  });
  this.anims.create({
    key: 'left',
    frames: [{
      key: 'gg_left',
      // frame: 0,
    }]
  });
  this.anims.create({
    key: 'right',
    frames: [{
      key: 'gg_right',
      // frame: 0,
    }]
  });

  */

  this.anims.create({
    key: 'down',
    frames: this.anims.generateFrameNumbers(
      'dragonDown',
      {
        start: 0,
        end: 3,
      },
      ),
    frameRate: 6,
    repeat: -1,
  });
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers(
      'dragonLeft',
      {
        start: 0,
        end: 3,
      },
      ),
    frameRate: 6,
    repeat: -1,
  });
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers(
      'dragonRight',
      {
        start: 0,
        end: 3,
      },
      ),
    frameRate: 6,
    repeat: -1,
  });
  this.anims.create({
    key: 'up',
    frames: this.anims.generateFrameNumbers(
      'dragonUp',
      {
        start: 0,
        end: 3,
      },
      ),
    frameRate: 6,
    repeat: -1,
  });

  this.anims.create({
    key: 'fireBall',
    frames: this.anims.generateFrameNumbers(
      'fireball',
      {
        start: 0,
        end: 4,
      },
      ),
    frameRate: 10,
    repeat: 2,
  });
  this.anims.create({
    key: 'fireDie',
    frames: this.anims.generateFrameNumbers(
      'fireDie',
      {
        start: 0,
        end: 5,
      },
      ),
    frameRate: 10,
    repeat: 0,
  });

  this.anims.create({
    key: 'shipDie',
    frames: this.anims.generateFrameNumbers(
      'shipDie',
      {
        start: 5,
        end: 14,
      },
      ),
    frameRate: 8,
    repeat: 0,
  });

  player.anims.play('down', true);
  shadow.anims.play('down', true);
  cursors = this.input.keyboard.createCursorKeys();

  this.physics.add
    .overlap(ships, fire, shipDie, null, this);
  this.physics.add
    .overlap(ships, player, dragonHealth, null, this);

  score = this.add.text(
    20,
    20,
    'Score: 0',
    {
      fontSize: '40px',
      fill: '#fff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    },
  )
  .setShadow(1, 1, '#000000', 0)
  .setOrigin(0)
  .setDepth(3)
  .setAlign('center');

  maxScore = this.add.text(
    20,
    130,
    `Max score: ${max}`,
    {
      fontSize: '30px',
      fill: '#fff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    },
  )
  .setShadow(1, 1, '#000000', 0)
  .setOrigin(0)
  .setDepth(3)
  .setAlign('center');

  health = this.add.text(
    20,
    80,
    'Health: 5',
    {
      fontSize: '30px',
      fill: '#DC143C',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    },
  )
  .setShadow(1, 1, '#000000', 0)
  .setOrigin(0)
  .setDepth(3)
  .setAlign('center');

  gameOver = this.add.text(
    config.width / 2,
    config.height / 2,
    'Game over',
    {
      fontSize: '90px',
      fill: '#fff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    },
  )
  .setShadow(1, 1, '#000000', 0)
  .setOrigin(0.5)
  .setDepth(3)
  .setAlpha(0)
  .setAlign('center');
}

function update() {
  health.setText(`Health: ${life}`);
  score.setText(`Score: ${level - 1}`);

  if (ships.children.entries.length != level) {
    while (ships.children.entries.length < level) {
      if (player.x > config.width / 2) {
        ships.create(
          -100,
          Phaser.Math.Between(100, 600),
          `ship_0${Phaser.Math.Between(1, 5)}`
        )
        .setOrigin(0.5)
        .setScale(0.3)
        .setDepth(1)
        .setVelocity(0, -100)
        .flipCounter = 0;
      }
      else {
        ships.create(
          config.width + 100,
          Phaser.Math.Between(100, 600),
          `ship_0${Phaser.Math.Between(1, 5)}`
        )
        .setOrigin(0.5)
        .setScale(0.3)
        .setDepth(1)
        .setVelocity(0, -100)
        .flipCounter = 0;
      }
    }
  }

  if (cCounter < 80 && cDown === false) {
    cDown = true;
  } else if (cCounter <= 80 && cDown === true) {
    cCounter++;
  }

  shadow.x = player.x;
  shadow.y = player.y+300;

  if (cursors.left.isDown) {
    player.setVelocityX(-150);
    player.setVelocityY(0);
    player.anims.play('left', true);

    shadow.anims.play('up', true);
    shadow.angle = -90;
    shadow.scaleX = 0.5;
  }
  else if (cursors.right.isDown) {
    player.setVelocityX(+150);
    player.setVelocityY(0);
    player.anims.play('right', true);

    shadow.anims.play('up', true);
    shadow.angle = 90;
    shadow.scaleX = 0.5;
  }
  else if (cursors.up.isDown) {
    player.setVelocityY(-150);
    player.setVelocityX(0);
    player.anims.play('up', true);

    shadow.anims.play(player.anims.currentAnim.key, true);
    shadow.angle = 0;
    shadow.scaleX = 0.6;
    shadow.anims.currentFrame = player.anims.currentFrame;
  }
  else if (cursors.down.isDown) {
    player.setVelocityY(+150);
    player.setVelocityX(0);
    player.anims.play('down', true);

    shadow.anims.play(player.anims.currentAnim.key, true);
    shadow.angle = 0;
    shadow.scaleX = 0.6;
    shadow.anims.currentFrame = player.anims.currentFrame;
  }
  else {
    player.setVelocity(0, 0);
  }

  if (cursors.space.isDown && cCounter >= 80) {
    cCounter = 0;
    cDown = false;

    if (player.anims.currentAnim.key === 'down') {
      createFireBall(0, 90, -90, 0, 200)
    } else if (player.anims.currentAnim.key === 'up') {
      createFireBall(0, -90, 90, 0, -200)
    } else if (player.anims.currentAnim.key === 'right') {
      createFireBall(90, 50, 180, 200, 0)
    } else if (player.anims.currentAnim.key === 'left') {
      createFireBall(-90, 50, 0, -200, 0)
    }
  }

  shipGoing.bind(this)(ships);

  if (life <= 0) {
    life = 0;
    player.anims.play('shipDie', true).on(
      'animationcomplete',
      () => {
        player.x = -1000;
        player.y = -1000;
        if (max < (level - 1)) {
          localStorage.setItem('savedScore', level - 1);
        }
        gameOver.setAlpha(1);
      },
      this
    );
  }
}

function dragonHealth(player, ship) {
  shipDie(ship);
  player.body.blocked.down = true

    this.time.addEvent({
      delay: 500,
      callback: () => {
        if (player.isTinted === true ) {
          player.clearTint();
        }
        else if (player.isTinted === false ) {
          player.setTint(0xff0000);
        }

        life--;
      },
      callbackScope: this,
      loop: false,
      repeat: 1,
    });
}

const fireDie = () => {
  fire.children.entries[0]
    .anims.play('fireDie', true)
    .on(
      'animationcomplete',
      () => {
        if (fire.children.entries[0]) {
          fire.children.entries[0].destroy()
        }
      },
      this
    );
}

const shipDie = (ship, fires) => {
  if (fire.children.entries[0]) {
    fireDie();
  }

  if (ship.die === undefined) {
    ship.setVelocity(0, 0);
    ship.flipCounter = undefined;
    ship.shadow.destroy();
    ship.anims.play('shipDie', true).on(
      'animationcomplete',
      () => {
        ship.destroy()
      },
      this
    );

    ship.die = true;
    level++;
  }
}

function createFireBall(addX, addY, angle, velocityX, velocityY) {
  fire.create(player.x + addX, player.y + addY, 'fireball')
    .setScale(0.2)
    .setDepth(2)
    .setOrigin(0.5)
    .anims.play('fireBall', true)
    .setAngle(angle)
    .setVelocity(velocityX, velocityY).on(
      'animationcomplete',
      fireDie,
      this
    );
}

function shipGoing(ships) {
  const rotate = (ship, X, Y) => {
    ship.setVelocity(X, Y);
    if (ship.body.velocity.x === 100) {
      ship.angle = 90;
    } else if (ship.body.velocity.x === -100) {
      ship.angle = -90;
    } else if (ship.body.velocity.y === 100) {
      ship.angle = 180;
    } else if (ship.body.velocity.y === -100) {
      ship.angle = 0;
    }
  }

  const dist = (ship, coordinate, rotateX, rotateY) => {

    ship.flipCounter++;
    const canRotate = (
      ship.flipCounter%10 == true
      && Phaser.Math.Between(0, 15) === 0
    )

    if (ship.y < 50) {rotate(ship, 0, 100)}
    if (ship.y > config.height -50) {rotate(ship, 0, -100)}

    if (ship.x < 50) {rotate(ship, 100, 0)}
    if (ship.x > config.width -50) {rotate(ship, -100, 0)}

    if (canRotate) {
      Phaser.Math.Between(0, 1) === 0
        ? rotate(ship, rotateX, rotateY)
        : rotate(ship, -rotateX, -rotateY);
    }
  }

  for(const ship of ships.children.entries) {
    if (ship.shadow === undefined) {

      ship.shadow = this.physics.add.sprite(ship.x, ship.y, ship.texture.key)
      .setOrigin(0.5)
      .setScale(ship.scale - 0.1)
      .setTint(0x000000)
      .setDepth(0)
      .setAlpha(0.5);
    } else {
      ship.shadow.x = ship.x;
      ship.shadow.y = ship.y+300;
      ship.shadow.angle = ship.angle;
    }
    Phaser.Math.Between(0, 1) === 0
        ? dist(ship, 'x', 100, 0)
        : dist(ship, 'y', 0, 100);
  }

}
