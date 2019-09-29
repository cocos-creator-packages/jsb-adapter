(function(){
    if(!cc.Sprite.__assembler__.Simple3D) return;

    let proto = cc.Sprite.__assembler__.Simple3D.prototype;
    let nativeProto = renderer.AssemblerSprite.prototype;

    Object.assign(proto, { 
        _extendNative  () {
            nativeProto.ctor.call(this);
        }
    })
})()