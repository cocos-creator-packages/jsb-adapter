"use strict";

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
    if (!this._iframe) return;

    this._iframe.setVisible(this._visible);

    this._forceUpdate = true;
  };

  _p._updateSize = function (w, h) {};

  _p._initEvent = function () {
    var iframe = this._iframe;

    if (iframe) {
      var cbs = this.__eventListeners,
          self = this;

      cbs.load = function () {
        self._loaded = true;

        self._dispatchEvent(_impl.EventType.LOADED);
      };

      cbs.error = function () {
        self._dispatchEvent(_impl.EventType.ERROR);
      }; // native event callback


      this._iframe.setOnDidFinishLoading(cbs.load);

      this._iframe.setOnDidFailLoading(cbs.error);
    }
  };

  _p._setOpacity = function (opacity) {
    var iframe = this._iframe;

    if (iframe && iframe.style) {
      iframe.style.opacity = opacity / 255;
    }
  };

  _p.createDomElementIfNeeded = function (w, h) {
    if (!jsb.WebView) {
      cc.warn('WebView only supports mobile platform.');
      return;
    }

    if (!this._iframe) {
      this._iframe = jsb.WebView.create();

      this._initEvent();
    }
  };

  _p.removeDom = function () {
    var iframe = this._iframe;

    if (iframe) {
      var cbs = this.__eventListeners;
      cbs.load = null;
      cbs.error = null;
      this._iframe = null;
    }
  };

  _p.setOnJSCallback = function (callback) {
    var iframe = this._iframe;

    if (iframe) {
      iframe.setOnJSCallback(callback);
    }
  };

  _p.setJavascriptInterfaceScheme = function (scheme) {
    var iframe = this._iframe;

    if (iframe) {
      iframe.setJavascriptInterfaceScheme(scheme);
    }
  };

  _p.loadData = function (data, MIMEType, encoding, baseURL) {
    var iframe = this._iframe;

    if (iframe) {
      iframe.loadData(data, MIMEType, encoding, baseURL);
    }
  };

  _p.loadHTMLString = function (string, baseURL) {
    var iframe = this._iframe;

    if (iframe) {
      iframe.loadHTMLString(string, baseURL);
    }
  };
  /**
   * Load an URL
   * @param {String} url
   */


  _p.loadURL = function (url) {
    var iframe = this._iframe;

    if (iframe) {
      iframe.src = url;
      iframe.loadURL(url);

      this._dispatchEvent(_impl.EventType.LOADING);
    }
  };
  /**
   * Stop loading
   */


  _p.stopLoading = function () {
    cc.logID(7800);
  };
  /**
   * Reload the WebView
   */


  _p.reload = function () {
    var iframe = this._iframe;

    if (iframe) {
      iframe.reload();
    }
  };
  /**
   * Determine whether to go back
   */


  _p.canGoBack = function () {
    var iframe = this._iframe;

    if (iframe) {
      return iframe.canGoBack();
    }
  };
  /**
   * Determine whether to go forward
   */


  _p.canGoForward = function () {
    var iframe = this._iframe;

    if (iframe) {
      return iframe.canGoForward();
    }
  };
  /**
   * go back
   */


  _p.goBack = function () {
    var iframe = this._iframe;

    if (iframe) {
      return iframe.goBack();
    }
  };
  /**
   * go forward
   */


  _p.goForward = function () {
    var iframe = this._iframe;

    if (iframe) {
      return iframe.goForward();
    }
  };
  /**
   * In the webview execution within a period of js string
   * @param {String} str
   */


  _p.evaluateJS = function (str) {
    var iframe = this._iframe;

    if (iframe) {
      return iframe.evaluateJS();
    }
  };
  /**
   * Limited scale
   */


  _p.setScalesPageToFit = function () {
    var iframe = this._iframe;

    if (iframe) {
      return iframe.setScalesPageToFit();
    }
  };
  /**
   * The binding event
   * @param {_impl.EventType} event
   * @param {Function} callback
   */


  _p.setEventListener = function (event, callback) {
    this._EventList[event] = callback;
  };
  /**
   * Delete events
   * @param {_impl.EventType} event
   */


  _p.removeEventListener = function (event) {
    this._EventList[event] = null;
  };

  _p._dispatchEvent = function (event) {
    var callback = this._EventList[event];
    if (callback) callback.call(this, this, this._iframe.src);
  };

  _p._createRenderCmd = function () {
    return new _impl.RenderCmd(this);
  };

  _p.destroy = function () {
    this.removeDom();
  };

  _p.setVisible = function (visible) {
    if (this._visible !== visible) {
      this._visible = !!visible;

      this._updateVisibility();
    }
  };

  _p.updateMatrix = function (node) {
    if (!this._iframe || !this._visible) return;
    node.getWorldMatrix(_mat4_temp);

    if (!this._forceUpdate && this._m00 === _mat4_temp.m00 && this._m01 === _mat4_temp.m01 && this._m04 === _mat4_temp.m04 && this._m05 === _mat4_temp.m05 && this._m12 === _mat4_temp.m12 && this._m13 === _mat4_temp.m13 && this._w === node._contentSize.width && this._h === node._contentSize.height) {
      return;
    } // update matrix cache


    this._m00 = _mat4_temp.m00;
    this._m01 = _mat4_temp.m01;
    this._m04 = _mat4_temp.m04;
    this._m05 = _mat4_temp.m05;
    this._m12 = _mat4_temp.m12;
    this._m13 = _mat4_temp.m13;
    this._w = node._contentSize.width;
    this._h = node._contentSize.height;
    var scaleX = cc.view._scaleX,
        scaleY = cc.view._scaleY;
    var dpr = cc.view._devicePixelRatio;
    scaleX /= dpr;
    scaleY /= dpr;
    var container = cc.game.container;
    var a = _mat4_temp.m00 * scaleX,
        b = _mat4_temp.m01,
        c = _mat4_temp.m04,
        d = _mat4_temp.m05 * scaleY;
    var offsetX = container && container.style.paddingLeft ? parseInt(container.style.paddingLeft) : 0;
    var offsetY = container && container.style.paddingBottom ? parseIn(container.style.paddingBottom) : 0;
    var w, h;

    if (_impl._polyfill.zoomInvalid) {
      this._updateSize(this._w * a, this._h * d);

      a = 1;
      d = 1;
      w = this._w * scaleX;
      h = this._h * scaleY;
    } else {
      this._updateSize(this._w, this._h);

      w = this._w * scaleX;
      h = this._h * scaleY;
    }

    var appx = w * _mat4_temp.m00 * node._anchorPoint.x;
    var appy = h * _mat4_temp.m05 * node._anchorPoint.y;
    var tx = _mat4_temp.m12 * scaleX - appx + offsetX,
        ty = _mat4_temp.m13 * scaleY - appy + offsetY;
    var height = cc.view.getFrameSize().height; // set webview rect

    this._iframe.setFrame(tx, height - h - ty, this._w * a, this._h * d);
  };
})();