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

let _dataOffset = 0;

cc.Label._assembler.bmfont = cc.js.addon({
    delayUpdateRenderData: true,

    createData (comp) {
        return comp._renderHandle;
    },

    _reserveQuads (comp, count) {
        let renderHandle = comp._renderHandle;

        let vBytes = count * 4 * 5 * 4;
        let iBytes = count * 6 * 2;
        let bytes = vBytes + iBytes;
        let needUpdateArray = false;

        if (!renderHandle.flexBuffer) {
            renderHandle.flexBuffer = new cc.FlexBuffer(bytes);
            needUpdateArray = true;
        }
        else {
            needUpdateArray = renderHandle.flexBuffer.reserve(bytes);
        }

        let buffer = renderHandle.flexBuffer.buffer;
        let vData = renderHandle.vDatas[0];
        if (needUpdateArray || !vData || vData.length != count) {
            let vertices = new Float32Array(buffer, 0, vBytes / 4);
            let indices = new Uint16Array(buffer, vBytes, iBytes / 2);
            for (let i = 0, vid = 0; i < indices.length; i += 6, vid += 4) {
                indices[i] = vid;
                indices[i+1] = vid+1;
                indices[i+2] = vid+2;
                indices[i+3] = vid+1;
                indices[i+4] = vid+3;
                indices[i+5] = vid+2;
            }
            renderHandle.updateMesh(0, vertices, indices);
        }
        renderHandle.updateMaterial(0, comp.getMaterial(0));
        _dataOffset = 0;
    },

    _quadsUpdated (comp) {
        _dataOffset = 0;
    },

    appendQuad (comp, texture, rect, rotated, x, y, scale) {
        let renderHandle = comp._renderHandle;
        let verts = renderHandle.vDatas[0],
            uintVerts = renderHandle.uintVDatas[0];

        let texw = texture.width,
            texh = texture.height,
            rectWidth = rect.width,
            rectHeight = rect.height,
            color = comp.node._color._val;

        // Keep alpha channel for cpp to update
        color = ((uintVerts[4] & 0xff000000) | (color & 0x00ffffff) >>> 0) >>> 0;

        let l, b, r, t;
        if (!rotated) {
            l = (rect.x) / texw;
            r = (rect.x + rectWidth) / texw;
            b = (rect.y + rectHeight) / texh;
            t = (rect.y) / texh;

            verts[_dataOffset+2] = l;
            verts[_dataOffset+3] = b;
            verts[_dataOffset+7] = r;
            verts[_dataOffset+8] = b;
            verts[_dataOffset+12] = l;
            verts[_dataOffset+13] = t;
            verts[_dataOffset+17] = r;
            verts[_dataOffset+18] = t;
        } else {
            l = (rect.x) / texw;
            r = (rect.x + rectHeight) / texw;
            b = (rect.y + rectWidth) / texh;
            t = (rect.y) / texh;

            verts[_dataOffset+2] = l;
            verts[_dataOffset+3] = t;
            verts[_dataOffset+7] = l;
            verts[_dataOffset+8] = b;
            verts[_dataOffset+12] = r;
            verts[_dataOffset+13] = t;
            verts[_dataOffset+17] = r;
            verts[_dataOffset+18] = b;
        }

        verts[_dataOffset] = x;
        verts[_dataOffset+1] = y - rectHeight * scale;
        verts[_dataOffset+5] = x + rectWidth * scale;
        verts[_dataOffset+6] = y - rectHeight * scale;
        verts[_dataOffset+10] = x;
        verts[_dataOffset+11] = y;
        verts[_dataOffset+15] = x + rectWidth * scale;
        verts[_dataOffset+16] = y;
        uintVerts[_dataOffset+4] = color;
        uintVerts[_dataOffset+9] = color;
        uintVerts[_dataOffset+14] = color;
        uintVerts[_dataOffset+19] = color;

        _dataOffset += 20;
    },

    updateColor (label, color) {
        let uintVerts = label._renderHandle.uintVDatas[0];
        if (uintVerts) {
            // Keep alpha channel for cpp to update
            color = ((uintVerts[4] & 0xff000000) >>> 0 | (color & 0x00ffffff)) >>> 0;

            let length = uintVerts.length;
            for (let offset = 4; offset < length; offset += 5) {
                uintVerts[offset] = color;
            }
        }
    },
}, cc.textUtils.bmfont);
