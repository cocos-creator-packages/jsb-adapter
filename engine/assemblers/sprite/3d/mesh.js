(function(){
    if(!cc.Sprite.__assembler__.Mesh3D) return;

    Object.assign(cc.Sprite.__assembler__.Mesh3D.prototype, {
        updateWorldVerts (comp) {
            let local = this._local;
            let world = this._renderData.vDatas[0];
        
            let floatsPerVert = this.floatsPerVert;
            for (let i = 0, l = local.length/2; i < l; i++) {
                vec3.set(vec3_temp, local[i*2], local[i*2+1], 0);

                let dstOffset = floatsPerVert * i;
                world[dstOffset] = vec3_temp.x;
                world[dstOffset+1] = vec3_temp.y;
                world[dstOffset+2] = vec3_temp.z;
            }
        }
    });
})()