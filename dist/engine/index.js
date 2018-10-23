"use strict";

/****************************************************************************
 Copyright (c) 2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
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
if (CC_RUNTIME) {
  require('jsb-adapter/engine/rt-sys.js');

  require('jsb-adapter/engine/rt_input.js');

  require('jsb-adapter/engine/rt-loadSubpackage.js');

  require('jsb-adapter/engine/rt-game.js');

  require('jsb-adapter/engine/rt-jsb.js');
} else {
  require('jsb-adapter/engine/jsb-sys.js');

  require('jsb-adapter/engine/jsb-game.js');

  require('jsb-adapter/engine/jsb-videoplayer.js');

  require('jsb-adapter/engine/jsb-webview.js');
}

require('jsb-adapter/engine/jsb-node.js');

require('jsb-adapter/engine/jsb-audio.js');

require('jsb-adapter/engine/jsb-loader.js');

require('jsb-adapter/engine/jsb-editbox.js');

require('jsb-adapter/engine/jsb-reflection.js');

require('jsb-adapter/engine/jsb-cocosanalytics.js');

require('jsb-adapter/engine/jsb-assets-manager.js');