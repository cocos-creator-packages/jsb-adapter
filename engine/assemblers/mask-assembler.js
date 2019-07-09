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

const Mask = cc.Mask;
const RenderFlow = cc.RenderFlow;
const spriteAssembler = cc.Sprite.__assembler__.Simple.prototype;
const graphicsAssembler = cc.Graphics.__assembler__.prototype;


let proto = cc.Mask.__assembler__.prototype;
let _updateRenderData = proto.updateRenderData;
cc.js.mixin(proto, {
    _extendNative () {
        renderer.MaskAssembler.prototype.ctor.call(this);
    },

    initLocal () {
        this._local = new Float32Array(4);
        renderer.MaskAssembler.prototype.setLocalData.call(this, this._local);
    },

    updateRenderData (mask) {
        _updateRenderData.call(this, mask);
    
        mask._clearGraphics._assembler.updateMaterial(0, mask._clearMaterial);
        
        this.setMaskInverted(mask.inverted);
        this.setUseModel(mask._type !== Mask.Type.IMAGE_STENCIL);
        this.setImageStencil(mask._type === Mask.Type.IMAGE_STENCIL);

        mask.node._renderFlag |= cc.RenderFlow.FLAG_UPDATE_RENDER_DATA;
    }
}, renderer.MaskAssembler.prototype);

let originCreateGraphics = cc.Mask.prototype._createGraphics;
cc.js.mixin(cc.Mask.prototype, {
    _createGraphics () {
        originCreateGraphics.call(this);
        if (this._graphics) {
            this._assembler.setRenderSubHandle(this._graphics._assembler);
        }

        if (this._clearGraphics) {
            this._clearGraphics._assembler.ignoreWorldMatrix();
            this._assembler.setClearSubHandle(this._clearGraphics._assembler);
        }
    }
})

