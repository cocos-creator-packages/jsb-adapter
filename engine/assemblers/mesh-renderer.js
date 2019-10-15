(function(){
    let Mesh = cc.MeshRenderer;
    if (Mesh === undefined) return;
    let proto = cc.MeshRenderer.__assembler__.prototype;
    let _init = proto.init;
    cc.js.mixin(proto, {
        initVertexFormat () {},
        
        _extendNative () {
            renderer.MeshAssembler.prototype.ctor.call(this);
        },

        init (comp) {
            _init.call(this, comp);

            this._renderDataList = new renderer.RenderDataList();
            this.setRenderDataList(this._renderDataList);

            this.setUseModel(true);
            this.updateMeshData();
        },

        updateRenderData (comp) {   
        },

        setRenderNode (node) {
            this.setNode(node._proxy);
        },

        updateMeshData () {
            let comp = this._renderComp;
            let mesh = comp.mesh;
            if (!mesh) return;

            if (!mesh.loaded) {
                mesh.once('load', this.updateMeshData, this);
                return;
            }

            let subdatas = comp.mesh.subDatas;
            for(let i = 0, len = subdatas.length; i < len; i++) {
                let data = subdatas[i];
                if (data.vDirty || data.iDirty) {
                    this._renderDataList.updateMesh(i, data.vData, data.iData);
                }
            }
            this.setCustomProperties(comp._customProperties._nativeObj);
            this.setVertexFormat(subdatas[0].vfm._nativeObj);
        }
    }, renderer.MeshAssembler.prototype);
})();