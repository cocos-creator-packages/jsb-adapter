
let proto = cc.Graphics.__assembler__.prototype;

let _init = proto.init;
proto.init = function (renderComp) {
    _init.call(this, renderComp);
    this.ignoreOpacityFlag();
}

proto.genBuffer = function (graphics, cverts) {
    let buffers = this.getBuffers(); 
    let buffer = buffers[this._bufferOffset];
    let meshbuffer = buffer.meshbuffer;

    meshbuffer.requestStatic(cverts, cverts*3);
    this._buffer = buffer;

    meshbuffer.setNativeAssembler(this);
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
