/****************************************************************************
 LICENSING AGREEMENT
 
 Xiamen Yaji Software Co., Ltd., (the “Licensor”) grants the user (the “Licensee”) non-exclusive and non-transferable rights to use the software according to the following conditions:
 a.  The Licensee shall pay royalties to the Licensor, and the amount of those royalties and the payment method are subject to separate negotiations between the parties.
 b.  The software is licensed for use rather than sold, and the Licensor reserves all rights over the software that are not expressly granted (whether by implication, reservation or prohibition).
 c.  The open source codes contained in the software are subject to the MIT Open Source Licensing Agreement (see the attached for the details);
 d.  The Licensee acknowledges and consents to the possibility that errors may occur during the operation of the software for one or more technical reasons, and the Licensee shall take precautions and prepare remedies for such events. In such circumstance, the Licensor shall provide software patches or updates according to the agreement between the two parties. The Licensor will not assume any liability beyond the explicit wording of this Licensing Agreement.
 e.  Where the Licensor must assume liability for the software according to relevant laws, the Licensor’s entire liability is limited to the annual royalty payable by the Licensee.
 f.  The Licensor owns the portions listed in the root directory and subdirectory (if any) in the software and enjoys the intellectual property rights over those portions. As for the portions owned by the Licensor, the Licensee shall not:
 - i. Bypass or avoid any relevant technical protection measures in the products or services;
 - ii. Release the source codes to any other parties;
 - iii. Disassemble, decompile, decipher, attack, emulate, exploit or reverse-engineer these portion of code;
 - iv. Apply it to any third-party products or services without Licensor’s permission;
 - v. Publish, copy, rent, lease, sell, export, import, distribute or lend any products containing these portions of code;
 - vi. Allow others to use any services relevant to the technology of these codes;
 - vii. Conduct any other act beyond the scope of this Licensing Agreement.
 g.  This Licensing Agreement terminates immediately if the Licensee breaches this Agreement. The Licensor may claim compensation from the Licensee where the Licensee’s breach causes any damage to the Licensor.
 h.  The laws of the People's Republic of China apply to this Licensing Agreement.
 i.  This Agreement is made in both Chinese and English, and the Chinese version shall prevail the event of conflict.
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
            if (sprite._material._texture !== frame._texture) {
                sprite._activateMaterial();
            }
            sprite._renderHandle.updateMaterial(0, sprite._material);
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
