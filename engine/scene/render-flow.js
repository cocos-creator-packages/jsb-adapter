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

const DONOTHING = 0;
const BREAK_FLOW = 1 << 0;
const LOCAL_TRANSFORM = 1 << 1;
const WORLD_TRANSFORM = 1 << 2;
const TRANSFORM = LOCAL_TRANSFORM | WORLD_TRANSFORM;
const UPDATE_RENDER_DATA = 1 << 3;
const OPACITY = 1 << 4;
const RENDER = 1 << 5;
const CUSTOM_IA_RENDER = 1 << 6;
const CHILDREN = 1 << 7;
const POST_UPDATE_RENDER_DATA = 1 << 8;
const POST_RENDER = 1 << 9;
const FINAL = 1 << 10;

const REORDER_CHILDREN = 1 << 11;

let RenderFlow = cc.RenderFlow;
RenderFlow.EventType = {
    BEFORE_RENDER: 'before-render'
};
cc.js.mixin(RenderFlow, cc.EventTarget.prototype);

var middlewareMgr = middleware.MiddlewareManager.getInstance();
var director = cc.director;
RenderFlow.render = function (scene) {
    this.emit(this.EventType.BEFORE_RENDER);
    middlewareMgr && middlewareMgr.update(director._deltaTime);
    this._nativeFlow.render(scene._proxy);
};

RenderFlow.init = function (nativeFlow) {
    cc.EventTarget.call(this);
    this._nativeFlow = nativeFlow;
};

RenderFlow.FLAG_DONOTHING = DONOTHING;
RenderFlow.FLAG_BREAK_FLOW = BREAK_FLOW;
RenderFlow.FLAG_LOCAL_TRANSFORM = LOCAL_TRANSFORM;
RenderFlow.FLAG_WORLD_TRANSFORM = WORLD_TRANSFORM;
RenderFlow.FLAG_TRANSFORM = TRANSFORM;
RenderFlow.FLAG_OPACITY = OPACITY;
RenderFlow.FLAG_UPDATE_RENDER_DATA = UPDATE_RENDER_DATA;
RenderFlow.FLAG_RENDER = RENDER;
RenderFlow.FLAG_CUSTOM_IA_RENDER = CUSTOM_IA_RENDER;
RenderFlow.FLAG_CHILDREN = CHILDREN;
RenderFlow.FLAG_POST_UPDATE_RENDER_DATA = POST_UPDATE_RENDER_DATA;
RenderFlow.FLAG_POST_RENDER = POST_RENDER;
RenderFlow.FLAG_FINAL = FINAL;
RenderFlow.FLAG_REORDER_CHILDREN = REORDER_CHILDREN;