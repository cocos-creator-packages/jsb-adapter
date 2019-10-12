// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
(function(){
    if (!cc.CustomProperties) return;

    class NativeCustomProperties {
        constructor() {
            this._nativeObj = new renderer.CustomProperties();
        }

        setProperty (name, value, type, directly) {
            let prop
            if (value.constructor === cc.Texture2D){
                prop = value.getImpl(); 
            } else if (Array.isArray(value)){
                prop = new Float32Array(value);
            } else {
                prop = value;
            }
            
            this._nativeObj.setProperty(name, type, prop, directly);
        }

        define (name, value) {
            this._nativeObj.define(name, value);
        }
    }

    cc.CustomProperties = NativeCustomProperties;
})();   