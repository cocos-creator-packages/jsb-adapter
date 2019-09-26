(function(){
    if(!cc.Sprite.__assembler__.Tiled3D) return;

    Object.assign(cc.Sprite.__assembler__.Tiled3D.prototype, {
        updateWorldVerts (comp) {
            let local = this._local;
            let localX = local.x, localY = local.y;
            let world = this._renderData.vDatas[0];
            let { row, col } = this;
            let x, x1, y, y1;
            let vertexOffset = 0;
            for (let yindex = 0, ylength = row; yindex < ylength; ++yindex) {
                y = localY[yindex];
                y1 = localY[yindex + 1];
                for (let xindex = 0, xlength = col; xindex < xlength; ++xindex) {
                    x = localX[xindex];
                    x1 = localX[xindex + 1];

                    vec3.set(vec3_temps[0], x, y, 0);
                    vec3.set(vec3_temps[1], x1, y, 0);
                    vec3.set(vec3_temps[2], x, y1, 0);
                    vec3.set(vec3_temps[3], x1, y1, 0);

                    for (let i = 0; i < 4; i++) {
                        let vec3_temp = vec3_temps[i];
                        let offset = i * 6;
                        world[vertexOffset + offset] = vec3_temp.x;
                        world[vertexOffset + offset + 1] = vec3_temp.y;
                        world[vertexOffset + offset + 2] = vec3_temp.z;
                    }

                    vertexOffset += 24;
                }
            }
        }
    });
})()