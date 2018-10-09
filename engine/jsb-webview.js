/****************************************************************************
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

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


(function () {
    if (!(cc && cc.WebView && cc.WebView.Impl)) {
        return;
    }

    var _impl = cc.WebView.Impl;
    var _p = cc.WebView.Impl.prototype;

    _p._updateVisibility = function () {
        if (!this._div) return;
        let div = this._div;
        if (this._visible) {
            div.style.visibility = 'visible';
        } else {
            div.style.visibility = 'hidden';
        }
        this._forceUpdate = true;
    },
    _p._updateSize = function (w, h) {
        let div = this._div;
        if (div) {
            div.style.width = w + "px";
            div.style.height = h + "px";
        }
    },
    _p._initEvent = function () {
        let iframe = this._iframe;
        if (iframe) {
            let cbs = this.__eventListeners,
                self = this;
            cbs.load = function () {
                self._dispatchEvent(WebViewImpl.EventType.LOADED);
            };
            cbs.error = function () {
                self._dispatchEvent(WebViewImpl.EventType.ERROR);
            };
            iframe.addEventListener("load", cbs.load);
            iframe.addEventListener("error", cbs.error);
        }
    },
    _p._initStyle = function () {
        if (!this._div) return;
        let div = this._div;
        div.style.position = "absolute";
        div.style.bottom = "0px";
        div.style.left = "0px";
    },
    _p._setOpacity = function (opacity) {
        let iframe = this._iframe;
        if (iframe && iframe.style) {
            iframe.style.opacity = opacity / 255;
        }
    },
    _p._createDom = function (w, h) {
        if (WebViewImpl._polyfill.enableDiv) {
            this._div = document.createElement("div");
            this._div.style["-webkit-overflow"] = "auto";
            this._div.style["-webkit-overflow-scrolling"] = "touch";
            this._iframe = document.createElement("iframe");
            this._div.appendChild(this._iframe);
            this._iframe.style.width = "100%";
            this._iframe.style.height = "100%";
        } else {
            this._div = this._iframe = document.createElement("iframe");
        }
        if (WebViewImpl._polyfill.enableBG)
            this._div.style["background"] = "#FFF";
        this._div.style["background"] = "#FFF";
        this._div.style.height = h + "px";
        this._div.style.width = w + "px";
        this._div.style.overflow = "scroll";
        this._iframe.style.border = "none";
        cc.game.container.appendChild(this._div);
        this._updateVisibility();
    },
    _p._createNativeControl = function (w, h) {
        this._createDom(w, h);
        this._initStyle();
        this._initEvent();
    },
    _p.createDomElementIfNeeded = function (w, h) {
        this._div = document.createElement('div');
        this._div.style.background = 'rgba(255, 255, 255, 0.8)';
        this._div.style.color = 'rgb(51, 51, 51)';
        this._div.style.height = w + 'px';
        this._div.style.width = h + 'px';
        this._div.style.position = 'absolute';
        this._div.style.bottom = '0px';
        this._div.style.left = '0px';
        this._div.style['word-wrap'] = 'break-word';
        cc.game.container.appendChild(this._div);
    },
    _p.removeDom = function () {
        let div = this._div;
        if (div) {
            let hasChild = utils.contains(cc.game.container, div);
            if (hasChild)
                cc.game.container.removeChild(div);
            this._div = null;
        }
        let iframe = this._iframe;
        if (iframe) {
            let cbs = this.__eventListeners;
            iframe.removeEventListener("load", cbs.load);
            iframe.removeEventListener("error", cbs.error);
            cbs.load = null;
            cbs.error = null;
            this._iframe = null;
        }
    },
    _p.setOnJSCallback = function (callback) {},
    _p.setJavascriptInterfaceScheme = function (scheme) {},
    _p.loadData = function (data, MIMEType, encoding, baseURL) {},
    _p.loadHTMLString = function (string, baseURL) {},
    /**
     * Load an URL
     * @param {String} url
     */
    _p.loadURL = function (url) {
        let iframe = this._iframe;
        if (iframe) {
            iframe.src = url;
            let self = this;
            let cb = function () {
                self._loaded = true;
                self._updateVisibility();
                iframe.removeEventListener("load", cb);
            };
            iframe.addEventListener("load", cb);
            this._dispatchEvent(WebViewImpl.EventType.LOADING);
        }
    },
    /**
     * Stop loading
     */
    _p.stopLoading = function () {
        cc.logID(7800);
    },
    /**
     * Reload the WebView
     */
    _p.reload = function () {
        let iframe = this._iframe;
        if (iframe) {
            let win = iframe.contentWindow;
            if (win && win.location)
                win.location.reload();
        }
    },
    /**
     * Determine whether to go back
     */
    _p.canGoBack = function () {
        cc.logID(7801);
        return true;
    },
    /**
     * Determine whether to go forward
     */
    _p.canGoForward = function () {
        cc.logID(7802);
        return true;
    },
    /**
     * go back
     */
    _p.goBack = function () {
        try {
            if (WebViewImpl._polyfill.closeHistory)
                return cc.logID(7803);
            let iframe = this._iframe;
            if (iframe) {
                let win = iframe.contentWindow;
                if (win && win.location)
                    win.history.back.call(win);
            }
        } catch (err) {
            cc.log(err);
        }
    },
    /**
     * go forward
     */
    _p.goForward = function () {
        try {
            if (WebViewImpl._polyfill.closeHistory)
                return cc.logID(7804);
            let iframe = this._iframe;
            if (iframe) {
                let win = iframe.contentWindow;
                if (win && win.location)
                    win.history.forward.call(win);
            }
        } catch (err) {
            cc.log(err);
        }
    },
    /**
     * In the webview execution within a period of js string
     * @param {String} str
     */
    _p.evaluateJS = function (str) {
        let iframe = this._iframe;
        if (iframe) {
            let win = iframe.contentWindow;
            try {
                win.eval(str);
                this._dispatchEvent(WebViewImpl.EventType.JS_EVALUATED);
            } catch (err) {
                console.error(err);
            }
        }
    },
    /**
     * Limited scale
     */
    _p.setScalesPageToFit = function () {
        cc.logID(7805);
    },
    /**
     * The binding event
     * @param {WebViewImpl.EventType} event
     * @param {Function} callback
     */
    _p.setEventListener = function (event, callback) {
        this._EventList[event] = callback;
    },
    /**
     * Delete events
     * @param {WebViewImpl.EventType} event
     */
    _p.removeEventListener = function (event) {
        this._EventList[event] = null;
    },
    _p._dispatchEvent = function (event) {
        let callback = this._EventList[event];
        if (callback)
            callback.call(this, this, this._iframe.src);
    },
    _p._createRenderCmd = function () {
        return new WebViewImpl.RenderCmd(this);
    },
    _p.destroy = function () {
        this.removeDom();
    },
    _p.setVisible = function (visible) {
        if (this._visible !== visible) {
            this._visible = !!visible;
            this._updateVisibility();
        }
    },
    _p.updateMatrix = function (node) {
        if (!this._div || !this._visible) return;
        node.getWorldMatrix(_mat4_temp);
        if (!this._forceUpdate &&
            this._m00 === _mat4_temp.m00 && this._m01 === _mat4_temp.m01 &&
            this._m04 === _mat4_temp.m04 && this._m05 === _mat4_temp.m05 &&
            this._m12 === _mat4_temp.m12 && this._m13 === _mat4_temp.m13 &&
            this._w === node._contentSize.width && this._h === node._contentSize.height) {
            return;
        }
        // update matrix cache
        this._m00 = _mat4_temp.m00;
        this._m01 = _mat4_temp.m01;
        this._m04 = _mat4_temp.m04;
        this._m05 = _mat4_temp.m05;
        this._m12 = _mat4_temp.m12;
        this._m13 = _mat4_temp.m13;
        this._w = node._contentSize.width;
        this._h = node._contentSize.height;
        let scaleX = cc.view._scaleX,
            scaleY = cc.view._scaleY;
        let dpr = cc.view._devicePixelRatio;
        scaleX /= dpr;
        scaleY /= dpr;
        let container = cc.game.container;
        let a = _mat4_temp.m00 * scaleX,
            b = _mat4_temp.m01,
            c = _mat4_temp.m04,
            d = _mat4_temp.m05 * scaleY;
        let offsetX = container && container.style.paddingLeft ? parseInt(container.style.paddingLeft) :0;
        let offsetY = container && container.style.paddingBottom ? parseIn(container.style.paddingBottom) : 0;
        this._updateSize(this._w, this._h);
        let w = this._div.clientWidth * scaleX;
        let h = this._div.clientHeight * scaleY;
        let appx = (w * _mat4_temp.m00) * node._anchorPoint.x;
        let appy = (h * _mat4_temp.m05) * node._anchorPoint.y;
        let tx = _mat4_temp.m12 * scaleX - appx + offsetX,
            ty = _mat4_temp.m13 * scaleY - appy + offsetY;
        let matrix = "matrix(" + a + "," + -b + "," + -c + "," + d + "," + tx + "," + -ty + ")";
        this._div.style['transform'] = matrix;
        this._div.style['-webkit-transform'] = matrix;
        this._div.style['transform-origin'] = '0px 100% 0px';
        this._div.style['-webkit-transform-origin'] = '0px 100% 0px';
        // chagned iframe opacity
        this._setOpacity(node.opacity);
    }
})();