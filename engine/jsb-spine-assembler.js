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
    var renderer = cc.renderer;
    var renderEngine = renderer.renderEngine;
    var gfx = renderEngine.gfx;
    var VertexFormat = gfx.VertexFormat;
    var SpineMaterial = renderEngine.SpineMaterial;
    var assembler = Skeleton._assembler;
    
    var _slotColor = cc.color(0, 0, 255, 255);
    var _boneColor = cc.color(255, 0, 0, 255);
    var _originColor = cc.color(0, 255, 0, 255);
    
    var _getSlotMaterial = function (comp, tex, src, dst) {
    
        var key = tex.url + src + dst;

        comp._material = comp._material || new SpineMaterial();
        let baseMaterial = comp._material;
        let materialCache = comp._materialCache;
        let material = materialCache[key];

        if (!material) {

            var baseKey = baseMaterial._hash;
            if (!materialCache[baseKey]) {
                material = baseMaterial;
            } else {
                material = baseMaterial.clone();
            }

            material.useModel = true;
            // update texture
            material.texture = tex;
            material.useTint = comp.useTint;
    
            // update blend function
            var pass = material._mainTech.passes[0];
            pass.setBlend(
                gfx.BLEND_FUNC_ADD,
                src, dst,
                gfx.BLEND_FUNC_ADD,
                src, dst
            );

            if (materialCache[material._hash]) {
                delete materialCache[material._hash];
            }
            materialCache[key] = material;
            material.updateHash(key);
        }
        else if (material.texture !== tex) {
            if (materialCache[material._hash]) {
                delete materialCache[material._hash];
            }
            material.texture = tex;
            material.updateHash(key);
        }
        return material;
    }
    
    assembler.genRenderDatas = function (comp, batchData) {
    }
    
    assembler.updateRenderData = function (comp, batchData) {
    }
    
    assembler.renderIA = function (comp, renderer) {
        var nativeSkeleton = comp._skeleton;
        if (!nativeSkeleton) return;

        var node = comp.node;
        if (!node) return;

        if (comp.__preColor__ === undefined || !node.color.equals(comp.__preColor__)) {
            nativeSkeleton.setColor(node.color);
            comp.__preColor__ = node.color;
        }

        var iaPool = comp._iaPool;
        var poolIdx = 0;

        var materialData = comp._materialData;

        var materialIdx = 0,realTextureIndex,realTexture;
        var matLen = materialData[materialIdx++];
        var indiceOffset = materialData[materialIdx++];
        var useTint = comp.useTint;

        if (matLen == 0) return;

        for (var index = 0; index < matLen; index++) {
            realTextureIndex = materialData[materialIdx++];
            realTexture = comp.skeletonData.textures[realTextureIndex];
            
            var material = _getSlotMaterial(comp, realTexture,
                materialData[materialIdx++],
                materialData[materialIdx++]);

            var glIB = materialData[materialIdx++];
            var glVB = materialData[materialIdx++];
            var segmentCount = materialData[materialIdx++];

            var ia = iaPool[poolIdx];
            if (!ia) {
                ia = new middleware.MiddlewareIA();
                iaPool[poolIdx] = ia;
            }
            ia._start = indiceOffset;
            ia._count = segmentCount;
            ia.setParam(useTint? VertexFormat.XY_UV_Two_Color : VertexFormat.XY_UV_Color, glIB, glVB);

            indiceOffset += segmentCount;
            poolIdx ++;

            comp._iaRenderData.ia = ia;
            comp._iaRenderData.material = material;
            renderer._flushIA(comp._iaRenderData);
        }
    
        if (comp.debugBones || comp.debugSlots) {
    
            var graphics = comp._debugRenderer;
            graphics.clear();
    
            comp._debugData = comp._debugData || nativeSkeleton.getDebugData();
            var debugData = comp._debugData;
            var debugIdx = 0;
    
            if (comp.debugSlots) {
                // Debug Slot
                graphics.strokeColor = _slotColor;
                graphics.lineWidth = 5;
    
                var debugSlotsLen = debugData[debugIdx++];
                for(var i=0;i<debugSlotsLen;i+=8){
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
    
                var debugBonesLen = debugData[debugIdx++];
                for (var i = 0; i < debugBonesLen; i += 4) {
                    var bx = debugData[debugIdx++];
                    var by = debugData[debugIdx++];
                    var x = debugData[debugIdx++];
                    var y = debugData[debugIdx++];
    
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
    }

})();
