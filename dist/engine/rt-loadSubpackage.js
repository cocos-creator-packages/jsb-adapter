"use strict";

cc.loader.downloader.loadSubpackage = function (name, completeCallback) {
  var rt = loadRuntime();
  var pac = this._subpackages[name];
  var pos1 = pac.path.lastIndexOf('/');
  var pos2 = pac.path.lastIndexOf('\\');
  var posBegin = Math.max(pos1, pos2);
  var posEnd = pac.path.lastIndexOf('.');

  if (posEnd === -1 || posEnd < posBegin) {
    posEnd = pac.path.length;
  }

  var fileName = pac.path.substring(posBegin + 1, posEnd);
  rt.loadSubpackage({
    name: fileName,
    success: function success() {
      if (completeCallback) completeCallback();
    },
    fail: function fail() {
      if (completeCallback) completeCallback(new Error("Failed to load subpackage ".concat(name)));
    }
  });
};