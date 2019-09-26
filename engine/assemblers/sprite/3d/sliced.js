(function(){
    if(!cc.Sprite.__assembler__.Sliced3D) return;

    Object.assign(cc.Sprite.__assembler__.Sliced3D.prototype, {
        updateWorldVerts (comp) {
            let local = this._local;
            let world = this._renderData.vDatas[0];
    
            let floatsPerVert = this.floatsPerVert;
            for (let row = 0; row < 4; ++row) {
                let localRowY = local[row * 2 + 1];
                for (let col = 0; col < 4; ++col) {
                    let localColX = local[col * 2];
                    
                    vec3.set(vec3_temp_local, localColX, localRowY, 0);
    
                    let worldIndex = (row * 4 + col) * floatsPerVert;
                    world[worldIndex] = vec3_temp_local.x;
                    world[worldIndex+1] = vec3_temp_local.y;
                    world[worldIndex+2] = vec3_temp_local.z;
                }
            }
        }
    });
})()