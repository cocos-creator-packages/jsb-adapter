const HTMLElement = require('./HTMLElement');
const Event = require('./Event');

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
        this.crossOrigin = null;
    }

    set src(src) {
        this._src = src;
        jsb.loadImage(src, (info) => {
            if (!info) {
                this._data = null;
                var event = new Event('error');
                this.dispatchEvent(event);
                return;
            }
            this.width = this.naturalWidth = info.width;
            this.height = this.naturalHeight = info.height;
            this._data = info.data;
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
