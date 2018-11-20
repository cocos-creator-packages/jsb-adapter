/****************************************************************************
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and  non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
'use strict';

var rt = loadRuntime();
jsb.fileUtils = {
  getStringFromFile: function getStringFromFile(url) {
    return rt.getFileSystemManager().readFileSync(url, "utf8");
  },
  getDataFromFile: function getDataFromFile(url) {
    return rt.getFileSystemManager().readFileSync(url);
  },
  getWritablePath: function getWritablePath() {
    return "".concat(rt.env.USER_DATA_PATH, "/");
  },
  writeToFile: function writeToFile(map, url) {
    var str = JSON.stringify(map);
    return rt.getFileSystemManager().writeFileSync(url, str, "utf8");
  },
  getValueMapFromFile: function getValueMapFromFile(url) {
    var map_object = {};
    var read = rt.getFileSystemManager().readFileSync(url, "utf8");

    if (!read) {
      return map_object;
    }

    map_object = JSON.parse(read);
    return map_object;
  }
};

jsb.saveImageData = function (data, width, height, filePath) {
  var index = filePath.lastIndexOf(".");

  if (index === -1) {
    return false;
  }

  var fileType = filePath.substr(index + 1);
  var tempFilePath = rt.saveImageTempSync({
    'data': data,
    'width': width,
    'height': height,
    'fileType': fileType
  });

  if (tempFilePath === '') {
    return false;
  }

  var savedFilePath = rt.getFileSystemManager().saveFileSync(tempFilePath, filePath);

  if (savedFilePath === filePath) {
    return true;
  }

  return false;
};

jsb.setPreferredFramesPerSecond = function (fps) {
  rt.setPreferredFramesPerSecond(fps);
};