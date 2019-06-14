
cc.Assembler2D.prototype.updateWorldVerts = function(comp) {
    let local = this._renderData._local;
    let verts = this._renderData.vDatas[0];
  
    let vl = local[0],
        vr = local[2],
        vb = local[1],
        vt = local[3];
  
    // left bottom
    verts[0] = vl;
    verts[1] = vb;
    // right bottom
    verts[5] = vr;
    verts[6] = vb;
    // left top
    verts[10] = vl;
    verts[11] = vt;
    // right top
    verts[15] = vr;
    verts[16] = vt;
};

let originPackToDynamicAtlas = cc.Assembler2D.prototype.packToDynamicAtlas;
cc.Assembler2D.prototype.packToDynamicAtlas = function(comp, frame) {
    originPackToDynamicAtlas.call(this, comp, frame);

    if (frame) {
        comp._assembler.updateMaterial(0, comp.sharedMaterials[0]);
    }
};