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

cc.Sprite._assembler.simple = {
    useModel: false,

    createData (sprite) {
        let renderHandle = sprite._renderHandle;

        if (renderHandle.meshCount === 0) {
            let vertices = new Float32Array(20);
            let indices = new Uint16Array(6);
            indices[0] = 0;
            indices[1] = 1;
            indices[2] = 2;
            indices[3] = 1;
            indices[4] = 3;
            indices[5] = 2;
            renderHandle.updateMesh(0, vertices, indices);
        }

        // No render data needed for native
        return renderHandle;
    },
    
    updateRenderData (sprite) {
        let frame = sprite._spriteFrame;
        
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

    updateColor (sprite, color) {
        let uintVerts = sprite._renderHandle.uintVDatas[0];
        if (uintVerts) {
            // Keep alpha channel for cpp to update
            color = ((uintVerts[4] & 0xff000000) >>> 0 | (color & 0x00ffffff)) >>> 0;
            uintVerts[4] = color;
            uintVerts[9] = color;
            uintVerts[14] = color;
            uintVerts[19] = color;
        }
    },

    updateVerts (sprite) {
        let renderHandle = sprite._renderHandle,
            node = sprite.node,
            frame = sprite.spriteFrame,
            color = node._color._val,
            verts = renderHandle.vDatas[0],
            uintVerts = renderHandle.uintVDatas[0],
            cw = node.width, ch = node.height,
            appx = node.anchorX * cw, appy = node.anchorY * ch,
            l, b, r, t;
        if (sprite.trim) {
            l = -appx;
            b = -appy;
            r = cw - appx;
            t = ch - appy;
        }
        else {
            let ow = frame._originalSize.width, oh = frame._originalSize.height,
                rw = frame._rect.width, rh = frame._rect.height,
                offset = frame._offset,
                scaleX = cw / ow, scaleY = ch / oh;
            let trimLeft = offset.x + (ow - rw) / 2;
            let trimRight = offset.x - (ow - rw) / 2;
            let trimBottom = offset.y + (oh - rh) / 2;
            let trimTop = offset.y - (oh - rh) / 2;
            l = trimLeft * scaleX - appx;
            b = trimBottom * scaleY - appy;
            r = cw + trimRight * scaleX - appx;
            t = ch + trimTop * scaleY - appy;
        }

        // Keep alpha channel for cpp to update
        color = ((uintVerts[4] & 0xff000000) | (color & 0x00ffffff) >>> 0) >>> 0;

        // get uv from sprite frame directly
        let uv = frame.uv;
        
        verts[0] = l;
        verts[1] = b;
        verts[2] = uv[0];
        verts[3] = uv[1];
        verts[5] = r;
        verts[6] = b;
        verts[7] = uv[2];
        verts[8] = uv[3];
        verts[10] = l;
        verts[11] = t;
        verts[12] = uv[4];
        verts[13] = uv[5];
        verts[15] = r;
        verts[16] = t;
        verts[17] = uv[6];
        verts[18] = uv[7];
        uintVerts[4] = color;
        uintVerts[9] = color;
        uintVerts[14] = color;
        uintVerts[19] = color;
    }
};