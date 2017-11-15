
var WIDTH = 360;
var HEIGHT = 256;

var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.CANVAS, 'game');

game.States = {};

game.States.boot = function() {

  this.preload = function() {
    if(typeof(GAME) !== "undefined") {
      this.load.baseURL = GAME + "/";
    }

    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.refresh();
    game.load.image('loading', 'assets/preloader.gif');
  };
  this.create = function() {
    game.state.start('preload');
  };
};

game.States.preload = function() {
  this.preload = function() {
    var preloadSprite = game.add.sprite(40, HEIGHT/2, 'loading');
    game.load.setPreloadSprite(preloadSprite);
    game.load.image('cover', 'assets/cover.jpg');
    game.load.spritesheet('startbutton', 'assets/startbutton.png', 100, 40, 2);
    game.load.spritesheet('man', 'assets/man-small.png', 16, 16, 10);
    game.load.spritesheet('mystery', 'assets/mystery.png', 16, 16, 4);
    game.load.spritesheet('monster', 'assets/monster.png', 16, 16, 2);
    game.load.image('wall', 'assets/wall.bmp');
    game.load.spritesheet('left', 'assets/left.png', 40, 40, 2);
    game.load.spritesheet('right', 'assets/right.png', 40, 40, 2);
    game.load.spritesheet('up', 'assets/up.png', 40, 40, 2);
    game.load.tilemap('map', 'assets/tilemaps/map.csv', null, Phaser.Tilemap.CSV);
    game.load.image('tiles', 'assets/tilemaps/tiles.png');
    game.load.audio('startBGM', 'assets/startbgm.mp3');
    game.load.audio('playBGM', 'assets/playbgm.mp3');
    game.load.audio('jump', 'assets/jump.mp3');
  };
  this.create = function() {
    game.state.start('main');
  };
};

game.States.main = function() {
  this.create = function() {
    // 封面图
    var cover = game.add.tileSprite(0, 0, WIDTH, HEIGHT, 'cover');
    // 开始按钮
    this.startbutton = game.add.button(70, 200, 'startbutton', this.onStartClick, this, 1, 1, 0);
    // 背景音乐
    this.normalback = game.add.audio('startBGM', 0.2, true);
    this.normalback.play();
  };
  this.onStartClick = function() {
    game.state.start('start');
    this.normalback.stop();
  };
};

game.States.start = function() {
  var arrowLeft, arrowRight, arrowUp = false;
  this.create = function() {

    game.stage.backgroundColor = '#6888FF';
    // 启动物理引擎
    game.physics.startSystem(Phaser.ARCADE);

    // BGM
    this.playmusic = game.add.audio('playBGM', 0.2, true);
    this.playmusic.play();

    // 创建tilemap，指定每个tile的大小，16x16
    this.map = game.add.tilemap('map', 16, 16);
    // image添加上
    this.map.addTilesetImage('tiles');
    // 设置碰撞
    this.map.setCollisionBetween(0,11);
    this.map.setCollision(15);
    // layer
    this.layer = this.map.createLayer(0);
    this.layer.resizeWorld();

    // 地图资源
    this.mysteries = game.add.group();
    this.mysteries.enableBody = true;
    this.mystery = [];
    this.mystery[0] = this.mysteries.create(16*16, 10*16, 'mystery');
    this.mystery[1] = this.mysteries.create(21*16, 10*16, 'mystery');
    this.mystery[2] = this.mysteries.create(22*16, 6*16, 'mystery');
    this.mystery[3] = this.mysteries.create(23*16, 10*16, 'mystery');
    this.mystery[4] = this.mysteries.create(64*16, 9*16, 'mystery');
    this.mystery[5] = this.mysteries.create(78*16, 10*16, 'mystery');
    this.mystery[6] = this.mysteries.create(94*6, 6*16, 'mystery');
    this.mystery[7] = this.mysteries.create(106*16, 10*16, 'mystery');
    this.mystery[8] = this.mysteries.create(109*16, 10*16, 'mystery');
    this.mystery[9] = this.mysteries.create(109*16, 6*16, 'mystery');
    this.mystery[10] = this.mysteries.create(112*16, 10*16, 'mystery');
    this.mystery[11] = this.mysteries.create(129*16, 6*16, 'mystery');
    this.mystery[12] = this.mysteries.create(130*16, 6*16, 'mystery');
    this.mystery[13] = this.mysteries.create(170*16, 10*16, 'mystery');
    for (var i = this.mystery.length - 1; i >= 0; i--) {
      this.mystery[i].body.immovable = true;
      this.mystery[i].animations.add('flashing',[0,1,2,3],3,true);
    }

    // 人物
    this.man = game.add.sprite(50, HEIGHT - 64, 'man');
    game.physics.arcade.enable(this.man);
    this.man.body.gravity.y = 500;                    //重力加速度
    this.man.body.collideWorldBounds = true;          //碰撞世界范围
    this.man.animations.add('right', [0,1,2,1], 14, true);//创建动画 数组为要播放的帧序号(精灵图) 12毫秒 是否循环
    this.man.animations.add('left', [7,6,5,6], 14, true);


    this.manDirect = true; //朝向 右：true; 左：false
    // 键盘操作
    this.cursors = game.input.keyboard.createCursorKeys();
    // camera
    game.camera.follow(this.man);

    // 积分等文字
    var info = game.add.text(16, 16, 'MARIO', { font: '14px Arial', fill: '#ffffff' });
    info.fixedToCamera = true;


    // 创建虚拟按键
    var buttonleft = game.add.button(10, HEIGHT - 25, 'left', null, this, 1, 0, 1, 0);
    buttonleft.scale.setTo(1, 0.7);
    buttonleft.fixedToCamera = true;
    buttonleft.events.onInputOver.add(function(){arrowLeft=true;});
    buttonleft.events.onInputOut.add(function(){arrowLeft=false;});
    buttonleft.events.onInputDown.add(function(){arrowLeft=true;});
    buttonleft.events.onInputUp.add(function(){arrowLeft=false;});

    var buttonright = game.add.button(60, HEIGHT - 25, 'right', null, this, 1, 0, 1, 0);
    buttonright.scale.setTo(1, 0.7);
    buttonright.fixedToCamera = true;
    buttonright.events.onInputOver.add(function(){arrowRight=true;});
    buttonright.events.onInputOut.add(function(){arrowRight=false;});
    buttonright.events.onInputDown.add(function(){arrowRight=true;});
    buttonright.events.onInputUp.add(function(){arrowRight=false;});

    var buttonup = game.add.button(WIDTH - 50, HEIGHT - 25, 'up', null, this, 1, 0, 1, 0);
    buttonup.scale.setTo(1, 0.7);
    buttonup.fixedToCamera = true;
    buttonup.events.onInputOver.add(function(){arrowUp=true;});
    buttonup.events.onInputOut.add(function(){arrowUp=false;});
    buttonup.events.onInputDown.add(function(){arrowUp=true;});
    buttonup.events.onInputUp.add(function(){arrowUp=false;});

  };
  this.update = function() {
    game.physics.arcade.collide(this.man, this.layer);
    game.physics.arcade.collide(this.man, this.mysteries);

    // 左右走动
    if (this.cursors.left.isDown || arrowLeft) {
      this.manDirect = false;
      this.man.body.velocity.x = -130;
      this.man.animations.play('left');
    } else if (this.cursors.right.isDown || arrowRight) {
      this.manDirect = true;
      this.man.body.velocity.x = 130;
      this.man.animations.play('right');
    } else {
      this.man.body.velocity.x = 0;
      this.manDirect ? (this.man.frame = 0) : (this.man.frame = 7);
    }
    // 跳跃和蹲下
    if ((this.cursors.up.isDown || arrowUp) && (this.man.body.onFloor() || this.man.body.touching.down)) {
      this.man.body.velocity.y = -270;
      this.manDirect ? (this.man.frame = 3) : (this.man.frame = 4);
      this.jumpSound = game.add.sound('jump', 0.2, false);
      this.jumpSound.play();
    } else if (this.cursors.down.isDown) {
      //
    } 
    
    if (!(this.man.body.onFloor() || this.man.body.touching.down)) {
      this.manDirect ? (this.man.frame = 3) : (this.man.frame = 4);
    }

    for (var i = this.mystery.length - 1; i >= 0; i--) {
      this.mystery[i].animations.play('flashing');
    }

  };
};


game.state.add('boot', game.States.boot);
game.state.add('preload', game.States.preload);
game.state.add('main', game.States.main);
game.state.add('start', game.States.start);

game.state.start('boot');