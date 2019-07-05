
let proto = cc.Graphics.__assembler__.prototype;

let _init = proto.init;
proto.init = function (renderComp) {
    _init.call(this, renderComp);
    this.enableOpacityAlwaysDirty();
}

let _genBuffer = proto.genBuffer;
proto.genBuffer = function (graphics, cverts) {
    let buffer = _genBuffer.call(this, graphics, cverts);
    buffer.meshbuffer.setNativeAssembler(this);
    return buffer;
}

let _stroke = proto.stroke;
proto.stroke = function (graphics) {
    _stroke.call(this, graphics);
    let buffer = this._buffer;
    buffer.meshbuffer.used(buffer.vertexStart, buffer.indiceStart);
}

let _fill = proto.fill;
proto.fill = function (graphics) {
    _fill.call(this, graphics);
    let buffer = this._buffer;
    buffer.meshbuffer.used(buffer.vertexStart, buffer.indiceStart);
}

proto.initVertexFormat = function () {
    this.setVertexFormat(cc.gfx.VertexFormat.XY_Color._nativeObj);
}