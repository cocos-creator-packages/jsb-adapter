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

'use strict';

let RenderFlow = cc.RenderFlow;
const LOCAL_TRANSFORM = RenderFlow.FLAG_LOCAL_TRANSFORM;
const COLOR = RenderFlow.FLAG_COLOR;
const OPACITY = RenderFlow.FLAG_OPACITY;
const UPDATE_RENDER_DATA = RenderFlow.FLAG_UPDATE_RENDER_DATA;
const CUSTOM_IA_RENDER = RenderFlow.FLAG_CUSTOM_IA_RENDER;

const POSITION_ON = 1 << 0;

cc.js.getset(cc.Node.prototype, "_renderFlag", function () {
    return 0;
}, function (flag) {
    if (flag === 0) return;

    let comp = this._renderComponent;
    let assembler = comp && comp._assembler;

    if (((flag & UPDATE_RENDER_DATA) || (flag & CUSTOM_IA_RENDER)) && assembler) {
        if (assembler.delayUpdateRenderData) {
            comp._renderHandle.delayUpdateRenderData();
        }
        else {
            assembler.updateRenderData(comp);
        }
    }
    if (flag & COLOR) {
        // Update uniform
        comp && comp._updateColor();
        if (assembler) {
            // Update vertex
            assembler.updateColor(comp, this._color._val);
        }
    }
});

cc.PrivateNode.prototype._posDirty = function (sendEvent) {
    let parent = this.parent;
    if (parent) {
        // Position correction for transform calculation
        this._trs[1] = this._originPos.x - (parent._anchorPoint.x - 0.5) * parent._contentSize.width;
        this._trs[2] = this._originPos.y - (parent._anchorPoint.y - 0.5) * parent._contentSize.height;
    }

    this.setLocalDirty(cc.Node._LocalDirtyFlag.POSITION);
    if (sendEvent === true && (this._eventMask & POSITION_ON)) {
        this.emit(cc.Node.EventType.POSITION_CHANGED);
    }
}