
var WIDTH = 360;
var HEIGHT = 256;

var game = new Phaser.Game(WIDTH, 340, Phaser.CANVAS, 'game');

game.conf = {
  position: 50,
  // 人物模型参数，16*32
  width: 14,
  height: 16,
  WIDTH: 16,
  HEIGHT: 28,
  initialSize: 0, // 0, 10 
  volume: 0.2,    // 0 ~ 1
  maxTime: 300
};

game.States = {};

game.States.boot = function() {

  this.preload = function() {
    // 设备屏幕适配
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.refresh();
    // 加载进度条动画
    game.load.image('loading', 'assets/preloader.gif');
  };
  this.create = function() {
    game.state.start('preload');
  };
};


game.States.preload = function() {

  this.preload = function() {
    var preloadSprite = game.add.sprite(70, HEIGHT/2, 'loading');
    var progressText = game.add.text(WIDTH/2, HEIGHT/2-5, '0%', {
        fontSize: '16px',
        fill: '#ffffff'
    });
    progressText.anchor.setTo(0.4, 0.5); // 设置锚点，用于居中
    // 监听加载完一个文件的事件
    game.load.onFileComplete.add(function(progress) {
        progressText.text = progress + '%';
    });

    // 加载所有游戏资源
    game.load.setPreloadSprite(preloadSprite);
    game.load.image('cover', 'assets/cover.jpg');
    game.load.image('bg', 'assets/bg.bmp');
    game.load.spritesheet('startbutton', 'assets/startbutton.png', 100, 35, 2);
    game.load.spritesheet('man', 'assets/man.png', 16, 32, 20);
    game.load.spritesheet('mystery', 'assets/mystery.png', 16, 16, 4);
    game.load.spritesheet('monster', 'assets/monster.png', 16, 16, 2);
    game.load.spritesheet('grass', 'assets/grass.png', 32, 16, 3);
    game.load.spritesheet('flag', 'assets/flag.png', 16, 16, 4);
    game.load.spritesheet('gold', 'assets/gold.png', 16, 16, 3);
    game.load.spritesheet('fireworks', 'assets/fireworks.png', 20, 16, 5);
    game.load.image('wall', 'assets/wall.bmp');
    game.load.image('monsterDead', 'assets/monster-dead.png');
    game.load.image('manDead', 'assets/man-dead.png');
    game.load.image('mushroom', 'assets/mushroom.png');
    game.load.image('dead', 'assets/man-dead.png');
    game.load.image('monsterDead', 'assets/monster-dead.png');
    game.load.spritesheet('left', 'assets/left.png', 40, 40, 2);
    game.load.spritesheet('right', 'assets/right.png', 40, 40, 2);
    game.load.spritesheet('up', 'assets/up.png', 40, 40, 2);
    game.load.tilemap('map', 'assets/tilemaps/map.csv', null, Phaser.Tilemap.CSV);
    game.load.image('tiles', 'assets/tilemaps/tiles.png');
    game.load.image('jiageng', 'assets/jiageng.png');
    game.load.image('zhulou', 'assets/zhulou.png');
    game.load.image('nanmen', 'assets/nanmen.png');
    game.load.image('jiannan', 'assets/jiannan.png');
    game.load.image('qinye', 'assets/qinye.png');
    game.load.audio('startBGM', 'assets/sounds/startbgm.mp3');
    game.load.audio('playBGM', 'assets/sounds/playbgm.mp3');
    game.load.audio('jump', 'assets/sounds/jump.mp3');
    game.load.audio('goldSound', 'assets/sounds/gold.mp3');
    game.load.audio('winSound', 'assets/sounds/win.mp3');
    game.load.audio('deadSound', 'assets/sounds/die.mp3');
    game.load.audio('mushroomSound', 'assets/sounds/mushroom.mp3');
    game.load.audio('biggerSound', 'assets/sounds/bigger.mp3');
    game.load.audio('smallerSound', 'assets/sounds/smaller.mp3');
    game.load.audio('killWallSound', 'assets/sounds/killWall.mp3');
    game.load.audio('killMonsterSound', 'assets/sounds/killMonster.mp3');

    // 监听加载完毕事件
    game.load.onLoadComplete.add(onLoad);
    var deadLine = false;             
    function onLoad() {
      if (deadLine) {
        setTimeout(() => {game.state.start('main');}, 200);
      } else {
        setTimeout(onLoad, 200);                 // 还没有到最小展示时间，1秒后重试
      }
    }
    setTimeout(() => {deadLine = true;}, 1000);  // 最小展示时间，1秒

  };
};


game.States.main = function() {

  this.create = function() {
    // 封面
    var cover = game.add.tileSprite(0, 0, 360, 340, 'cover');
    this.startbutton = game.add.button(240, 285, 'startbutton', this.onStartClick, this, 1, 1, 0);
    this.startbutton.scale.setTo(0.9, 0.9);
    // 背景音乐
    this.startBGM = game.add.sound('startBGM', game.conf.volume, true);
    this.startBGM.play();
  };

  // 按钮事件
  this.onStartClick = function() {
    game.state.start('start');
    this.startBGM.stop();
  };

};


game.States.start = function() {

  var arrowLeft = arrowRight = arrowUp = false;   //定义虚拟按键

  this.create = function() {
    // 记录时间
    this.startTime = game.time.now;
    // 设置背景色
    game.stage.backgroundColor = '#CCC';
    // 启动物理引擎
    game.physics.startSystem(Phaser.ARCADE);

    // BGM
    this.playmusic = game.add.sound('playBGM', game.conf.volume, true);
    this.playmusic.play();

    // 背景建筑
    this.buildings = game.add.group();
    this.buildings.create(200, 224, 'nanmen');
    this.buildings.create(500, 224, 'jiageng');
    this.buildings.create(1000, 224, 'jiannan');
    this.buildings.create(1300, 224, 'zhulou');
    this.buildings.callAll('anchor.setTo', 'anchor', 0, 1);
    var qinye = game.add.image(3272, 144, 'qinye');

    // 创建tilemap，指定每个tile的大小，16x16
    this.map = game.add.tilemap('map', 16, 16);
    this.map.addTilesetImage('tiles');
    this.map.setCollisionBetween(0,11);
    this.map.setCollision(15);
    // layer
    this.layer = this.map.createLayer(0);
    this.layer.resizeWorld();

    // 背景图
    var bg = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'bg');
    bg.sendToBack();

    //************************************地图资源*****************************************
    // 问号箱
    this.mysteries = game.add.group();
    this.mysteries.enableBody = true;
    this.map.createFromTiles(15, null, 'mystery', this.layer, this.mysteries);
    this.mysteries.setAll('body.immovable', 'true');
    this.mysteries.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3], 3, true);
    this.mysteries.callAll('animations.play', 'animations', 'spin');
    // 金子
    this.golds = game.add.group();
    this.golds.enableBody = true;
    this.map.createFromTiles(17, -1, 'gold', this.layer, this.golds);
    this.golds.callAll('animations.add', 'animations', 'spin', [0, 1, 2], 5, true);
    this.golds.callAll('animations.play', 'animations', 'spin');
    this.goldSoundSound = game.add.sound('goldSound', game.conf.volume);
    // 草
    this.grasses = game.add.group();
    this.map.createFromTiles(16, -1, 'grass', this.layer, this.grasses);
    this.grasses.callAll('animations.add', 'animations', 'blow', [0, 1, 2], 10, true);
    this.grasses.callAll('animations.play', 'animations', 'blow');
    // 旗子
    this.flag = game.add.sprite(198*16+9, 3*16+8, 'flag');
    this.flag.animations.add('move', [0,1,2,3], 12, true);
    this.flag.animations.play('move');
    // 怪物
    this.monsters = game.add.group();
    this.monsters.enableBody = true;
    this.map.createFromTiles(18, -1, 'monster', this.layer, this.monsters);
    this.monsters.setAll('body.gravity.y', 500);
    this.monsters.callAll('animations.add', 'animations', 'move', [0, 1], 5, true);
    this.monsters.callAll('animations.play', 'animations', 'move');
    this.killMonsterSound = game.add.sound('killMonsterSound', game.conf.volume);
    this.killWallSound = game.add.sound('killWallSound', game.conf.volume);
    // 蘑菇
    this.mushroom = game.add.sprite(0, 0, 'mushroom');
    game.physics.arcade.enable(this.mushroom);
    this.mushroom.body.gravity.y = 500;
    this.mushroomSound = game.add.sound('mushroomSound', game.conf.volume);
    this.mushroom.kill();
    // 烟花
    this.fireworks = game.add.group();

    //**************************************************************************************

    // 人物
    this.man = game.add.sprite(game.conf.position, HEIGHT - 64, 'man');
    this.man.isHurt = true;                           // 有关无敌状态的设定
    game.physics.arcade.enable(this.man);
    this.man.body.gravity.y = 500;                    // 重力加速度
    this.man.body.collideWorldBounds = true;          // 碰撞世界范围
    this.manToSize(game.conf.initialSize);            // 大小的设定，0：小人， else：大人
    this.manDirect = true;                            // 朝向 右：true; 左：false
    this.jumpSound = game.add.sound('jump', game.conf.volume, false);
    this.biggerSound = game.add.sound('biggerSound', game.conf.volume, false);
    this.smallerSound = game.add.sound('smallerSound', game.conf.volume, false);

    this.manDead = game.add.sprite(0, 0, 'dead');     // 死亡状态
    this.manDead.kill();

    // 键盘操作
    this.cursors = game.input.keyboard.createCursorKeys();
    // camera
    game.camera.follow(this.man);

    // 积分等文字信息
    var info = game.add.group();
    info.fixedToCamera = true;
    info.add(game.add.text(60, 10, 'XIAOXIA', { font: '12px Arial', fill: '#ffffff' }));
    info.add(game.add.text(190, 10, 'GOLDS', { font: '12px Arial', fill: '#ffffff' }));
    info.add(game.add.text(320, 10, 'TIME', { font: '12px Arial', fill: '#ffffff' }));
    this.score = 0;
    this.scoreText = info.add(game.add.text(60, 24, this.score, { font: '12px Arial', fill: '#ffffff' }));
    this.goldNum = 0;
    this.goldNumText = info.add(game.add.text(190, 24, this.goldNum, { font: '12px Arial', fill: '#ffffff' }));
    this.timeNum = game.conf.maxTime;
    this.timeNumText = info.add(game.add.text(320, 24, this.timeNum, { font: '12px Arial', fill: '#ffffff' }));
    info.callAll('anchor.setTo', 'anchor', 0.5, 0);

    // 控制器面板
    var controller = game.add.graphics(0, 256);
    controller.fixedToCamera = true;
    controller.beginFill(0x305362);
    controller.drawRect(0, 0, 360, 84);
    controller.endFill();

    // 创建虚拟按键
    var buttonleft = game.add.button(10, HEIGHT + 10, 'left', null, this, 1, 0, 1, 0);
    buttonleft.scale.setTo(1.4, 1.4);
    buttonleft.fixedToCamera = true;
    buttonleft.events.onInputOver.add(function(){arrowLeft=true;});
    buttonleft.events.onInputOut.add(function(){arrowLeft=false;});
    buttonleft.events.onInputDown.add(function(){arrowLeft=true;});
    buttonleft.events.onInputUp.add(function(){arrowLeft=false;});

    var buttonright = game.add.button(80, HEIGHT + 10, 'right', null, this, 1, 0, 1, 0);
    buttonright.scale.setTo(1.4, 1.4);
    buttonright.fixedToCamera = true;
    buttonright.events.onInputOver.add(function(){arrowRight=true;});
    buttonright.events.onInputOut.add(function(){arrowRight=false;});
    buttonright.events.onInputDown.add(function(){arrowRight=true;});
    buttonright.events.onInputUp.add(function(){arrowRight=false;});

    var buttonup = game.add.button(WIDTH - 70, HEIGHT + 10, 'up', null, this, 1, 0, 1, 0);
    buttonup.scale.setTo(1.4, 1.4);
    buttonup.fixedToCamera = true;
    buttonup.events.onInputOver.add(function(){arrowUp=true;});
    buttonup.events.onInputOut.add(function(){arrowUp=false;});
    buttonup.events.onInputDown.add(function(){arrowUp=true;});
    buttonup.events.onInputUp.add(function(){arrowUp=false;});

    this.updateState = 'play';

  };

  //***********************************************************************************
  //**********************************update*******************************************
  //***********************************************************************************
  this.update = function() {
    //console.log(this.man.alive);

    // 全局代码
    // 碰撞检测
    game.physics.arcade.collide(this.man, this.mysteries, this.collectMystery, null, this); //两者不能颠倒顺序
    game.physics.arcade.collide(this.man, this.layer, this.killWall, null, this);           //两者不能颠倒顺序

    // 文字信息
    this.scoreText.setText(this.score);
    this.goldNumText.setText(this.goldNum);
    this.timeNumText.setText(this.timeNum);

    // 建筑物移动
    this.buildings.x = game.camera.x/2;


    // 简单状态机
    // play: 游戏中, die: 死亡, win: 胜利, winAnimation: 胜利后的动画, share: 分享页面.
    switch (this.updateState) {

      case 'play':

        // 碰撞检测
        game.physics.arcade.overlap(this.man, this.layer, this.gameWin, null, this);
        game.physics.arcade.overlap(this.man, this.mushroom, this.eatMushroom, null, this);
        this.overGold = game.physics.arcade.overlap(this.man, this.golds, this.collectGold, null, this);
        this.overMonster =  game.physics.arcade.overlap(this.man, this.monsters, this.killMonster, null, this);

        // 计时
        this.timeNum = game.conf.maxTime - Math.floor((game.time.now - this.startTime)/1000);
        // 时间到
        if (this.timeNum < 0) {
          this.beingKill(this.man.x, this.man.y);
        }

        //************************************** 人物的控制 ************************
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
          this.manDirect ? (this.man.frame = this.manSize+0) : (this.man.frame = this.manSize+7);
        }
        // 跳跃和蹲下
        if ((this.cursors.up.isDown || arrowUp) && 
            (this.man.body.onFloor() || this.man.body.touching.down) && 
            (!this.overGold)
           ) {
          this.man.body.velocity.y = -270;
          this.manDirect ? (this.man.frame = this.manSize+3) : (this.man.frame = this.manSize+4);
          this.jumpSound.play();
        } else if (this.cursors.down.isDown) {
          //
        }
        // 空中姿态
        if (!(this.man.body.onFloor() || this.man.body.touching.down)) {
          this.manDirect ? (this.man.frame = this.manSize+3) : (this.man.frame = this.manSize+4);
        }
        // 出边界
        this.man.body.onWorldBounds = new Phaser.Signal();
        this.man.body.onWorldBounds.add(function(man, up, down, left, right) {
            if (down) this.beingKill(this.man.x, this.man.y);
        }, this);
        //*************************************************************************
        //********************************* 怪物的控制 *****************************
        game.physics.arcade.collide(this.monsters, this.layer);
        game.physics.arcade.collide(this.monsters, this.monsters);

        this.monsters.forEach(function(monster){
          if (monster.position.x - game.camera.x <= 360) {  // 进入视野
            if (monster.stopEvent) {      // TRUE为向右, FLASE为向左
              monster.body.velocity.x = 40;
            }else {
              monster.body.velocity.x = -40;
            }     
            // 碰壁
            if (!this.overMonster) {         // 怪物不受人的影响
              if (monster.body.blocked.left || monster.body.touching.left) {  
                monster.stopEvent = true;
              } else if (monster.body.blocked.right || monster.body.touching.right) {
                monster.stopEvent = false;
              }
            }
            // 出边界
            if (monster.position.x < 0 || monster.position.y > 256) {
              monster.destroy();
            }
          }
        }, this);
        //*************************************************************************
        //********************************* 蘑菇的控制 *****************************
        game.physics.arcade.collide(this.mushroom, this.layer);
        if (this.mushroom.alive) {            // 蘑菇存在时执行
          if (this.mushroom.stopEvent) {      // TRUE为向左, FLASE为向右
            this.mushroom.body.velocity.x = -70;
          } else {
            this.mushroom.body.velocity.x = 70;
          }
          // 碰壁
          if (this.mushroom.body.blocked.left || this.mushroom.body.touching.left) {  
            this.mushroom.stopEvent = false;
          } else if (this.mushroom.body.blocked.right || this.mushroom.body.touching.right) {
            this.mushroom.stopEvent = true;
          }
          // 出边界
          if (this.mushroom.position.x < 0 || this.mushroom.position.y > 256) {
            this.mushroom.kill();
          }
        }
        //*************************************************************************

      break;

      case 'die':

        this.monsters.setAll('body.velocity.x', 0);
        this.monsters.setAll('body.velocity.y', 0);
        this.monsters.setAll('body.gravity.y', 0);

        if (this.mushroom.alive) {
          this.mushroom.body.velocity.x = 0;
          this.mushroom.body.velocity.y = 0;
          this.mushroom.body.gravity.y = 0;
        }

      break;

      case 'win':
        // 沿旗杆滑落
        this.man.body.velocity.x = 0;
        this.man.body.velocity.y = 0;
        // 旗子降落
        var flagtween = game.add.tween(this.flag).to({y: 190}, 1000, Phaser.Easing.Linear.None, true);
        var winBGM = game.add.sound('winSound', game.conf.volume);
        this.playmusic.stop();
        winBGM.play();
        // 烟花的时间
        this.preDate = 0;

        this.updateState = 'winAnimation';
        
      break;

      case 'winAnimation':
        //console.log('winAnimation');
        // 进城堡
        if (this.flag.y === 190) {    // 滑倒底后的动画
          if (this.man.x < 3360) {    
            this.man.body.velocity.x = 130;
            this.man.animations.play('right');   
          } else {                    // 到达指定位置执行
            this.man.body.velocity.x = 0;
            this.man.frame = this.manSize+9;
            // 烟花 
            this.celebrate();
            // 计分
            if (this.timeNum > 0) {
              this.timeNum--;
              this.score += 10;
            } else {
              this.updateState = 'share';
            }
          }
        } else {                      // 下滑时的动作
          this.man.frame = this.manSize+8;
        }

      break;

      case 'share':

        console.log('share');
        SCORE = this.score;
        this.updateState = 'shareLoop';

        // 生成按钮
        document.getElementById('buttons').style = '';

      break;

      case 'shareLoop':

        this.man.frame = this.manSize+9;
        // 烟花
        this.celebrate();
        // 分数

      break;

    }
  };


  // 吃问号箱
  this.collectMystery = function(man, item) {
    //console.log(game.physics.arcade.angleBetween(man, item));
    // 从下方顶到物体
    if ((game.physics.arcade.angleBetween(man, item) < -0.78) && (game.physics.arcade.angleBetween(man, item) > -2.36)){
      if (item.position.x === 21*16 ||
          item.position.x === 78*16 ||
          item.position.x === 112*16
         ) {
        // 蘑菇出现
        this.mushroom.reset(item.x, item.y - 16);
        this.mushroom.revive();
        this.mushroom.stopEvent = false;
        this.mushroomSound.play();
      } else {
        // 金币冒出来
        var gold = game.add.sprite(item.x, item.y - 16, 'gold');
        gold.animations.add('move', [0,1,2], 5, true);
        gold.animations.play('move');
        this.goldSoundSound.play();
        this.goldNum++;
        this.score += 100;
        // 金币动画
        var tween = game.add.tween(gold).to({y: gold.y - 50}, 100, Phaser.Easing.Linear.None, true);
        tween.onComplete.add(function(){gold.destroy();}, this);
      }
      item.destroy();
    }
  };

  // 吃金子
  this.collectGold = function(man, gold) {
    gold.destroy();
    this.goldSoundSound.play();
    this.goldNum++;
    this.score += 100;
  };

  // 吃蘑菇
  this.eatMushroom = function(man, mushroom) {
    this.manToSize(1);
    this.mushroom.kill();
    this.biggerSound.play();
    this.score += 500;
  };

  // 大人撞碎墙
  this.killWall = function(man, item) {
    if (item.index === 11) {
      if ((game.physics.arcade.angleToXY(man, item.worldX, item.worldY) < -0.78) &&
          (game.physics.arcade.angleToXY(man, item.worldX, item.worldY) > -2.36) &&
          (this.manSize === 10)
         ){
        this.map.removeTile(item.x, item.y);
        this.killWallSound.play();
        this.score += 20;
      }
    }
  };

  // 遇到怪物
  this.killMonster = function(man, monster) {
    if (this.man.isHurt) {
      this.man.anchor.setTo(0, 0.5);
      // 踩中怪物
      if ((game.physics.arcade.angleBetween(man, monster) > 0.80) && (game.physics.arcade.angleBetween(man, monster) < 2.34)) {
        monster.destroy();
        var monsterDead = game.add.sprite(monster.x, monster.y, 'monsterDead');
         game.time.events.add(Phaser.Timer.SECOND / 2, function(){monsterDead.destroy()});
        this.man.body.velocity.y = -200;
        this.killMonsterSound.play();
        this.score += 200;
      } 
      // 碰到怪物
      else {
        if (this.manSize === 10) {
          this.manToSize(0);
          this.smallerSound.play();
          this.man.isHurt = false;
          game.time.events.add(Phaser.Timer.SECOND * 1.5, function(){this.man.isHurt = true}, this);
        } else {
          this.beingKill(man.x, man.y);
        }
      }
      this.manToSize(this.manSize);
    }
  };

  // 死亡
  this.beingKill = function(x, y) {
    this.man.kill();
    this.manDead.x = x;
    this.manDead.y = y;
    this.manDead.revive();
    // 死亡的动画
    var tween = game.add.tween(this.manDead).to({y: y-20}, 200, Phaser.Easing.Quadratic.out, true, 500);
    tween.onComplete.add(function(){
      var tween = game.add.tween(this.manDead).to({y: 300}, 1000, Phaser.Easing.Quadratic.out, true);
      tween.onComplete.add(function(){
       game.time.events.add(Phaser.Timer.SECOND, function(){game.state.start('start');});
      });
    }, this);

    var deadSound = game.add.sound('deadSound', game.conf.volume);
    this.playmusic.stop();
    deadSound.play();

    this.updateState = 'die';
  };

  // 游戏胜利
  this.gameWin = function(man, item) {
    if (item.index === 13) {
      if (this.man.x >= 3156) {       // 人物到达旗杆的位置
        this.updateState = 'win';
      }
    }
  };

  // 放烟花
  this.celebrate = function() {
    if (game.time.now - this.preDate >= 400) {  // 设置时间间隔
      // 随机烟花的位置
      var firex = game.rnd.integerInRange(3300, 3450);
      var firey = game.rnd.integerInRange(50, 100);

      var firework = this.fireworks.getFirstExists(false, true, firex, firey, 'fireworks');
      var anim = firework.animations.add('fire', [0, 1, 2, 3, 4], 8, false);
      firework.animations.play('fire');
      anim.onComplete.add(function(){firework.kill();}, this);

      this.preDate = game.time.now;
    }
  }

  // 变大变小转换
  this.manToSize = function(size) {
    if (size === 0) {                       //小人
      this.manSize = 0;                     // 小马里奥
      this.man.body.setSize(game.conf.width, game.conf.height, 8-game.conf.width/2, 32-game.conf.height); // 碰撞范围
      this.man.anchor.setTo((8-game.conf.width/2)/16, (32-game.conf.height)/32);   // 碰撞时计算角度点
    }else {
      this.manSize = 10;                    // 大马里奥
      this.man.body.setSize(game.conf.WIDTH, game.conf.HEIGHT, 8-game.conf.WIDTH/2, 32-game.conf.HEIGHT);  // 碰撞范围
      this.man.anchor.setTo((8-game.conf.WIDTH/2)/16, (32-game.conf.HEIGHT)/32);     // 碰撞时计算角度点
    }
    this.man.animations.add('right', [this.manSize+0,this.manSize+1,this.manSize+2,this.manSize+1], 14, true);//创建动画 数组为要播放的帧序号(精灵图) 12毫秒 是否循环
    this.man.animations.add('left', [this.manSize+7,this.manSize+6,this.manSize+5,this.manSize+6], 14, true);

  };

  // this.render = function(){
  //    game.debug.body(this.man);
  // }
};

game.States.over = function() {
  this.create = function() {
    //
  }
}


game.state.add('boot', game.States.boot);
game.state.add('preload', game.States.preload);
game.state.add('main', game.States.main);
game.state.add('start', game.States.start);
game.state.add('over', game.States.over);

game.state.start('boot');
