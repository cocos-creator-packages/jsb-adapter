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

const Mask = cc.Mask;
const RenderFlow = cc.RenderFlow;
const spriteAssembler = cc.Sprite._assembler.simple;
const graphicsAssembler = cc.Graphics._assembler;

cc.Mask._assembler = {
    delayUpdateRenderData: true,
    updateRenderData (mask) {
        if (!mask._renderData) {
            // Update clear graphics material
            graphicsAssembler.updateRenderData(mask._clearGraphics);

            if (mask._type === Mask.Type.IMAGE_STENCIL) {
                mask._renderData = spriteAssembler.createData(mask);
            }
        }
        let renderData = mask._renderData;
        if (mask._type === Mask.Type.IMAGE_STENCIL) {
            if (mask.spriteFrame) {
                renderData.dataLength = 4;
                spriteAssembler.updateRenderData(mask);
                renderData._material = mask.sharedMaterials[0];
            }
            else {
                mask.setMaterial(0, null);
            }
            mask._renderHandle.useImageStencil(true);
        }
        else {
            mask._graphics.setMaterial(0, mask.sharedMaterials[0]);
            graphicsAssembler.updateRenderData(mask._graphics);
            mask._renderHandle.useImageStencil(false);
        }
        mask._renderHandle.updateMaterial(0, mask.sharedMaterials[0]);
        mask._renderHandle.setMaskInverted(mask.inverted);
        mask._renderHandle.setUseModel(mask._type !== Mask.Type.IMAGE_STENCIL);
    },

    updateColor () {}
};
