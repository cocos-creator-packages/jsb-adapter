/****************************************************************************
 Copyright (c) 2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com
 
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

import config from './config';

const renderer = window.renderer;

export default class Effect {
  /**
   * @param {Array} techniques
   */
  constructor(techniques, properties = {}, defines = []) {
    this._techniques = techniques;
    this._properties = properties;
    this._defines = defines;

    var techniqueObjs = [];
    var techniqueObj;
    for (var i = 0, len = techniques.length; i < len; ++i) {
      techniqueObj = techniques[i]._nativeObj; 
      techniqueObjs.push(techniqueObj);
    }

    this._nativeObj = new renderer.EffectNative();
    this._nativeObj.init(techniqueObjs, properties, defines);
    this._nativePtr = this._nativeObj.self();

    // TODO: check if params is valid for current technique???
  }

  clear() {
    this._techniques.length = 0;
    this._properties = null;
    this._defines.length = 0;
    this._nativeObj.clear();
  }

  getTechnique(stage) {
    let stageID = config.stageID(stage);
    for (let i = 0; i < this._techniques.length; ++i) {
      let tech = this._techniques[i];
      if (tech.stageIDs & stageID) {
        return tech;
      }
    }

    return null;
  }

  getProperty(name) {
    return this._properties[name];
  }

  setProperty(name, value) {
    // TODO: check if params is valid for current technique???
    this._properties[name] = value;
    this._nativeObj.setProperty(name, value);
  }

  getDefine(name) {
    for (let i = 0; i < this._defines.length; ++i) {
      let def = this._defines[i];
      if ( def.name === name ) {
        return def.value;
      }
    }

    console.warn(`Failed to get define ${name}, define not found.`);
    return null;
  }

  define(name, value) {
    for (let i = 0; i < this._defines.length; ++i) {
      let def = this._defines[i];
      if ( def.name === name ) {
        def.value = value;
        this._nativeObj.define(name, value);
        return;
      }
    }

    console.warn(`Failed to set define ${name}, define not found.`);
  }

  // extractDefines(out = {}) {
  //   for (let i = 0; i < this._defines.length; ++i) {
  //     let def = this._defines[i];
  //     out[def.name] = def.value;
  //   }

  //   return out;
  // }

  updateHash (hash) {
    this._nativeObj.updateHash(hash);
  }

  getHash () {
    this._nativeObj.getHash();
  }
}