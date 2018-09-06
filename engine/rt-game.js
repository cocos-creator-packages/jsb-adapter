cc.game.restart = function () {
    __restartVM();
};

loadRuntime().onHide(function () {
    cc.game.emit(cc.game.EVENT_HIDE);
});

loadRuntime().onShow(function () {
    cc.game.emit(cc.game.EVENT_SHOW);
});