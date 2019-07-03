(function(){
    let Mesh = cc.MeshRenderer;
    if (Mesh === undefined) return;
    let proto = cc.MeshRenderer.__assembler__.prototype;
    let _init = proto.init;
    cc.js.mixin(proto, {
        _extendNative () {
            renderer.MeshAssembler.prototype.ctor.call(this);
        },

        init (comp) {
            _init.call(this, comp);
        
            this.setUseModel(true);
            this.setCustomProperties(comp._customProperties._nativeObj);
        },

        updateRenderData (comp) {
            if (!comp.mesh) return;
            this.setMesh(comp.mesh._nativeObj);
            let materials = comp.sharedMaterials;
            for (let i = 0; i < materials.length; i++) {
                let m = materials[i];
                m.getHash();
                this.updateMaterial(i, m);
            }
        }
    }, renderer.MeshAssembler.prototype);
})();