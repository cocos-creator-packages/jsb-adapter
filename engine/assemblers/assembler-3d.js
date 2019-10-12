
(function(){
    if(!cc.Assembler3D) return;

    cc.Assembler3D.updateWorldVerts = function (comp) {
            let local = this._local;
            let world = this._renderData.vDatas[0];
            let vl = local[0], vr = local[2], vb = local[1], vt = local[3];

            // left bottom
            let floatsPerVert = this.floatsPerVert;
            let dstOffset = 0;
            world[dstOffset] = vl;
            world[dstOffset+1] = vb;
            world[dstOffset+2] = 0;

            dstOffset += floatsPerVert;

            // right bottom
            world[dstOffset] = vr;
            world[dstOffset+1] = vb;
            world[dstOffset+2] = 0;

            dstOffset += floatsPerVert;

            // left top
            world[dstOffset] = vl;
            world[dstOffset+1] = vt;
            world[dstOffset+2] = 0;

            dstOffset += floatsPerVert;

            // right top
            world[dstOffset] = vr;
            world[dstOffset+1] = vt;
            world[dstOffset+2] = 0;     
    }
})()