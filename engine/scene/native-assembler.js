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

const TRANSFORM = 1 << 0;
const OPACITY = 1 << 1;
const COLOR = 1 << 2;
const CHILDREN = 1 << 3;

const RenderFlow = cc.RenderFlow;
const BEFORE_RENDER = RenderFlow.EventType.BEFORE_RENDER;

let NativeAssembler = {
    _ctor () {
        this.vDatas = [];
        this.uintVDatas = [];
        this.iDatas = [];
        this.meshCount = 0;
        this._delayed = false;
        this._comp = null;

        this._renderDataList = new renderer.RenderDataList();
        this.setRenderDataList(this._renderDataList);
    },

    destroy () {
        RenderFlow.off(BEFORE_RENDER, this.updateRenderData, this);
        this._comp = null;
    },

    clear () {
        this.vDatas.length = 0;
        this.uintVDatas.length = 0;
        this.iDatas.length = 0;
        this.meshCount = 0;
        this._renderDataList.clear();
    },

    init (component) {
        if (this._comp !== component && component instanceof cc.RenderComponent) {
            this._comp = component;
            if (component._assembler) {
                this.setUseModel(!!component._assembler.useModel);
            }
            if (component._vertexFormat) {
                this.setVertexFormat(component._vertexFormat._nativeObj);
            }
        }
    },

    delayUpdateRenderData () {
        if (this._comp) {
            RenderFlow.on(BEFORE_RENDER, this.updateRenderData, this);
            this._delayed = true;
        }
    },

    updateRenderData () {
        if (this._comp && this._comp._assembler) {
            this._comp._assembler.updateRenderData(this._comp);
            this._delayed = false;
        }
    },

    updateMesh (meshIndex, vertices, indices, uintVData) {
        this.vDatas[meshIndex] = vertices;
        this.uintVDatas[meshIndex] = uintVData || new Uint32Array(vertices.buffer, 0, vertices.length);
        this.iDatas[meshIndex] = indices;

        this.meshCount = this.vDatas.length;
        this._renderDataList.updateMesh(meshIndex, vertices, indices);
        this.notifyDirty(OPACITY);
    },

    updateMaterial (iaIndex, material) {
        let effect = material && material.effect;
        this.updateEffect(iaIndex, effect ? effect._nativeObj : null);
    }
};

cc.js.mixin(renderer.Assembler.prototype, NativeAssembler);
cc.NativeAssembler = module.exports = NativeAssembler;