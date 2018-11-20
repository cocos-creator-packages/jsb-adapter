"use strict";

/****************************************************************************
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and  non-exclusive license
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
cc.Audio = function (src) {
  this.src = src;
  this.volume = 1;
  this.loop = false;
  this.id = -1;
};

var handleVolume = function handleVolume(volume) {
  if (!volume) {
    // set default volume as 1
    volume = 1;
  } else if (typeof volume === 'string') {
    volume = Number.parseFloat(volume);
  }

  return volume;
};

if (CC_RUNTIME) {
  var rt = loadRuntime();
  jsb.AudioEngine = rt.AudioEngine;
}

(function (proto, audioEngine) {
  // Using the new audioEngine
  cc.audioEngine = audioEngine;

  audioEngine.setMaxWebAudioSize = function () {};

  cc.Audio.State = audioEngine.AudioState;

  proto.play = function () {
    audioEngine.stop(this.id);
    var clip = this.src;

    if (clip.loaded) {
      this.id = audioEngine.play2d(clip._nativeAsset, this.loop, this.volume);
    } else {
      var self = this;
      cc.loader.load({
        url: clip.nativeUrl,
        // For audio, we should skip loader otherwise it will load a new audioClip.
        skips: ['Loader']
      }, function (err, audioNativeAsset) {
        if (err) {
          cc.error(err);
          return;
        }

        if (!clip.loaded) {
          clip._nativeAsset = audioNativeAsset;
          self.id = audioEngine.play2d(audioNativeAsset, self.loop, self.volume);
        }
      });
    }
  };

  proto.pause = function () {
    audioEngine.pause(this.id);
  };

  proto.resume = function () {
    audioEngine.resume(this.id);
  };

  proto.stop = function () {
    audioEngine.stop(this.id);
  };

  proto.destroy = function () {};

  proto.setLoop = function (loop) {
    this.loop = loop;
    audioEngine.setLoop(this.id, loop);
  };

  proto.getLoop = function () {
    return this.loop;
  };

  proto.setVolume = function (volume) {
    volume = handleVolume(volume);
    this.volume = volume;
    return audioEngine.setVolume(this.id, volume);
  };

  proto.getVolume = function () {
    return this.volume;
  };

  proto.setCurrentTime = function (time) {
    audioEngine.setCurrentTime(this.id, time);
  };

  proto.getCurrentTime = function () {
    return audioEngine.getCurrentTime(this.id);
  };

  proto.getDuration = function () {
    return audioEngine.getDuration(this.id);
  };

  proto.getState = function () {
    return audioEngine.getState(this.id);
  }; // polyfill audioEngine


  var _music = {
    id: -1,
    clip: '',
    loop: false,
    volume: 1
  };
  var _effect = {
    volume: 1
  };

  audioEngine.play = function (clip, loop, volume) {
    if (typeof volume !== 'number') {
      volume = 1;
    }

    if (typeof clip === 'string') {
      // backward compatibility since 1.10
      cc.warnID(8401, 'cc.audioEngine', 'cc.AudioClip', 'AudioClip', 'cc.AudioClip', 'audio');
      var path = clip;
      var md5Pipe = cc.loader.md5Pipe;

      if (md5Pipe) {
        path = md5Pipe.transformURL(path);
      }

      return audioEngine.play2d(path, loop, volume);
    } else {
      if (!clip) {
        return;
      }

      if (clip.loaded) {
        return audioEngine.play2d(clip._nativeAsset, loop, volume);
      } else {
        cc.loader.load({
          url: clip.nativeUrl,
          // For audio, we should skip loader otherwise it will load a new audioClip.
          skips: ['Loader']
        }, function (err, audioNativeAsset) {
          if (err) {
            cc.error(err);
            return;
          }

          if (!clip.loaded) {
            clip._nativeAsset = audioNativeAsset;
            audioEngine.play2d(audioNativeAsset, loop, volume);
          }
        }); // Deffered loading return audioID -1

        return -1;
      }
    }
  };

  audioEngine.playMusic = function (clip, loop) {
    audioEngine.stop(_music.id);
    _music.id = audioEngine.play(clip, loop, _music.volume);
    _music.loop = loop;
    _music.clip = clip;
    return _music.id;
  };

  audioEngine.stopMusic = function () {
    audioEngine.stop(_music.id);
  };

  audioEngine.pauseMusic = function () {
    audioEngine.pause(_music.id);
    return _music.id;
  };

  audioEngine.resumeMusic = function () {
    audioEngine.resume(_music.id);
    return _music.id;
  };

  audioEngine.getMusicVolume = function () {
    return _music.volume;
  };

  audioEngine.setMusicVolume = function (volume) {
    _music.volume = handleVolume(volume);
    audioEngine.setVolume(_music.id, _music.volume);
    return volume;
  };

  audioEngine.isMusicPlaying = function () {
    return audioEngine.getState(_music.id) === audioEngine.AudioState.PLAYING;
  };

  audioEngine.playEffect = function (filePath, loop) {
    return audioEngine.play(filePath, loop || false, _effect.volume);
  };

  audioEngine.setEffectsVolume = function (volume) {
    _effect.volume = handleVolume(volume);
  };

  audioEngine.getEffectsVolume = function () {
    return _effect.volume;
  };

  audioEngine.pauseEffect = function (audioID) {
    return audioEngine.pause(audioID);
  };

  audioEngine.pauseAllEffects = function () {
    var musicPlay = audioEngine.getState(_music.id) === audioEngine.AudioState.PLAYING;
    audioEngine.pauseAll();

    if (musicPlay) {
      audioEngine.resume(_music.id);
    }
  };

  audioEngine.resumeEffect = function (id) {
    audioEngine.resume(id);
  };

  audioEngine.resumeAllEffects = function () {
    var musicPaused = audioEngine.getState(_music.id) === audioEngine.AudioState.PAUSED;
    audioEngine.resumeAll();

    if (musicPaused && audioEngine.getState(_music.id) === audioEngine.AudioState.PLAYING) {
      audioEngine.pause(_music.id);
    }
  };

  audioEngine.stopEffect = function (id) {
    return audioEngine.stop(id);
  };

  audioEngine.stopAllEffects = function () {
    var musicPlaying = audioEngine.getState(_music.id) === audioEngine.AudioState.PLAYING;
    var currentTime = audioEngine.getCurrentTime(_music.id);
    audioEngine.stopAll();

    if (musicPlaying) {
      _music.id = audioEngine.play(_music.clip, _music.loop);
      audioEngine.setCurrentTime(_music.id, currentTime);
    }
  }; // incompatible implementation for game pause & resume


  audioEngine._break = audioEngine.pauseAll;
  audioEngine._restore = audioEngine.resumeAll; // deprecated

  audioEngine._uncache = audioEngine.uncache;

  audioEngine.uncache = function (clip) {
    var path;

    if (typeof clip === 'string') {
      // backward compatibility since 1.10
      cc.warnID(8401, 'cc.audioEngine', 'cc.AudioClip', 'AudioClip', 'cc.AudioClip', 'audio');
      path = clip;
    } else {
      if (!clip) {
        return;
      }

      path = clip._nativeAsset;
    }

    audioEngine._uncache(path);
  };

  audioEngine._preload = audioEngine.preload;

  audioEngine.preload = function (filePath, callback) {
    cc.warn('`cc.audioEngine.preload` is deprecated, use `cc.loader.loadRes(url, cc.AudioClip)` instead please.');

    audioEngine._preload(filePath, callback);
  };
})(cc.Audio.prototype, jsb.AudioEngine);