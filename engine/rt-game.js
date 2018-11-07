cc.game.restart = function () {
    if (typeof __restartVM != 'undefined') {
        __restartVM();
    } else {
        console.error("The restartVM is not define!");
    }
};

loadRuntime().onHide(function () {
    cc.game.emit(cc.game.EVENT_HIDE);
});

loadRuntime().onShow(function () {
    cc.game.emit(cc.game.EVENT_SHOW);
});