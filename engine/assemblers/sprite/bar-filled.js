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

const FillType = cc.Sprite.FillType;

cc.Sprite._assembler.barFilled = {
    useModel: false,
    updateRenderData (sprite) {
        let frame = sprite.spriteFrame;
        
        if (frame) {
            if (sprite._material._texture !== frame._texture) {
                sprite._activateMaterial();
            }
            sprite._renderHandle.updateMaterial(0, sprite._material);
        }

        if (frame && sprite._vertsDirty) {
            let fillStart = sprite._fillStart;
            let fillRange = sprite._fillRange;

            if (fillRange < 0) {
                fillStart += fillRange;
                fillRange = -fillRange;
            }

            fillRange = fillStart + fillRange;

            fillStart = fillStart > 1.0 ? 1.0 : fillStart;
            fillStart = fillStart < 0.0 ? 0.0 : fillStart;

            fillRange = fillRange > 1.0 ? 1.0 : fillRange;
            fillRange = fillRange < 0.0 ? 0.0 : fillRange;
            fillRange = fillRange - fillStart;
            fillRange = fillRange < 0 ? 0 : fillRange;

            let fillEnd = fillStart + fillRange;
            fillEnd = fillEnd > 1 ? 1 : fillEnd;

            this.updateUVs(sprite, fillStart, fillEnd);
            this.updateVerts(sprite, fillStart, fillEnd);
            sprite._vertsDirty = false;
        }
    },

    updateUVs (sprite, fillStart, fillEnd) {
        let spriteFrame = sprite._spriteFrame,
            renderHandle = sprite._renderHandle,
            verts = renderHandle.vDatas[0];
        //build uvs
        let atlasWidth = spriteFrame._texture.width;
        let atlasHeight = spriteFrame._texture.height;
        let textureRect = spriteFrame._rect;
        //uv computation should take spritesheet into account.
        let ul, vb, ur, vt;
        let quadUV0, quadUV1, quadUV2, quadUV3, quadUV4, quadUV5, quadUV6, quadUV7;
        if (spriteFrame._rotated) {
            ul = (textureRect.x) / atlasWidth;
            vb = (textureRect.y + textureRect.width) / atlasHeight;
            ur = (textureRect.x + textureRect.height) / atlasWidth;
            vt = (textureRect.y) / atlasHeight;

            quadUV0 = quadUV2 = ul;
            quadUV4 = quadUV6 = ur;
            quadUV3 = quadUV7 = vb;
            quadUV1 = quadUV5 = vt;
        }
        else {
            ul = (textureRect.x) / atlasWidth;
            vb = (textureRect.y + textureRect.height) / atlasHeight;
            ur = (textureRect.x + textureRect.width) / atlasWidth;
            vt = (textureRect.y) / atlasHeight;

            quadUV0 = quadUV4 = ul;
            quadUV2 = quadUV6 = ur;
            quadUV1 = quadUV3 = vb;
            quadUV5 = quadUV7 = vt;
        }

        switch (sprite._fillType) {
            case FillType.HORIZONTAL:
                verts[2] = quadUV0 + (quadUV2 - quadUV0) * fillStart;
                verts[3] = quadUV1 + (quadUV3 - quadUV1) * fillStart;
                verts[7] = quadUV0 + (quadUV2 - quadUV0) * fillEnd;
                verts[8] = quadUV1 + (quadUV3 - quadUV1) * fillEnd;
                verts[12] = quadUV4 + (quadUV6 - quadUV4) * fillStart;
                verts[13] = quadUV5 + (quadUV7 - quadUV5) * fillStart;
                verts[17] = quadUV4 + (quadUV6 - quadUV4) * fillEnd;
                verts[18] = quadUV5 + (quadUV7 - quadUV5) * fillEnd;
                break;
            case FillType.VERTICAL:
                verts[2] = quadUV0 + (quadUV4 - quadUV0) * fillStart;
                verts[3] = quadUV1 + (quadUV5 - quadUV1) * fillStart;
                verts[7] = quadUV2 + (quadUV6 - quadUV2) * fillStart;
                verts[8] = quadUV3 + (quadUV7 - quadUV3) * fillStart;
                verts[12] = quadUV0 + (quadUV4 - quadUV0) * fillEnd;
                verts[13] = quadUV1 + (quadUV5 - quadUV1) * fillEnd;
                verts[17] = quadUV2 + (quadUV6 - quadUV2) * fillEnd;
                verts[18] = quadUV3 + (quadUV7 - quadUV3) * fillEnd;
                break;
            default:
                cc.errorID(2626);
                break;
        }
    },

    updateVerts (sprite, fillStart, fillEnd) {
        let renderHandle = sprite._renderHandle,
            verts = renderHandle.vDatas[0],
            uintVerts = renderHandle.uintVDatas[0],
            node = sprite.node,
            color = node._color._val,
            width = node.width, height = node.height,
            appx = node.anchorX * width, appy = node.anchorY * height;

        let l = -appx, b = -appy,
            r = width - appx, t = height - appy;

        let progressStart, progressEnd;
        switch (sprite._fillType) {
            case FillType.HORIZONTAL:
                progressStart = l + (r - l) * fillStart;
                progressEnd = l + (r - l) * fillEnd;

                l = progressStart;
                r = progressEnd;
                break;
            case FillType.VERTICAL:
                progressStart = b + (t - b) * fillStart;
                progressEnd = b + (t - b) * fillEnd;

                b = progressStart;
                t = progressEnd;
                break;
            default:
                cc.errorID(2626);
                break;
        }

        verts[0] = l;
        verts[1] = b;
        verts[5] = r;
        verts[6] = b;
        verts[10] = l;
        verts[11] = t;
        verts[15] = r;
        verts[16] = t;
        uintVerts[4] = color;
        uintVerts[9] = color;
        uintVerts[14] = color;
        uintVerts[19] = color;
    },

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
