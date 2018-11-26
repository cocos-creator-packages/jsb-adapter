"use strict";

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
(function () {
  if (!(cc && cc.VideoPlayer && cc.VideoPlayer.Impl)) {
    return;
  }

  var _impl = cc.VideoPlayer.Impl;
  var _p = cc.VideoPlayer.Impl.prototype;

  _p._bindEvent = function () {
    var video = this._video,
        self = this;

    if (!video) {
      return;
    } //binding event


    var cbs = this.__eventListeners;

    cbs.loadedmetadata = function () {
      self._loadedmeta = true;

      self._dispatchEvent(_impl.EventType.META_LOADED);
    };

    cbs.ended = function () {
      if (self._video !== video) return;
      self._playing = false;

      self._dispatchEvent(_impl.EventType.COMPLETED);
    };

    cbs.play = function () {
      if (self._video !== video) return;
      self._playing = true;

      self._dispatchEvent(_impl.EventType.PLAYING);
    };

    cbs.pause = function () {
      if (self._ignorePause || self._video !== video) return;
      self._playing = false;

      self._dispatchEvent(_impl.EventType.PAUSED);
    };

    cbs.click = function () {
      self._dispatchEvent(_impl.EventType.CLICKED);
    };

    cbs.stoped = function () {
      self._dispatchEvent(_impl.EventType.STOPPED);

      self._ignorePause = false;
    };

    video.addEventListener("loadedmetadata", cbs.loadedmetadata);
    video.addEventListener("ended", cbs.ended);
    video.addEventListener("play", cbs.play);
    video.addEventListener("pause", cbs.pause);
    video.addEventListener("click", cbs.click);
    video.addEventListener("stoped", cbs.stoped);

    function onCanPlay() {
      if (this._loaded) return;
      this._loaded = true;

      this._dispatchEvent(_impl.EventType.READY_TO_PLAY);

      this._updateVisibility();
    }

    cbs.onCanPlay = onCanPlay.bind(this);
    video.addEventListener('canplay', cbs.onCanPlay);
    video.addEventListener('canplaythrough', cbs.onCanPlay);
    video.addEventListener('suspend', cbs.onCanPlay);
  };

  _p._updateVisibility = function () {
    if (!this._video) return;
    var video = this._video;

    if (this._visible) {
      this._video.setVisible(true);
    } else {
      this._video.setVisible(false);

      video.pause();
      this._playing = false;
    }

    this._forceUpdate = true;
  };

  _p._updateSize = function (width, height) {};

  _p.createDomElementIfNeeded = function () {
    if (!jsb.VideoPlayer) {
      cc.warn('VideoPlayer only supports mobile platform.');
      return null;
    }

    if (!this._video) {
      this._video = new jsb.VideoPlayer();
    }
  };

  _p.removeDom = function () {
    var video = this._video;

    if (video) {
      this._video.stop();

      this._video.setVisible(false);

      var cbs = this.__eventListeners;
      cbs.loadedmetadata = null;
      cbs.ended = null;
      cbs.play = null;
      cbs.pause = null;
      cbs.click = null;
      cbs.onCanPlay = null;
    }

    this._video = null;
    this._url = "";
  };

  _p.setURL = function (path) {
    var source, extname;

    if (this._url === path) {
      return;
    }

    this.removeDom();
    this._url = path;
    this.createDomElementIfNeeded();

    this._bindEvent();

    var video = this._video;

    if (!video) {
      return;
    }

    video.setVisible(this._visible);
    this._loaded = false;
    this._played = false;
    this._playing = false;
    this._loadedmeta = false;
    video.setURL(this._url);
  };

  _p.stop = function () {
    var video = this._video;
    if (!video || !this._visible) return;
    this._ignorePause = true;
    video.stop();
    this._playing = false;
  };

  _p.setVolume = function (volume) {};

  _p.seekTo = function (time) {
    var video = this._video;
    if (!video) return;

    if (this._loaded) {
      video.seekTo(time);
    } else {
      var cb = function cb() {
        video.seekTo(time);
      };

      video.addEventListener(_impl._polyfill.event, cb);
    }

    if (_impl._polyfill.autoplayAfterOperation && this.isPlaying()) {
      setTimeout(function () {
        video.play();
      }, 20);
    }
  };

  _p.duration = function () {
    var video = this._video;
    var duration = -1;
    if (!video) return duration;
    duration = video.duration();

    if (duration <= 0) {
      cc.logID(7702);
    }

    return duration;
  };

  _p.currentTime = function () {
    var video = this._video;
    if (!video) return -1;
    return video.currentTime();
  };

  _p.setKeepAspectRatioEnabled = function (isEnabled) {
    if (!this._video) {
      return false;
    }

    return this._video.setKeepAspectRatioEnabled(isEnabled);
  };

  _p.isKeepAspectRatioEnabled = function () {
    if (!this._video) {
      return false;
    }

    return this._video.isKeepAspectRatioEnabled();
  };

  _p.setFullScreenEnabled = function (enable) {
    var video = this._video;

    if (!video) {
      return;
    }

    this._fullScreenEnabled = enable;
    video.setFullScreenEnabled(enable);
  };

  _p.updateMatrix = function (node) {
    if (!this._video || !this._visible) return;
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
    var offsetY = container && container.style.paddingBottom ? parseInt(container.style.paddingBottom) : 0;
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
    var height = cc.view.getFrameSize().height;

    this._video.setFrame(tx, height - h - ty, this._w * a, this._h * d);
  };
})();