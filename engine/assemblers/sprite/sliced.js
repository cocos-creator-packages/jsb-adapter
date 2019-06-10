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

let temp = [
    {x: 0, y: 0},
    {x: 0, y: 0},
    {x: 0, y: 0},
    {x: 0, y: 0},
];

cc.Sprite._assembler.sliced = {
    useModel: false,

    createData (sprite) {
        let renderHandle = sprite._renderHandle;

        if (renderHandle.meshCount === 0) {
            let vertices = new Float32Array(80);
            let indices = new Uint16Array(54);

            let indexOffset = 0;
            for (let r = 0; r < 3; ++r) {
                for (let c = 0; c < 3; ++c) {
                    let start = r*4 + c;
                    indices[indexOffset++] = start;
                    indices[indexOffset++] = start + 1;
                    indices[indexOffset++] = start + 4;
                    indices[indexOffset++] = start + 1;
                    indices[indexOffset++] = start + 5;
                    indices[indexOffset++] = start + 4;
                }
            }
            renderHandle.updateMesh(0, vertices, indices);
        }

        return renderHandle;
    },

    updateRenderData (sprite) {
        let frame = sprite.spriteFrame;
        
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
    
    updateVerts (sprite) {
        let renderHandle = sprite._renderHandle,
            verts = renderHandle.vDatas[0],
            uintVerts = renderHandle.uintVDatas[0],
            node = sprite.node,
            color = node._color._val,
            width = node.width, height = node.height,
            appx = node.anchorX * width, appy = node.anchorY * height;
    
        let frame = sprite.spriteFrame;
        let leftWidth = frame.insetLeft;
        let rightWidth = frame.insetRight;
        let topHeight = frame.insetTop;
        let bottomHeight = frame.insetBottom;
    
        let sizableWidth = width - leftWidth - rightWidth;
        let sizableHeight = height - topHeight - bottomHeight;
        let xScale = width / (leftWidth + rightWidth);
        let yScale = height / (topHeight + bottomHeight);
        xScale = (isNaN(xScale) || xScale > 1) ? 1 : xScale;
        yScale = (isNaN(yScale) || yScale > 1) ? 1 : yScale;
        sizableWidth = sizableWidth < 0 ? 0 : sizableWidth;
        sizableHeight = sizableHeight < 0 ? 0 : sizableHeight;
        
        temp[0].x = -appx;
        temp[0].y = -appy;
        temp[1].x = leftWidth * xScale - appx;
        temp[1].y = bottomHeight * yScale - appy;
        temp[2].x = temp[1].x + sizableWidth;
        temp[2].y = temp[1].y + sizableHeight;
        temp[3].x = width - appx;
        temp[3].y = height - appy;

        color = ((uintVerts[4] & 0xff000000) | (color & 0x00ffffff) >>> 0) >>> 0;
        let uvSliced = sprite.spriteFrame.uvSliced;
        for (let row = 0; row < 4; ++row) {
            let rowD = temp[row];
            for (let col = 0; col < 4; ++col) {
                let vid = row * 4 + col;
                let uv = uvSliced[vid];
                let colD = temp[col];
                let voffset = vid * 5;
                verts[voffset] = colD.x;
                verts[voffset+1] = rowD.y;
                verts[voffset+2] = uv.u;
                verts[voffset+3] = uv.v;
                uintVerts[voffset+4] = color;
            }
        }
    },
};