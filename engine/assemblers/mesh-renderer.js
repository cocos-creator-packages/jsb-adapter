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
            this._renderData = new cc.RenderData();
            this._renderData.init(this);
            this.setUseModel(true);
            this.setCustomProperties(comp._customProperties._nativeObj);
            let mesh = comp.mesh;
            if (!mesh) return;

            let subdatas = comp.mesh.subDatas;
            for(let i = 0, len = subdatas.length; i < len; i++) {
                let data = subdatas[i];
                this._renderData.updateMesh(i, data.vData, data.iData);
            }
        },

        updateRenderData (comp) {   
        },

        updateMeshData (comp) {
            let mesh = comp.mesh;
            if (!mesh) return;

            let subdatas = comp.mesh.subDatas;
            for(let i = 0, len = subdatas.length; i < len; i++) {
                let data = subdatas[i];
                if (data.vDirty || data.iDirty) {
                    this._renderData.updateMesh(i, data.vData, data.iData);
                }
            }
            this.setCustomProperties(comp._customProperties._nativeObj);
            this.setVertexFormat(subdatas[0].vfm._nativeObj);
        }
    }, renderer.MeshAssembler.prototype);
})();