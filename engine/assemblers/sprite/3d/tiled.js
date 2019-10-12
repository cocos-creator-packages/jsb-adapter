(function(){
    if(!cc.Sprite.__assembler__.Tiled3D) return;

    let proto = cc.Sprite.__assembler__.Tiled3D.prototype;

    Object.assign(proto, { 
        updateWorldVerts (sprite) {
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

                    // left bottom
                    let offset = 0, padding = 6;
                    world[vertexOffset + offset] = x;
                    world[vertexOffset + offset + 1] = y;
                    world[vertexOffset + offset + 2] = 0;
                    offset += padding;

                    // right bottom
                    world[vertexOffset + offset] = x1;
                    world[vertexOffset + offset + 1] = y;
                    world[vertexOffset + offset + 2] = 0;
                    offset += padding;

                    // left top
                    world[vertexOffset + offset] = x;
                    world[vertexOffset + offset + 1] = y1;
                    world[vertexOffset + offset + 2] = 0;
                    offset += padding;

                    // right top
                    world[vertexOffset + offset] = x1;
                    world[vertexOffset + offset + 1] = y1;
                    world[vertexOffset + offset + 2] = 0; 

                    vertexOffset += 24;
                }
            }
        }
    })
})()