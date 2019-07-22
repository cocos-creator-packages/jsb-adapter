cc.Assembler2D.prototype.updateWorldVerts = function(comp) {
    let local = this._local;
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

let _updateColor = cc.Assembler2D.prototype.updateColor;
cc.Assembler2D.prototype.updateColor = function(comp, color) {
    this._dirtyPtr[0] |= cc.Assembler.FLAG_VERTICES_OPACITY_CHANGED;
    _updateColor.call(this, comp, color);
};
