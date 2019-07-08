// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

class NativeCustomProperties{
    constructor()
    {
        this._nativeObj = new renderer.CustomProperties();
    }

    setProperty (name, value, directly) {
        this._nativeObj.setProperty(name, value);
    }

    define (name, value) {
        this._nativeObj.define(name, value);
    }
}

cc.CustomProperties = NativeCustomProperties;