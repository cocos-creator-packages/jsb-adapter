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
let _genID = 0;

export default class Technique {
  /**
   * @param {Array} stages
   * @param {Array} parameters
   * @param {Array} passes
   * @param {Number} layer
   */
  constructor(stages, parameters, passes, layer = 0) {
    this._id = _genID++;
    this._stageIDs = config.stageIDs(stages);
    this.stageIDs = this._stageIDs;
    this._parameters = parameters; // {name, type, size, val}
    this._passes = passes;
    this.passes = this._passes;
    this._layer = layer;
    this._stages = stages;
    // TODO: this._version = 'webgl' or 'webgl2' // ????

    var passesNative = [];
    for (var i = 0, len = passes.length; i < len; ++i) {
      passesNative.push(passes[i]._native);
    }
    this._nativeObj = new renderer.TechniqueNative(stages, parameters, passesNative, layer);

  }

  copy(technique) {
    this._id = technique._id;
    this._stageIDs = technique._stageIDs;

    this._parameters = [];
    for (let i = 0; i < technique._parameters.length; ++i) {
      let parameter = technique._parameters[i];
      this._parameters.push({name: parameter.name, type: parameter.type});
    }

    for (let i = 0; i < technique._passes.length; ++i) {
      let pass = this._passes[i];
      if (!pass) {
        pass = new renderer.Pass();
        this._passes.push(pass);
      }
        pass.copy(technique._passes[i]);
    }
    this._passes.length = technique._passes.length;
    this._layer = technique._layer;
  }

  setStages(stages) {
    this._stageIDs = config.stageIDs(stages);
    this._stages = stages;

    this._nativeObj.setStages(stages);
  }

  // get passes() {
  //   return this._passes;
  // }

  // get stageIDs() {
  //   return this._stageIDs;
  // }
}