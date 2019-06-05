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

const WHITE = cc.color(255, 255, 255, 255);

cc.Label._assembler.ttf = cc.js.addon({
    delayUpdateRenderData: true,
    
    createData (comp) {
        let renderHandle = comp._renderHandle;

        if (renderHandle.meshCount === 0) {
            let vertices = new Float32Array(20);
            vertices[2] = 0;
            vertices[3] = 1;
            vertices[7] = 1;
            vertices[8] = 1;
            vertices[12] = 0;
            vertices[13] = 0;
            vertices[17] = 1;
            vertices[18] = 0;
            let indices = new Uint16Array(6);
            indices[0] = 0;
            indices[1] = 1;
            indices[2] = 2;
            indices[3] = 1;
            indices[4] = 3;
            indices[5] = 2;
            renderHandle.updateMesh(0, vertices, indices);
            let uintVerts = renderHandle.uintVDatas[0];
            uintVerts[4] = uintVerts[9] = uintVerts[14] = uintVerts[19] = WHITE._val;
        }

        return renderHandle;
    },

    updateColor (label, color) {},

    _updateVerts (comp) {
        let renderHandle = comp._renderHandle;
        renderHandle.updateMaterial(0, comp.getMaterial(0));

        let node = comp.node,
            width = node.width,
            height = node.height,
            appx = node.anchorX * width,
            appy = node.anchorY * height;

        let verts = renderHandle.vDatas[0];
        verts[0] = -appx;
        verts[1] = -appy;
        verts[5] = width - appx;
        verts[6] = -appy;
        verts[10] = -appx;
        verts[11] = height - appy;
        verts[15] = width - appx;
        verts[16] = height - appy;
    }
}, cc.textUtils.ttf);
