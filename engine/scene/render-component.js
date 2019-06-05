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
(function() {
    let RenderFlow = cc.RenderFlow;
    let BEFORE_RENDER = RenderFlow.EventType.BEFORE_RENDER;
    let renderComp = cc.RenderComponent.prototype;

    renderComp.initNativeHandle = function () {
        this._renderHandle = new renderer.Assembler();
    };

    let _destroy = renderComp.destroy;
    renderComp.destroy = function () {
        _destroy.call(this);
        RenderFlow.off(BEFORE_RENDER, this.updateRenderData, this);
    },

    renderComp.delayUpdateRenderData = function () {
        RenderFlow.on(BEFORE_RENDER, this.updateRenderData, this);
        this._delayed = true;
    };

    renderComp.updateRenderData = function () {
        if (this._assembler) {
            this._assembler.updateRenderData(this);
            this._delayed = false;
        }
    };

    let _onEnable = renderComp.onEnable;
    renderComp.onEnable = function () {
        _onEnable.call(this);
        if (!this._inited) {
            this._renderHandle.init();
            this._inited = true;
        } else {
            this._renderHandle.enable();
        }
    };

    let _markForRender = renderComp.markForRender;
    renderComp.markForRender = function (enable) {
        let oldFlag = this.node._renderFlag;
        _markForRender.call(this, enable);
        if (this.node._renderFlag == oldFlag) return;
        if (this.node._renderFlag & RenderFlow.FLAG_RENDER) {
            this._renderHandle.enable();
        } else {
            this._renderHandle.disable();
        }
    };

    let _disableRender = renderComp.disableRender;
    renderComp.disableRender = function () {
        let oldFlag = this.node._renderFlag;
        _disableRender.call(this);
        if (this.node._renderFlag == oldFlag) return;
        this._renderHandle.disable();
    };
})();