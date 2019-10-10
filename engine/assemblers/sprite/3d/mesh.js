(function(){
    if(!cc.Sprite.__assembler__.Mesh3D) return;

    let proto = cc.Sprite.__assembler__.Mesh3D.prototype;

    Object.assign(proto, { 
        updateWorldVerts (sprite) {
            let local = this._local;
            let world = this._renderData.vDatas[0];
         
            let floatsPerVert = this.floatsPerVert;
            for (let i = 0, l = local.length/2; i < l; i++) {
                let dstOffset = floatsPerVert * i;
                world[dstOffset] = local[i*2];
                world[dstOffset+1] = local[i*2+1];
                world[dstOffset+2] = 0;
            }
        }
    })
})()