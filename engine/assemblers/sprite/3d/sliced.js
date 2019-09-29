(function(){
    if(!cc.Sprite.__assembler__.Sliced3D) return;

    let proto = cc.Sprite.__assembler__.Sliced3D.prototype;
    let nativeProto = renderer.AssemblerSprite.prototype;

    Object.assign(proto, {
        updateWorldVerts (comp) {
            this._dirtyPtr[0] |= cc.Assembler.FLAG_VERTICES_DIRTY;
        },
        
        _extendNative  () {
            nativeProto.ctor.call(this);
        },
        
        initLocal  () {
            this._local = new Float32Array(8);
            nativeProto.setLocalData.call(this, this._local);
        }
    })
   
})()