const HTMLElement = require('./HTMLElement');
const ImageData = require('./ImageData');
const DOMRect = require('./DOMRect');

let clamp = function (value) {
    value = Math.round(value);
    return value < 0 ? 0 : value < 255 ? value : 255;
};

class CanvasGradient {
    constructor() {
        console.log("==> CanvasGradient constructor");
    }

    addColorStop(offset, color) {
        console.log("==> CanvasGradient addColorStop");
    }
}

class TextMetrics {
    constructor(width) {
        this._width = width;
    }

    get width() {
        return this._width;
    }
}

class HTMLCanvasElement extends HTMLElement {
    constructor(width, height) {
        super('canvas')

        this.id = 'glcanvas';
        this.type = 'canvas';

        this.top = 0;
        this.left = 0;
        this._width = width ? Math.ceil(width) : 0;
        this._height = height ? Math.ceil(height) : 0;
        this._context2D = null;
        this._data = null;
        this._alignment = 4; // Canvas is used for rendering text only and we make sure the data format is RGBA.
        // Whether the pixel data is premultiplied.
        this._premultiplied = false;
    }

    //REFINE: implement opts.
    getContext(name, opts) {
        var self = this;
        // console.log(`==> Canvas getContext(${name})`);
        if (name === 'webgl' || name === 'experimental-webgl') {
            if (this === window.__canvas)
                return window.__gl;
            else
                return null;
        } else if (name === '2d') {
            if (!this._context2D) {
                this._context2D = new CanvasRenderingContext2D(this._width, this._height);
                this._data = new ImageData(this._width, this._height);
                this._context2D._canvas = this;
                this._context2D._setCanvasBufferUpdatedCallback(function (data) {
                    // FIXME: Canvas's data will take 2x memory size, one in C++, another is obtained by Uint8Array here.
                    self._data = new ImageData(data, self._width, self._height);
                    // If the width of canvas could be divided by 2, it means that the bytes per row could be divided by 8.
                    self._alignment = self._width % 2 === 0 ? 8 : 4;
                });
            }
            return this._context2D;
        }

        return null;
    }

    set width(width) {
        width = Math.ceil(width);
        if (this._width !== width) {
            this._width = width;
            if (this._context2D) {
                this._context2D._width = width;
            }
        }
    }

    get width() {
        return this._width;
    }

    set height(height) {
        height = Math.ceil(height);
        if (this._height !== height) {
            this._height = height;
            if (this._context2D) {
                this._context2D._height = height;
            }
        }
    }

    get height() {
        return this._height;
    }

    get clientWidth() {
        return this._width;
    }

    get clientHeight() {
        return this._height;
    }

    get data() {
        if (this._data) {
            return this._data.data;
        } 
        return null;
    }

    getBoundingClientRect() {
        return new DOMRect(0, 0, this._width, this._height);
    }
}

var ctx2DProto = CanvasRenderingContext2D.prototype;

// ImageData ctx.createImageData(imagedata);
// ImageData ctx.createImageData(width, height);
ctx2DProto.createImageData = function (args1, args2) {
    if (typeof args1 === 'number' && typeof args2 == 'number') {
        return new ImageData(args1, args2);
    } else if (args1 instanceof ImageData) {
        return new ImageData(args1.data, args1.width, args1.height);
    }
}

// void ctx.putImageData(imagedata, dx, dy);
// void ctx.putImageData(imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
ctx2DProto.putImageData = function (imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
    this._canvas._data = imageData;
}

// ImageData ctx.getImageData(sx, sy, sw, sh);
ctx2DProto.getImageData = function (sx, sy, sw, sh) {
    var canvasWidth = this._canvas._width;
    var canvasHeight = this._canvas._height;
    var canvasBuffer = this._canvas._data.data;
    // image rect may bigger that canvas rect
    var maxValidSH = (sh + sy) < canvasHeight ? sh : (canvasHeight - sy);
    var maxValidSW = (sw + sx) < canvasWidth ? sw : (canvasWidth - sx);
    var imgBuffer = new Uint8ClampedArray(sw * sh * 4);
    for (var y = 0; y < maxValidSH; y++) {
        for (var x = 0; x < maxValidSW; x++) {
            var canvasPos = (y + sy) * canvasWidth + (x + sx);
            var imgPos = y * sw + x;
            imgBuffer[imgPos * 4 + 0] = canvasBuffer[canvasPos * 4 + 0];
            imgBuffer[imgPos * 4 + 1] = canvasBuffer[canvasPos * 4 + 1];
            imgBuffer[imgPos * 4 + 2] = canvasBuffer[canvasPos * 4 + 2];
            imgBuffer[imgPos * 4 + 3] = canvasBuffer[canvasPos * 4 + 3];
        }
    }
    return new ImageData(imgBuffer, sw, sh);
}

module.exports = HTMLCanvasElement;

