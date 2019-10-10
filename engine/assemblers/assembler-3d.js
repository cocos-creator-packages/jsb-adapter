
(function(){
    if(!cc.Assembler3D) return;

    const vec3 = cc.vmath.vec3;

    let vec3_temps = [];
    for (let i = 0; i < 4; i++) {
        vec3_temps.push(vec3.create());
    }

    cc.Assembler3D.updateWorldVerts = function (comp) {
            let local = this._local;
            let world = this._renderData.vDatas[0];
            
            vec3.set(vec3_temps[0], local[0], local[1], 0);
            vec3.set(vec3_temps[1], local[2], local[1], 0);
            vec3.set(vec3_temps[2], local[0], local[3], 0);
            vec3.set(vec3_temps[3], local[2], local[3], 0);

            let floatsPerVert = this.floatsPerVert;
            for (let i = 0; i < 4; i++) {
                let vertex = vec3_temps[i];
                let dstOffset = floatsPerVert * i;
                world[dstOffset] = vertex.x;
                world[dstOffset+1] = vertex.y;
                world[dstOffset+2] = vertex.z;
            }
    }
})()