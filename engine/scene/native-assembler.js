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

let NativeAssembler = {
    _ctor () {
        this.vDatas = [];
        this.uintVDatas = [];
        this.iDatas = [];
        this.meshCount = 0;

        this._renderDataList = new renderer.RenderDataList();
        this.setRenderDataList(this._renderDataList);
    },

    destroy () {
    },

    clear () {
        this.vDatas.length = 0;
        this.uintVDatas.length = 0;
        this.iDatas.length = 0;
        this.meshCount = 0;
        this._renderDataList.reset();
    },

    init (renderComponent) {
        if (renderComponent._assembler) {
            this.setUseModel(!!renderComponent._assembler.useModel);
        }
        if (renderComponent._vertexFormat) {
            this.setVertexFormat(renderComponent._vertexFormat._nativeObj);
        }
        renderComponent.node._proxy.addAssembler("render", this);
    },

    updateIAData (index, start, count) {
        this._renderDataList.updateIndicesRange(index, start, count);
    },

    updateMesh (index, vertices, indices) {
        this.vDatas[index] = vertices;
        this.uintVDatas[index] = new Uint32Array(vertices.buffer, 0, vertices.length);
        this.iDatas[index] = indices;
        this.meshCount = this.vDatas.length;

        this._renderDataList.updateNativeMesh(index, vertices, indices);
        this.notifyDirty(OPACITY);
    },

    updateMaterial (index, material) {
        let effect = material && material.effect;
        this.updateNativeEffect(index, effect ? effect._nativeObj : null);
    }
};

cc.js.mixin(renderer.Assembler.prototype, NativeAssembler);

module.exports = NativeAssembler;