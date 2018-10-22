const HTMLElement = require('./HTMLElement');
const ImageData = require('./ImageData');
const DOMRect = require('./DOMRect');

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
                this._context2D._canvas = this;
                this._context2D._setCanvasBufferUpdatedCallback(function(data) {
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

    getBoundingClientRect() {
        return new DOMRect(0, 0, this._width, this._height);
    }
}

var ctx2DProto = CanvasRenderingContext2D.prototype;

// ImageData ctx.createImageData(imagedata);
// ImageData ctx.createImageData(width, height);
ctx2DProto.createImageData = function(imagedata, width, height) {
    if (typeof imagedata === 'number' && typeof width == 'number') {
        return new ImageData(imagedata, width);
    }
    else if (imagedata instanceof ImageData) {
        return new imageData(imagedata.data);
    }
}

// void ctx.putImageData(imagedata, dx, dy);
// void ctx.putImageData(imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
ctx2DProto.putImageData = function(imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
    var desData = this._canvas._data;
    var imgData = imageData.data;
    var height = imageData.height;
    var width = imageData.width;
    dirtyX = dirtyX || 0;
    dirtyY = dirtyY || 0;
    dirtyWidth = dirtyWidth !== undefined? dirtyWidth: width;
    dirtyHeight = dirtyHeight !== undefined? dirtyHeight: height;
    var limitBottom = dirtyY + dirtyHeight;
    var limitRight = dirtyX + dirtyWidth;
    for (var y = dirtyY; y < limitBottom; y++) {
      for (var x = dirtyX; x < limitRight; x++) {
        var imgPos = y * width + x;
        var desPos = (y + dy) * this._canvas.width + (x + dx)
        desData[desPos*4+0] = imgData[imgPos*4+0];
        desData[desPos*4+1] = imgData[imgPos*4+1];
        desData[desPos*4+2] = imgData[imgPos*4+2];
        desData[desPos*4+3] = imgData[imgPos*4+3];
      }
    }
}

ctx2DProto.getImageData = function(sx, sy, sw, sh) {
    //REFINE:cjh
    return this._canvas._data;
}

module.exports = HTMLCanvasElement;

