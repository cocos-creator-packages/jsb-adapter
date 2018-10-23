/****************************************************************************
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

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
const StencilManager = cc.StencilManager.sharedManager;
const Skeleton = sp.Skeleton;
const renderer = cc.renderer;
const RenderFlow = cc.RenderFlow;
const renderEngine = renderer.renderEngine;
const gfx = renderEngine.gfx;
const SpriteMaterial = renderEngine.SpriteMaterial;

const STENCIL_SEP = '@';

let _sharedMaterials = {};

let _slotColor = cc.color(0, 0, 255, 255);
let _boneColor = cc.color(255, 0, 0, 255);
let _originColor = cc.color(0, 255, 0, 255);

function _updateKeyWithStencilRef (key, stencilRef) {
    return key.replace(/@\d+$/, STENCIL_SEP + stencilRef);
}

function _getSlotMaterial (tex, src, dst) {

    let key = tex.url + src + dst + STENCIL_SEP + '0';
    let material = _sharedMaterials[key];
    if (!material) {
        material = new SpriteMaterial();
        material.useModel = true;
        // update texture
        material.texture = tex;
        material.useColor = false;

        // update blend function
        let pass = material._mainTech.passes[0];
        pass.setBlend(
            gfx.BLEND_FUNC_ADD,
            src, dst,
            gfx.BLEND_FUNC_ADD,
            src, dst
        );
        _sharedMaterials[key] = material;
        material.updateHash(key);
    }
    else if (material.texture !== tex) {
        material.texture = tex;
        material.updateHash(key);
    }
    return material;
}

Skeleton._assembler.genRenderDatas = function (comp, batchData) {
}

Skeleton._assembler.updateRenderData = function (comp, batchData) {
    let skeleton = comp._skeleton;
    if (skeleton) {
        skeleton.updateWorldTransform();
    }
    else {
        comp._renderDatas.length = 0;
    }
}

Skeleton._assembler.fillBuffers = function (comp, renderer) {

    if(comp.__preColor__ === undefined || 
       !comp.node.color.equals(comp.__preColor__)){
        comp._skeleton.setColor(comp.node.color);
        comp.__preColor__ = comp.node.color;
    }

    if(comp.__preDebugBones__!==comp.debugBones){
        comp._skeleton.setDebugBonesEnabled(comp.debugBones);
        comp.__preDebugBones__ = comp.debugBones;
    }

    if(comp.__preDebugSlots__ !== comp.debugSlots){
        comp._skeleton.setDebugSlotsEnabled(comp.debugSlots);
        comp.__preDebugSlots__ = comp.debugSlots;
    }

    if(comp.__prePremultipliedAlpha !== comp.premultipliedAlpha){
        comp._skeleton.setOpacityModifyRGB(comp.premultipliedAlpha);
        comp.__prePremultipliedAlpha = comp.premultipliedAlpha;
    }

    let jsbSkeleton = comp._skeleton;
    let renderData = jsbSkeleton.getRenderData();
    let renderDataFloat = new Float32Array(renderData.buffer);
    let indiceData = jsbSkeleton.getIndiceData();

    let renderIdx = 0,indiceIdx = 0,realTextureIndex,realTexture;
    let matLen = renderData[renderIdx++];

    for (let index = 0; index < matLen; index++) {
        realTextureIndex = renderData[renderIdx++];
        realTexture = comp.skeletonData.textures[realTextureIndex];
        var material = _getSlotMaterial(realTexture,
                                        renderData[renderIdx++],
                                        renderData[renderIdx++]);

        // For generate new material for skeleton render data nested in mask,
        // otherwise skeleton inside/outside mask with same material will interfere each other
        let key = material._hash;
        let newKey = _updateKeyWithStencilRef(key, StencilManager.getStencilRef());
        if (key !== newKey) {
            material = _sharedMaterials[newKey] || material.clone();
            material.updateHash(newKey);
            if (!_sharedMaterials[newKey]) {
                _sharedMaterials[newKey] = material;
            }
        }

        if (material !== renderer.material) {
            renderer._flush();
            renderer.node = comp.node;
            renderer.material = material;
        }

        let buffer = renderer._meshBuffer,
            vertexOffset = buffer.byteOffset >> 2,
            vertexCount = renderData[renderIdx++],
            indiceCount = renderData[renderIdx++];

        let indiceOffset = buffer.indiceOffset,
            vertexId = buffer.vertexOffset;
        
        buffer.request(vertexCount, indiceCount);

        // buffer data may be realloc, need get reference after request.
        let vbuf = buffer._vData,
            ibuf = buffer._iData;

        let vertexs = renderDataFloat.subarray(renderIdx,renderIdx + vertexCount*5);
        vbuf.set(vertexs,vertexOffset);
        renderIdx+=vertexs.length;

        // index buffer
        for (let i = 0; i < indiceCount; i ++) {
            ibuf[indiceOffset++] = vertexId + indiceData[indiceIdx++];
        }

    }

    if (comp.debugBones || comp.debugSlots) {

        let graphics = comp._debugRenderer;
        graphics.clear();

        let debugData = jsbSkeleton.getDebugData();
        let debugIdx = 0;

        if (comp.debugSlots) {
            // Debug Slot
            graphics.strokeColor = _slotColor;
            graphics.lineWidth = 5;

            let debugSlotsLen = debugData[debugIdx++];
            for(var i=0;i<debugSlotsLen;i+=8){
                graphics.moveTo(debugData[debugIdx++], debugData[debugIdx++]);
                graphics.lineTo(debugData[debugIdx++], debugData[debugIdx++]);
                graphics.lineTo(debugData[debugIdx++], debugData[debugIdx++]);
                graphics.lineTo(debugData[debugIdx++], debugData[debugIdx++]);
                graphics.close();
                graphics.stroke();
            }
        }

        if(comp.debugBones){

            graphics.lineWidth = 5;
            graphics.strokeColor = _boneColor;
            graphics.fillColor = _slotColor; // Root bone color is same as slot color.

            let debugBonesLen = debugData[debugIdx++];
            for (let i = 0; i < debugBonesLen; i+=4) {
                let bx = debugData[debugIdx++];
                let by = debugData[debugIdx++];
                let x = debugData[debugIdx++];
                let y = debugData[debugIdx++];

                // Bone lengths.
                graphics.moveTo(bx, by);
                graphics.lineTo(x, y);
                graphics.stroke();

                // Bone origins.
                graphics.circle(bx, by, Math.PI * 2);
                graphics.fill();
                if (i === 0) {
                    graphics.fillColor = _originColor;
                }
            }
        }
    }

    comp.node._renderFlag |= RenderFlow.FLAG_UPDATE_RENDER_DATA;
}