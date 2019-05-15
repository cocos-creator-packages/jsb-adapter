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
        renderHandle.updateMaterial(0, comp.getMaterial());

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
