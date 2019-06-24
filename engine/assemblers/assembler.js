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

const RenderFlow = cc.RenderFlow;
const BEFORE_RENDER = RenderFlow.EventType.BEFORE_RENDER;

let originInit = cc.Assembler.prototype.init;

let Assembler = {
    destroy () {
        this._renderComp = null;
        this._effect = null;
    },

    clear () {
        this._renderData.clear();
    },

    _extendNative () {
        renderer.Assembler.prototype.ctor.call(this);
    },

    init (renderComp) {
        this._extendNative();

        this._effect = [];
        originInit.call(this, renderComp);

        if (renderComp._vertexFormat) {
            this.setVertexFormat(renderComp._vertexFormat._nativeObj);
        }
        if (renderComp.node && renderComp.node._proxy) {
            renderComp.node._proxy.setAssembler(this);
        }
    },

    delayUpdateRenderData () {
        if (this._renderComp) {
            RenderFlow.once(BEFORE_RENDER, this._updateRenderData, this);
        }
    },

    _updateRenderData () {
        if (!this._renderComp || !this._renderComp.isValid) return;
        this.updateRenderData(this._renderComp);

        let materials = this._renderComp.sharedMaterials;
        for (let i = 0; i < materials.length; i++) {
            this.updateMaterial(i, materials[i]);
        }
    },

    updateRenderData (comp) {
        comp._assembler.updateMaterial(0, comp.sharedMaterials[0]);
    },

    updateMaterial (iaIndex, material) {
        let effect = material && material.effect;
        if (this._effect[iaIndex] !== effect) {
            this._effect[iaIndex] = effect;
            this.updateEffect(iaIndex, effect ? effect._nativeObj : null);
        }
    },

    updateColor(comp, color) {
        this.notifyDirty(cc.Assembler.NativeDirtyFlag.OPACITY);
    }
};

Object.setPrototypeOf(cc.Assembler.prototype, renderer.Assembler.prototype);

cc.js.mixin(cc.Assembler.prototype, Assembler);

cc.Assembler.NativeDirtyFlag = {
    TRANSFORM: 1 << 0,
    OPACITY: 1 << 1,
    COLOR: 1 << 2,
    CHILDREN: 1 << 3
};

module.exports = Assembler;