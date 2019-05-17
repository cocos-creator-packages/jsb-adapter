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

const RenderFlow = cc.RenderFlow;
const BEFORE_RENDER = RenderFlow.EventType.BEFORE_RENDER;

cc.js.mixin(renderer.RenderHandle.prototype, {
    _ctor () {
        this.vDatas = [];
        this.uintVDatas = [];
        this.iDatas = [];
        this.effects = [];
        this.meshCount = 0;
        this._material = null;
        this._delayed = false;
        this._comp = null;
    },

    destroy () {
        RenderFlow.off(BEFORE_RENDER, this.updateRenderData, this);
        this._comp = null;
    },

    bind (component) {
        if (this._comp !== component && component instanceof cc.RenderComponent) {
            this._comp = component;
            if (component._assembler) {
                this.setUseModel(!!component._assembler.useModel);
            }
            if (component._vertexFormat) {
                this.setVertexFormat(component._vertexFormat._nativeObj);
            }
        }
    },

    reserveMeshCount (count) {
        if (this.meshCount < count) {
            this.vDatas.length = count;
            this.uintVDatas.length = count;
            this.iDatas.length = count;
            this.effects.length = count;
            this.setMeshCount(count);
        }
    },
    
    updateMesh (index, vertices, indices) {
        this.reserveMeshCount(index+1);

        this.vDatas[index] = vertices;
        this.uintVDatas[index] = new Uint32Array(vertices.buffer, 0, vertices.length);
        this.iDatas[index] = indices;
        this.meshCount = this.vDatas.length;

        this.updateNativeMesh(index, vertices, indices);
    },

    updateMaterial (index, material) {
        this.reserveMeshCount(index + 1);
        let oldEffect = this.effects[index];
        let newEffect;

        if (material) {
            newEffect = this.effects[index] = material.effect;
        } else {
            newEffect = this.effects[index] = null;
        }
        if (newEffect !== oldEffect) {
            this.updateNativeEffect(index, newEffect ? newEffect._nativeObj : null);
        }
    },

    updateEnabled (enabled) {
        if (enabled) {
            if (!this._enabled) {
                this._enabled = true;
                this.enable();
                let node = this._comp.node;
                if (node) {
                    node._proxy.addHandle("render", this);
                }
            }
        }
        else {
            if (this._enabled) {
                this._enabled = false;
                this.disable();
                let node = this._comp.node;
                if (node) {
                    node._proxy.removeHandle("render");
                }
            }
        }
    },

    delayUpdateRenderData () {
        if (this._comp) {
            RenderFlow.on(BEFORE_RENDER, this.updateRenderData, this);
            this._delayed = true;
        }
    },

    updateRenderData () {
        if (this._comp && this._comp._assembler) {
            this._comp._assembler.updateRenderData(this._comp);
            this._delayed = false;
        }
    },
});