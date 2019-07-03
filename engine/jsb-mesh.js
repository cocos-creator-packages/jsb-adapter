(function(){
    let Mesh = cc.Mesh;
    if (Mesh === undefined) return;
    let proto = cc.Mesh.prototype;
    cc.js.mixin(proto, {
        _initSubMesh () {
            let primitives = this._primitives;
            for (let i = 0; i < primitives.length; i++) {
                let primitive = primitives[i];
    
                let vertexBundle = this._vertexBundles[primitive.vertexBundleIndices[0]];
                let vbRange = vertexBundle.data;
                let gfxVFmt = new gfx.VertexFormat(vertexBundle.formats);
                this._renderData.vertexFormat = gfxVFmt;
                this._nativeObj.updateMeshData(index, gfxVFmt._nativeObj, vbData, ibData);
                this._renderData.updateMesh(index, vbData, ibData, vbRange.offset);
            }
        },
        init (vertexFormat, vertexCount, dynamic) {
            this.clear();

            let data = new Float32Array(vertexFormat._bytes * vertexCount / 4);
            
            this._renderData.setVertices(0, data);
            this._renderData.vertexFormat = vertexFormat;
            this._nativeObj.setVertexData(0, vertexFormat._nativeObj, data);
            this.emit('init-format');
        },
        setIndices (indices, index, dynamic) {
            index = index || 0;

            let data = new Uint16Array(indices);

            if (!this._renderData.iDatas[index]) {
                this._nativeObj.setIndiceData(0, data);
            } else {
                this._renderData.setIndices(0, data);
            }
        }
    });
})();