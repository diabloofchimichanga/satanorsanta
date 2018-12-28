var mainState=new Kiwi.State("MainState");

mainState.create=function(){
  Kiwi.State.prototype.create.call(this);

  this.background=new Kiwi.GameObjects.StaticImage(this,this.textures.bg);
  this.addChild(this.background);

  //zombie
  this.zombieGroup=new Kiwi.Group(this);
  this.addChild(this.zombieGroup);

  this.timer=this.game.time.clock.createTimer('time',1,-1,true);
  this.timerEvent=this.timer.createTimerEvent(Kiwi.Time.TimerEvent.TIMER_COUNT,this.spawnZombie,this);

  //char
  this.santa=new Kiwi.GameObjects.Sprite(this,this.textures.santa,5, 100);

  //add physics to santa
  this.santa.box.hitbox=new Kiwi.Geom.Rectangle(32,0,10,50);
  this.santa.physics=this.santa.components.add(new Kiwi.Components.ArcadePhysics(this.santa,this.santa.box));
  this.santa.physics.acceleration.y=77;
  this.santa.physics.maxVelocity.y=140;

  //char sprites
  this.santa.animation.add("idle",[0,1,2,3,4,5,6,7,8,9],0.1,true);
  this.santa.animation.add("run",[11,12,13,14,16,17,18,19],0.1,true);
  this.santa.animation.add("jump",[13],0.1,false);

  this.addChild(this.santa);

  // create the tile
  this.tilemap=new Kiwi.GameObjects.Tilemap.TileMap(this,'tilemap',this.textures.tiles);

  for(var i=0;i < this.tilemap.layers.length; i++){
    this.addChild(this.tilemap.layers[i]);
  }
  for(var i=1;i<this.tilemap.tileTypes.length;i++){
    this.tilemap.tileTypes[i].allowCollisions=Kiwi.Components.ArcadePhysics.ANY;
  }

  //set controls
  this.keyboard=this.game.input.keyboard;

  this.moveLeft=this.keyboard.addKey(Kiwi.Input.Keycodes.A,true);
  this.moveRight=this.keyboard.addKey(Kiwi.Input.Keycodes.D,true);
  this.jump=this.keyboard.addKey(Kiwi.Input.Keycodes.W,true);

  // apply the controls
  this.keyboard.onKeyDownOnce.add(this.keyDown,this);
  this.keyboard.onKeyUp.add(this.keyUp,this);
  this.timer.start;

  // sounds
  this.zombiesound=new Kiwi.Sound.Audio(this.game,"zombiesound",1,false);
  this.gameover=new Kiwi.Sound.Audio(this.game,"gameover",1,false);
  this.bgmusic=new Kiwi.Sound.Audio(this.game,"bgmusic",1,true);

  this.gameover.onPlay.add(this.gameOverPlay,this);
  this.gameover.onStop.add(this.gameOverStop,this);

  this.bgmusic.play();
};

mainState.update=function(){
  Kiwi.State.prototype.update.call(this);

  // check for physics
  this.checkCollision();
  // character extra baganza
  this.characterMovement();
  this.characterAnimation();
  this.resetCharacter();
  var playerOffsetX = this.santa.width * 0.5;
	var playerOffsetY = this.santa.height * 0.5;


	// Set the cameras position to that of the player.
	this.game.cameras.defaultCamera.transform.x = -1 * this.santa.x + this.game.stage.width * 0.5 - playerOffsetX;
};

mainState.checkCollision=function(){
  this.tilemap.layers[0].physics.overlapsTiles(this.santa,true);
  // zombie collision
  var e,i,zombs;
  zombs=this.zombieGroup.members;
  for(e=0;e < zombs.length; e++){
    this.tilemap.layers[0].physics.overlapsTiles(zombs[e],true);

    if(this.santa.x > zombs[e].x){
      zombs[e].scaleX=1;
      zombs[e].physics.velocity.x=20;
    }else if(this.santa.x < zombs[e].x){
      zombs[e].scaleX=-1;
      zombs[e].physics.velocity.x=-20;
    }
    if(this.santa.box.hitbox.intersects(zombs[e].box.hitbox)){
      this.gameover.play();
    }
  }
};

mainState.keyDown=function(keyCode,key){
  if(keyCode==this.moveLeft.keyCode){
    this.leftpressed=true;
  }
  if(keyCode==this.moveRight.keyCode){
    this.rightpressed=true;
  }
  if(keyCode==this.jump.keyCode){
    this.jump_pressed=true;
  }

};

mainState.keyUp=function(keyCode,key){
  if(keyCode==this.moveLeft.keyCode){
    this.leftpressed=false;
  }
  if(keyCode==this.moveRight.keyCode){
    this.rightpressed=false;
  }
  if(keyCode==this.jump.keyCode){
    this.jump_pressed=false;
  }
};

mainState.characterMovement=function(){
  if(this.leftpressed==true && !this.gameover.isPlaying){
    this.santa.scaleX=-1;
    this.santa.physics.velocity.x=-30;
  }else if(this.rightpressed==true && !this.gameover.isPlaying){
    this.santa.scaleX=1;
    this.santa.physics.velocity.x=30;
  }else{
    this.santa.physics.velocity.x=0;
  }
  if(this.jump_pressed==true && this.santa.physics.isTouching(Kiwi.Components.ArcadePhysics.DOWN)){
    this.santa.physics.velocity.y=-155;
  }
};

mainState.characterAnimation=function(){
  if(!this.santa.physics.isTouching(Kiwi.Components.ArcadePhysics.DOWN)){
    if(this.santa.physics.velocity.y > 0){
      this.santa.animation.play('jump',false);
    }else{
      this.santa.animation.play('jump',false);
    }
  }else if(this.rightpressed==true || this.leftpressed==true){
    this.santa.animation.play("run",false);
  }else{
    this.santa.animation.play('idle', false);
  }
};

mainState.spawnZombie=function(){
  this.z_x=this.getRand(0,1);
  if(this.z_x==1){
    this.zx=this.santa.x+200;
  }else{
    this.zx=this.santa.x-200;
  }
  var z=new Zombie(this,this.zx, -10);
  this.zombiesound.play();
  this.zombieGroup.addChild(z);
};

mainState.getRand=function(min,max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

mainState.gameOverPlay=function(){
  this.timer.stop();
  var e,zombs;
  zombs=this.zombieGroup.members;
  for(e=0;e < zombs.length; e++){
    zombs[e].destroy();
  }
};
mainState.gameOverStop=function(){
  this.timer.start();
  this.santa.y = 75;
  this.santa.x = 0;
  this.santa.physics.velocity.y = 0;
};

mainState.resetCharacter=function(){
  if( this.santa.y > this.game.stage.height + this.game.stage.height / 2 ) {
    this.gameover.play();
	}
};

var Zombie=function(state,x,y){
  Kiwi.GameObjects.Sprite.call(this,state, state.textures["zombie"],x,y);
  this.animation.add("walk",[0,1,2,3,4,5,6,7,8,9],0.1,true);
  this.animation.play("walk");
  this.box.hitbox=new Kiwi.Geom.Rectangle(25,0,10,55);
  this.physics=this.components.add(new Kiwi.Components.ArcadePhysics(this,this.box));
  this.physics.acceleration.y=77;
  this.physics.maxVelocity.y=140;
  this.scaleX=-1;
};
Kiwi.extend(Zombie, Kiwi.GameObjects.Sprite);
Zombie.prototype.update=function(){
  Kiwi.GameObjects.Sprite.prototype.update.call(this);
};
