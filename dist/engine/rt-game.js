"use strict";

cc.game.restart = function () {
  cc.sys.restartVM();
};

loadRuntime().onHide(function () {
  cc.game.emit(cc.game.EVENT_HIDE);
});
loadRuntime().onShow(function () {
  cc.game.emit(cc.game.EVENT_SHOW);
});