
let proto = cc.RenderData.prototype;
cc.RenderData.prototype.init = function (assembler) {
    this._renderDataList = new renderer.RenderDataList();
    assembler.setRenderDataList(this._renderDataList);
};

let originClear = proto.clear;
proto.clear = function () {
    originClear.call(this);
    this._renderDataList.clear();
}

let originUpdateMesh = proto.updateMesh;
proto.updateMesh = function (meshIndex, vertices, indices) {
    originUpdateMesh.call(this, meshIndex, vertices, indices);
    this._renderDataList.updateMesh(meshIndex, vertices, indices);
    // this.notifyDirty(OPACITY);
}