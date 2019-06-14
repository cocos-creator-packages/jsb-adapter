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
(function(){
    if (window.sp === undefined || window.spine === undefined || window.middleware === undefined) return;

    var Skeleton = sp.Skeleton;
    var gfx = cc.gfx;
    var VertexFormat = gfx.VertexFormat;
    var assembler = Skeleton._assembler;
    
    let _slotColor = cc.color(0, 0, 255, 255);
    let _boneColor = cc.color(255, 0, 0, 255);
    let _originColor = cc.color(0, 255, 0, 255);
    
    let _getSlotMaterial = function (comp, tex, src, dst) {
    
        let key = tex.url + src + dst;

        let baseMaterial = comp.sharedMaterials[0];
        if (!baseMaterial) return null;

        let materialCache = comp._materialCache;
        let material = materialCache[key];

        if (!material) {
            material = new cc.Material();
            material.copy(baseMaterial);

            material.define('_USE_MODEL', true);
            material.define('USE_TINT', comp.useTint);
            material.setProperty('texture', tex);
    
            // update blend function
            let pass = material.effect.getDefaultTechnique().passes[0];
            pass.setBlend(
                true,
                gfx.BLEND_FUNC_ADD,
                src, dst,
                gfx.BLEND_FUNC_ADD,
                src, dst
            );
            material.updateHash(key);
            materialCache[key] = material;
        }
        else if (material.getProperty('texture') !== tex) {
            material.setProperty('texture', tex);
            material.updateHash(key);
            materialCache[key] = material;
        }
        return material;
    };
    
    // native enable useModel
    assembler.useModel = true;

    assembler.genRenderDatas = function (comp, batchData) {
    };
    
    assembler.updateRenderData = function (comp, batchData) {
    };
    
    assembler.renderIA = function (comp, renderer) {
        let nativeSkeleton = comp._skeleton;
        if (!nativeSkeleton) return;

        let node = comp.node;
        if (!node) return;

        let renderInfoOffset = comp._renderInfoOffset;
        if (!renderInfoOffset) return;

        if (comp.__preColor__ === undefined || !node.color.equals(comp.__preColor__)) {
            nativeSkeleton.setColor(node.color);
            comp.__preColor__ = node.color;
        }

        let iaPool = comp._iaPool;
        let poolIdx = 0;

        let infoOffset = renderInfoOffset[0];
        renderInfoOffset[0] = 0;
        
        let renderInfoMgr = middleware.renderInfoMgr;
        let renderInfo = renderInfoMgr.renderInfo;

        let materialIdx = 0,realTextureIndex,realTexture;
        // verify render border
        let border = renderInfo[infoOffset + materialIdx++];
        if (border !== 0xffffffff) return;

        let matLen = renderInfo[infoOffset + materialIdx++];
        let useTint = comp.useTint;

        if (matLen == 0) return;

        for (let index = 0; index < matLen; index++) {
            realTextureIndex = renderInfo[infoOffset + materialIdx++];
            realTexture = comp.skeletonData.textures[realTextureIndex];
            if (!realTexture) return;

            let material = _getSlotMaterial(comp, realTexture,
                renderInfo[infoOffset + materialIdx++],
                renderInfo[infoOffset + materialIdx++]);

            let glIB = renderInfo[infoOffset + materialIdx++];
            let glVB = renderInfo[infoOffset + materialIdx++];
            let indiceOffset = renderInfo[infoOffset + materialIdx++];
            let segmentCount = renderInfo[infoOffset + materialIdx++];

            let ia = iaPool[poolIdx];
            if (!ia) {
                ia = new middleware.MiddlewareIA();
                iaPool[poolIdx] = ia;
            }
            ia._start = indiceOffset;
            
            ia.count = segmentCount;
            ia.setVertexFormat(useTint? VertexFormat.XY_UV_Two_Color : VertexFormat.XY_UV_Color);
            ia.setGLIBID(glIB);
            ia.setGLVBID(glVB);

            poolIdx ++;

            comp._iaRenderData.ia = ia;
            comp._iaRenderData.material = material;
            renderer._flushIA(comp._iaRenderData);
        }
    
        if ((comp.debugBones || comp.debugSlots) && comp._debugRenderer) {
    
            let graphics = comp._debugRenderer;
            graphics.clear();
    
            comp._debugData = comp._debugData || nativeSkeleton.getDebugData();
            let debugData = comp._debugData;
            let debugIdx = 0;
    
            if (comp.debugSlots) {
                // Debug Slot
                graphics.strokeColor = _slotColor;
                graphics.lineWidth = 5;
    
                let debugSlotsLen = debugData[debugIdx++];
                for(let i=0; i<debugSlotsLen; i += 8){
                    graphics.moveTo(debugData[debugIdx++], debugData[debugIdx++]);
                    graphics.lineTo(debugData[debugIdx++], debugData[debugIdx++]);
                    graphics.lineTo(debugData[debugIdx++], debugData[debugIdx++]);
                    graphics.lineTo(debugData[debugIdx++], debugData[debugIdx++]);
                    graphics.close();
                    graphics.stroke();
                }
            }
    
            if (comp.debugBones) {
    
                graphics.lineWidth = 5;
                graphics.strokeColor = _boneColor;
                graphics.fillColor = _slotColor; // Root bone color is same as slot color.
    
                let debugBonesLen = debugData[debugIdx++];
                for (let i = 0; i < debugBonesLen; i += 4) {
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
    };

})();
