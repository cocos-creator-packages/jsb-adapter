// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
let ctor2enums = cc.CustomProperties.ctor2enums
class NativeCustomProperties {
    constructor() {
        this._nativeObj = new renderer.CustomProperties();
    }

    setProperty (name, value, directly) {
        let type = ctor2enums[value.constructor];
        let prop = value.constructor === cc.Texture2D ? value.getImpl() : new Float32Array(value);
        this._nativeObj.setProperty(name, type, prop);
    }

    define (name, value) {
        this._nativeObj.define(name, value);
    }
}

cc.CustomProperties = NativeCustomProperties;