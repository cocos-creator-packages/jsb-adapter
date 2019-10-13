// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
const gfx = window.gfx;

let Effect = cc.Effect;

class NativeEffect extends Effect {
    constructor(name, techniques, properties = {}, defines = {}, dependencies = [], asset = null) {
        super(name, techniques, properties, defines, dependencies);

        if (asset) {
            var definesArr = [];
            for (var key in defines) {
                definesArr.push({name:key, value:defines[key]});
            }
        
            this._nativeObj = new renderer.EffectNative();
            this._nativeObj.init(JSON.stringify(asset), properties, definesArr);
            this._nativePtr = this._nativeObj.self();
        }
    }

    setCullMode (cullMode = gfx.CULL_BACK) {
        super.setCullMode(cullMode);
        this._nativeObj.setCullMode(cullMode);
    }

    setBlend (enabled = false,
        blendEq = gfx.BLEND_FUNC_ADD,
        blendSrc = gfx.BLEND_SRC_ALPHA,
        blendDst = gfx.BLEND_ONE_MINUS_SRC_ALPHA,
        blendAlphaEq = gfx.BLEND_FUNC_ADD,
        blendSrcAlpha = gfx.BLEND_SRC_ALPHA,
        blendDstAlpha = gfx.BLEND_ONE_MINUS_SRC_ALPHA,
        blendColor = 0xffffffff) {
        super.setBlend(enabled, blendEq, blendSrc, blendDst, blendAlphaEq, blendSrcAlpha, blendDstAlpha, blendColor);
        this._nativeObj.setBlend(blendEq, blendSrc, blendDst, blendAlphaEq, blendSrcAlpha, blendDstAlpha, blendColor);
    };

    setStencilEnabled (enabled) {
        super.setStencilEnabled(enabled);
        this._nativeObj.setStencilTest(enabled);
    }

    setStencil (enabled = gfx.STENCIL_INHERIT,
        stencilFunc = gfx.DS_FUNC_ALWAYS,
        stencilRef = 0,
        stencilMask = 0xff,
        stencilFailOp = gfx.STENCIL_OP_KEEP,
        stencilZFailOp = gfx.STENCIL_OP_KEEP,
        stencilZPassOp = gfx.STENCIL_OP_KEEP,
        stencilWriteMask = 0xff) {
        super.setStencil(enabled, stencilFunc, stencilRef, stencilMask, stencilFailOp, stencilZFailOp, stencilZPassOp, stencilWriteMask);
        this._nativeObj.setStencil(stencilFunc, stencilRef, stencilMask, stencilFailOp, stencilZFailOp, stencilZPassOp, stencilWriteMask);
    }

    define(name, value) {
        super.define(name, value);
        this._nativeObj.define(name, value);
    }

    updateHash(hash) {
        this._nativeObj.updateHash(hash);
    }
    
    getTechnique(stage) {
    }

    setProperty (name, val) {
        super.setProperty(name, val);

        let prop = this._properties[name];
        if (prop) {
            this._nativeObj.setProperty(name, prop.value);
        }
    }

    clone () {
        let effect = super.clone();
        effect._nativeObj = new renderer.EffectNative();
        effect._nativeObj.copy(this._nativeObj);
        effect._nativePtr = effect._nativeObj.self();
        return effect;
    }
}

// Effect.parseTechniques = function () {
//     return [];
// }

cc.Effect = NativeEffect;
