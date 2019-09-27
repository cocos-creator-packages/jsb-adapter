(function(){
    if(!cc.Label.__assembler__.Bmfont3D) return;

    Object.assign(cc.Label.__assembler__.Bmfont3D.prototype, {
        updateWorldVerts (comp) {
            let local = this._local;
            let world = this._renderData.vDatas[0];

            let floatsPerVert = this.floatsPerVert;
            for (let offset = 0; offset < world.length; offset += floatsPerVert) {
                vec3.set(vec3_temp_local, local[offset], local[offset+1], 0);

                world[offset] = vec3_temp_local.x;
                world[offset+1] = vec3_temp_local.y;
                world[offset+2] = vec3_temp_local.z;
            }
        }
    });
})()