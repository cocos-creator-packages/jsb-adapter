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
 
import InputAssembler from './input-assembler';
import config from './config';
import Effect from './effect';
import Technique from './technique';
import Pass from './pass';
import Model from './model';

const renderer = window.renderer;

// projection
renderer.PROJ_PERSPECTIVE = 0;
renderer.PROJ_ORTHO = 1;

// lights
renderer.LIGHT_DIRECTIONAL = 0;
renderer.LIGHT_POINT = 1;
renderer.LIGHT_SPOT = 2;

// shadows
renderer.SHADOW_NONE = 0;
renderer.SHADOW_HARD = 1;
renderer.SHADOW_SOFT = 2;

// parameter type
renderer.PARAM_INT = 0;
renderer.PARAM_INT2 = 1;
renderer.PARAM_INT3 = 2;
renderer.PARAM_INT4 = 3;
renderer.PARAM_FLOAT = 4;
renderer.PARAM_FLOAT2 = 5;
renderer.PARAM_FLOAT3 = 6;
renderer.PARAM_FLOAT4 = 7;
renderer.PARAM_COLOR3 = 8;
renderer.PARAM_COLOR4 = 9;
renderer.PARAM_MAT2 = 10;
renderer.PARAM_MAT3 = 11;
renderer.PARAM_MAT4 = 12;
renderer.PARAM_TEXTURE_2D = 13;
renderer.PARAM_TEXTURE_CUBE = 14;

// clear flags
renderer.CLEAR_COLOR = 1;
renderer.CLEAR_DEPTH = 2;
renderer.CLEAR_STENCIL = 4;
renderer.InputAssembler = InputAssembler;
renderer.config = config;
renderer.Effect = Effect;
renderer.Technique = Technique;
renderer.Pass = Pass;
renderer.Model = Model;

var models = [];
var sizeOfModel = 13;
var lengthOfCachedModels = 500;
// length + 500 modles(8 for each model)
var modelsData = new Float64Array(1 + lengthOfCachedModels*sizeOfModel);
var modelsData32 = new Float32Array(modelsData.buffer);
var fillModelData = function() {
  if (models.length > lengthOfCachedModels) {
    modelsData = new Floa64Array(1 + models.length*sizeOfModel);
    lengthOfCachedModels = models.length;
    modelsData32 = new Float32Array(modelsData.buffer);
  }

  modelsData[0] = models.length;
  var index64 = 1;
  var index32 = 2;
  var model;
  var worldMatrix;
  var ia;
  for (var i = 0, len = models.length; i < len; ++i) {
    model = models[i];

    ia = model._inputAssemblers[0];

    // 3 elements of 64 bits data
    modelsData[index64++] = model._effects[0]._nativePtr;
    modelsData[index64++] = ia._vertexBuffer._nativePtr;
    modelsData[index64++] = ia._indexBuffer._nativePtr;

    index32 += 6; 
    modelsData32[index32++] = model._dynamicIA;
    modelsData32[index32++] = model._viewID;
    worldMatrix = model._node.getWorldRTInAB();
    modelsData32.set(worldMatrix, index32);
    index32 += 16;

    modelsData32[index32++] = ia._start;
    modelsData32[index32++] = ia._count;

    index64 += 10;
  }
}

// ForwardRenderer adapter
var _p = renderer.ForwardRenderer.prototype;
_p._ctor = function(device, builtin) {
  if (device) {
    this.init(device, builtin.programTemplates, builtin.defaultTexture, window.innerWidth, window.innerHeight);
  }
};
_p.render = function(scene) {
  fillModelData();
  this.renderNative(scene, modelsData);

  models.length = 0;
}
_p.renderCamera = function(camera, scene) {
  fillModelData();
  this.renderCameraNative(camera, scene, modelsData);

  models.length = 0;
}

// Scene 
_p = renderer.Scene.prototype;
_p.addModel = function(model) {
  models.push(model); 
}
_p.removeModel = function() {}

export default renderer;