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
 
const renderer = window.renderer;
let _stageOffset = 0;
let _name2stageID = {};

var config = {
  addStage: function (name) {
    // already added
    if (_name2stageID[name] !== undefined) {
      return;
    }

    let stageID = 1 << _stageOffset;
    _name2stageID[name] = stageID;

    _stageOffset += 1;

    renderer.addStage(name);
  },

  stageID: function (name) {
    let id = _name2stageID[name];
    if (id === undefined) {
      return -1;
    }
    return id;
  },

  stageIDs: function (nameList) {
    let key = 0;
    for (let i = 0; i < nameList.length; ++i) {
      let id = _name2stageID[nameList[i]];
      if (id !== undefined) {
        key |= id;
      }
    }
    return key;
  }
};

export default config;