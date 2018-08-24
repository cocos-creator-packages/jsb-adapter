/****************************************************************************
 Copyright (c) 2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

const HTMLElement = require('./HTMLElement');
const Event = require('./Event');
const gl = window.__gl;

class HTMLImageElement extends HTMLElement {
    constructor(width, height, isCalledFromImage) {
        if (!isCalledFromImage) {
            throw new TypeError("Illegal constructor, use 'new Image(w, h); instead!'");
            return;
        }
        super('img')
        this.width = width ? width : 0;
        this.height = height ? height : 0;
        this._data = null;
        this._src = null;
        this.complete = false;
        this._glFormat = this._glInternalFormat = gl.RGBA;
        this.crossOrigin = null;
    }

    set src(src) {
        this._src = src;
        jsb.loadImage(src, (info) => {
            if (!info) {
                var event = new Event('error');
                this.dispatchEvent(event);
                return;
            }
            this.width = this.naturalWidth = info.width;
            this.height = this.naturalHeight = info.height;
            this._data = info.data;
            // console.log(`glFormat: ${info.glFormat}, glInternalFormat: ${info.glInternalFormat}, glType: ${info.glType}`);
            this._glFormat = info.glFormat;
            this._glInternalFormat = info.glInternalFormat;
            this._glType = info.glType;
            this._numberOfMipmaps = info.numberOfMipmaps;
            this._compressed = info.compressed;
            this._bpp = info.bpp;
            this._premultiplyAlpha = info.premultiplyAlpha;

            this._alignment = 1;
            // Set the row align only when mipmapsNum == 1 and the data is uncompressed
            if ((this._numberOfMipmaps == 0 || this._numberOfMipmaps == 1) && !this._compressed) {
                const bytesPerRow = this.width * this._bpp / 8;
                if (bytesPerRow % 8 == 0)
                    this._alignment = 8;
                else if (bytesPerRow % 4 == 0)
                    this._alignment = 4;
                else if (bytesPerRow % 2 == 0)
                    this._alignment = 2;
            }

            this.complete = true;

            var event = new Event('load');
            this.dispatchEvent(event);
        });
    }

    get src() {
        return this._src;
    }

    get clientWidth() {
        return this.width;
    }

    get clientHeight() {
        return this.height;
    }

    getBoundingClientRect() {
        return new DOMRect(0, 0, this.width, this.height);
    }
}

module.exports = HTMLImageElement;
