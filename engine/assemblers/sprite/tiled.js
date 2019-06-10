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

let _lastCount = 0;

cc.Sprite._assembler.tiled = {
    useModel: false,
    
    vertexOffset: 5,
    uvOffset: 2,
    colorOffset: 4,

    createData (sprite) {
        return sprite._renderHandle;
    },

    updateRenderData (sprite) {
        let frame = sprite._spriteFrame;
        let node = sprite.node,
        renderHandle = sprite._renderHandle,
        contentWidth = Math.abs(node.width),
        contentHeight = Math.abs(node.height);

        let rect = frame._rect,
            rectWidth = rect.width,
            rectHeight = rect.height,
            hRepeat = contentWidth / rectWidth,
            vRepeat = contentHeight / rectHeight,
            row = Math.ceil(vRepeat), 
            col = Math.ceil(hRepeat);

        // update data property
        let count = row * col;
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
        if (needUpdateArray || _lastCount != count) {
            _lastCount = count;
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

        // TODO: Material API design and export from editor could affect the material activation process
        // need to update the logic here
        if (frame) {
            let material = sprite._materials[0];
            let prop = material.getProperty('texture');
            if (prop !== frame._texture) {
                sprite._activateMaterial();
            }
            sprite._renderHandle.updateMaterial(0, material);
        }
        
        if (frame && sprite._vertsDirty) {
            this.updateVerts(sprite);
            sprite._vertsDirty = false;
        }
    },

    updateVerts (sprite) {
        let renderHandle = sprite._renderHandle,
        node = sprite.node,
        color = node._color._val,
        verts = renderHandle.vDatas[0],
        uintVerts = renderHandle.uintVDatas[0],
        cw = node.width, ch = node.height,
        appx = node.anchorX * cw, appy = node.anchorY * ch;

        let frame = sprite.spriteFrame;
        let rotated = frame._rotated;
        let uv = frame.uv;
        let rect = frame._rect;
        let contentWidth = Math.abs(node.width);
        let contentHeight = Math.abs(node.height);
        let rectWidth = rect.width;
        let rectHeight = rect.height;
        let hRepeat = contentWidth / rectWidth;
        let vRepeat = contentHeight / rectHeight;
        let row = Math.ceil(vRepeat), 
            col = Math.ceil(hRepeat);

        let offset = this.vertexOffset, uvOffset = this.uvOffset, colorOffset = this.colorOffset;
        let offset1 = offset, offset2 = offset*2, offset3 = offset*3, offset4 = offset*4;
        let coefu, coefv, x, y, x1, y1;
        let vOffset = 0;
        for (let yindex = 0, ylength = row; yindex < ylength; ++yindex) {
            coefv = Math.min(1, vRepeat - yindex);
            for (let xindex = 0, xlength = col; xindex < xlength; ++xindex) {
                coefu = Math.min(1, hRepeat - xindex);
                x = Math.min(rectWidth * xindex, contentWidth) - appx;
                y = Math.min(rectHeight * yindex, contentHeight) - appy;
                x1 = Math.min(rectWidth * (xindex + 1), contentWidth) - appx;
                y1 = Math.min(rectHeight * (yindex + 1), contentHeight) - appy;
                // Vertex
                // lb
                verts[vOffset] = x;
                verts[vOffset + 1] = y;
                // rb
                verts[vOffset + offset] = x1;
                verts[vOffset + offset + 1] = y;
                // lt
                verts[vOffset + offset2] = x;
                verts[vOffset + offset2 + 1] = y1;
                // rt
                verts[vOffset + offset3] = x1;
                verts[vOffset + offset3 + 1] = y1;

                let vertexOffsetU = vOffset + uvOffset;
                let vertexOffsetV = vertexOffsetU + 1;
                // UV
                if (rotated) {
                    // lb
                    verts[vertexOffsetU] = uv[0];
                    verts[vertexOffsetV] = uv[1];
                    // rb
                    verts[vertexOffsetU+offset1] = uv[0];
                    verts[vertexOffsetV+offset1] = uv[1] + (uv[7] - uv[1]) * coefu;
                    // lt
                    verts[vertexOffsetU+offset2] = uv[0] + (uv[6] - uv[0]) * coefv;
                    verts[vertexOffsetV+offset2] = uv[1];
                    // rt
                    verts[vertexOffsetU+offset3] = verts[vertexOffsetU+offset2];
                    verts[vertexOffsetV+offset3] = verts[vertexOffsetV+offset1];
                }
                else {
                    // lb
                    verts[vertexOffsetU] = uv[0];
                    verts[vertexOffsetV] = uv[1];
                    // rb
                    verts[vertexOffsetU+offset1] = uv[0] + (uv[6] - uv[0]) * coefu;
                    verts[vertexOffsetV+offset1] = uv[1];
                    // lt
                    verts[vertexOffsetU+offset2] = uv[0];
                    verts[vertexOffsetV+offset2] = uv[1] + (uv[7] - uv[1]) * coefv;
                    // rt
                    verts[vertexOffsetU+offset3] = verts[vertexOffsetU+offset1];
                    verts[vertexOffsetV+offset3] = verts[vertexOffsetV+offset2];
                }
                // color
                uintVerts[vOffset+colorOffset] = color;
                uintVerts[vOffset+colorOffset+offset1] = color;
                uintVerts[vOffset+colorOffset+offset2] = color;
                uintVerts[vOffset+colorOffset+offset3] = color;
                vOffset += offset4;
            }
        }
    },

    updateColor (sprite, color) {
        let uintVerts = sprite._renderHandle.uintVDatas[0];
        if (uintVerts) {
            color = ((uintVerts[4] & 0xff000000) >>> 0 | (color & 0x00ffffff)) >>> 0;
            let length = uintVerts.length;
            for (let offset = 4; offset < length; offset += 5) {
                uintVerts[offset] = color;
            }
        }
    },
};
