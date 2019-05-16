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
        renderHandle.updateMaterial(0, comp.getMaterial());
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
