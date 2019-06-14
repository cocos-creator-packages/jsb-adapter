
let proto = cc.Graphics.__assembler__.prototype;

let _init = proto.init;
proto.init = function (renderComp) {
    _init.call(this, renderComp);
    this.enableOpacityAlwaysDirty();
}

let _genRenderData = proto.genRenderData;
proto.genRenderData = function (graphics, cverts) {
    let buffer = _genRenderData.call(this, graphics, cverts);

    buffer.meshbuffer.setNativeAssembler(this);

    return buffer;
}
