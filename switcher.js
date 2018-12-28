var gameOpt={
  renderer: Kiwi.RENDERER_WEBGL,
  width:640,
  height:500,
};

var game=new Kiwi.Game("content", 'game', null, gameOpt);

game.states.addState(loadState);
game.states.addState(mainState);
game.states.switchState("LoadState");
