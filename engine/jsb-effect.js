// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
const gfx = window.gfx;
const {PARAM_TEXTURE_2D, cloneObjArray, getInstanceCtor} = cc.Effect.extension;

class Effect {
    constructor(name, asset, properties = {}, defines = {}, dependencies = []) {
        this._name = name;
        this._techniques = [];
        this._properties = properties;
        this._defines = defines;
        this._dependencies = dependencies;

        var definesArr = [];
        for (var key in defines) {
            definesArr.push({name:key, value:defines[key]});
        }
    
        this._nativeObj = new renderer.EffectNative();
        this._nativeObj.init(JSON.stringify(asset), properties, definesArr);
        this._nativePtr = this._nativeObj.self();
    };

    setCullMode (cullMode = gfx.CULL_BACK) {
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
        this._nativeObj.setBlend(blendEq, blendSrc, blendDst, blendAlphaEq, blendSrcAlpha, blendDstAlpha, blendColor);
    };

    setStencilEnabled (enabled) {
        this._nativeObj.setStencilTest(enabled);
    };

    setStencil (enabled = gfx.STENCIL_INHERIT,
        stencilFunc = gfx.DS_FUNC_ALWAYS,
        stencilRef = 0,
        stencilMask = 0xff,
        stencilFailOp = gfx.STENCIL_OP_KEEP,
        stencilZFailOp = gfx.STENCIL_OP_KEEP,
        stencilZPassOp = gfx.STENCIL_OP_KEEP,
        stencilWriteMask = 0xff) {
        this._nativeObj.setStencil(stencilFunc, stencilRef, stencilMask, stencilFailOp, stencilZFailOp, stencilZPassOp, stencilWriteMask);
    };

    define(name, value) {
        this._nativeObj.define(name, value);
    };

    updateHash(hash) {
        this._nativeObj.updateHash(hash);
    };

    getDefine(name) {
        let def = this._defines[name];
        if (def === undefined) {
            cc.warn(`${this._name} : Failed to get define ${name}, define not found.`);
        }

        return def;
    };

    getProperty(name) {
        if (!this._properties[name]) {
            cc.warn(`${this._name} : Failed to get property ${name}, property not found.`);
            return null;
        }
        return this._properties[name].value;
    };

    getTechnique(stage) {
    };

    setProperty(name, value) {
        let prop = this._properties[name];
        if (!prop) {
            cc.warn(`${this._name} : Failed to set property ${name}, property not found.`);
            return;
        }

        if (Array.isArray(value)) {
            let array = prop.value;
            if (array.length !== value.length) {
                cc.warn(`${this._name} : Failed to set property ${name}, property length not correct.`);
                return;
            }
            for (let i = 0; i < value.length; i++) {
                array[i] = value[i];
            }
        }
        else {
            if (value instanceof cc.Texture2D) {
                prop.value = value.getImpl();
            }
            else if (value.array) {
                value.array(prop.value)
            }
            else {
                prop.value = value;
            }
        }
        
        this._nativeObj.setProperty(name, prop.value);
    };
}


let getInvolvedPrograms = function(json) {
    let programs = [], lib = cc.renderer._forward._programLib;
    json.techniques.forEach(tech => {
        tech.passes.forEach(pass => {
            programs.push(lib.getTemplate(pass.program));
        });
    });
    return programs;
};

let parseProperties = (function() {
    return function(json, programs) {
        let props = {};

        let properties = {};
        json.techniques.forEach(tech => {
            tech.passes.forEach(pass => {
                Object.assign(properties, pass.properties);
            })
        });

        for (let prop in properties) {
            let propInfo = properties[prop], uniformInfo;
            for (let i = 0; i < programs.length; i++) {
                uniformInfo = programs[i].uniforms.find(u => u.name === prop);
                if (uniformInfo) break;
            }
            // the property is not defined in all the shaders used in techs
            if (!uniformInfo) {
                cc.warn(`${json.name} : illegal property: ${prop}`);
                continue;
            }
            // TODO: different param with same name for different passes
            props[prop] = Object.assign({}, propInfo);
            props[prop].value = propInfo.type === cc.Effect.extension.PARAM_TEXTURE_2D ? null : new Float32Array(propInfo.value);
        }
        return props;
    }
})();

cc.Effect.parseEffect = function (effect){
    // techniques
    let programs = getInvolvedPrograms(effect);
    let props = parseProperties(effect, programs), uniforms = {}, defines = {};
    programs.forEach(p => {
        // uniforms
        p.uniforms.forEach(u => {
            let name = u.name, uniform = uniforms[name] = Object.assign({}, u);
            uniform.value = cc.Effect.extension.getInstanceCtor(u.type)(u.value);
            if (props[name]) { // effect info override
                uniform.type = props[name].type;
                uniform.value = props[name].value;
            }
        });

        p.defines.forEach(d => {
            defines[d.name] = cc.Effect.extension.getInstanceCtor(d.type)();
        })
    });
    // extensions
    let extensions = programs.reduce((acc, cur) => acc = acc.concat(cur.extensions), []);
    extensions = cc.Effect.extension.cloneObjArray(extensions);

    return new Effect(effect.name, effect, uniforms, defines, extensions);
};

