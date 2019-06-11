
module.exports = {
    delayUpdateRenderData: true,
    updateWorldVerts (comp) {
        let local = comp._renderHandle._local;
        let verts = comp._renderHandle.vDatas[0];

        let vl = local[0], vr = local[2],
            vb = local[1], vt = local[3];

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
    }
};
