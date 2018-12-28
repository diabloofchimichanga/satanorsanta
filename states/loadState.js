var loadState=new Kiwi.State("LoadState");

loadState.preload=function(){
  Kiwi.State.prototype.preload.call(this);

  this.addJSON("tilemap",'map/map.json');
  this.addSpriteSheet("tiles","map/winter32x32.png",32,32);

  this.addSpriteSheet("santa","character/santa.png",72.855,50);
  this.addImage("bg","map/BG.png");
  this.addSpriteSheet("zombie","enemy/zombie.png",45.570,55.002);
  this.addAudio("zombiesound","snd/zombiesound.mp3");
  this.addAudio("gameover","snd/gameover.mp3");
  this.addAudio("bgmusic","snd/bg.mp3");
};

loadState.create=function(){
  Kiwi.State.prototype.create.call(this);
  this.game.states.switchState("MainState");
};
