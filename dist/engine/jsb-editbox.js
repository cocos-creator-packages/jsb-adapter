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
  if (!(cc && cc.EditBox)) {
    return;
  }

  var KeyboardReturnType = cc.EditBox.KeyboardReturnType;
  var InputMode = cc.EditBox.InputMode;
  var InputFlag = cc.EditBox.InputFlag;
  var _p = cc.EditBox._EditBoxImpl.prototype;

  function getInputType(type) {
    switch (type) {
      case InputMode.EMAIL_ADDR:
        return 'email';

      case InputMode.NUMERIC:
      case InputMode.DECIMAL:
        return 'number';

      case InputMode.PHONE_NUMBER:
        return 'phone';

      case InputMode.URL:
        return 'url';

      case InputMode.SINGLE_LINE:
      case InputMode.ANY:
      default:
        return 'text';
    }
  }

  function getKeyboardReturnType(type) {
    switch (type) {
      case KeyboardReturnType.DEFAULT:
      case KeyboardReturnType.DONE:
        return 'done';

      case KeyboardReturnType.SEND:
        return 'send';

      case KeyboardReturnType.SEARCH:
        return 'search';

      case KeyboardReturnType.GO:
        return 'go';

      case KeyboardReturnType.NEXT:
        return 'next';
    }

    return 'done';
  }

  function updateLabelsInvisible(editBox) {
    var placeholderLabel = editBox._placeholderLabel;
    var textLabel = editBox._textLabel;
    var displayText = editBox._impl._text;
    placeholderLabel.node.active = displayText === '';
    textLabel.node.active = displayText !== '';
  }

  cc.EditBox.prototype.editBoxEditingDidBegan = function () {
    cc.Component.EventHandler.emitEvents(this.editingDidBegan, this);
    this.node.emit('editing-did-began', this);
  };

  cc.EditBox.prototype.editBoxEditingDidEnded = function () {
    cc.Component.EventHandler.emitEvents(this.editingDidEnded, this);
    this.node.emit('editing-did-ended', this);
  };

  cc.EditBox.prototype._updateStayOnTop = function () {// jsb not support
  };

  _p.createInput = function () {
    var editBoxImpl = this;
    editBoxImpl._editing = true;
    var multiline = this._inputMode === InputMode.ANY;
    var inputTypeString = getInputType(editBoxImpl._inputMode);
    if (editBoxImpl._inputFlag === InputFlag.PASSWORD) inputTypeString = 'password';

    var rect = this._getRect();

    jsb.inputBox.show({
      defaultValue: editBoxImpl._text,
      maxLength: editBoxImpl._maxLength,
      multiple: multiline,
      confirmHold: false,
      confirmType: getKeyboardReturnType(editBoxImpl._returnType),
      inputType: inputTypeString,
      originX: rect.x,
      originY: rect.y,
      width: rect.width,
      height: rect.height
    });

    if (this._delegate) {
      var editBox = this._delegate;
      cc.Component.EventHandler.emitEvents(editBox.editingDidBegan, editBox);
      editBox.node.emit('editing-did-began', editBox);
      updateLabelsInvisible(editBox);
    }

    function onConfirm(res) {
      editBoxImpl._delegate && editBoxImpl._delegate.editBoxEditingReturn && editBoxImpl._delegate.editBoxEditingReturn();
    }

    jsb.inputBox.onConfirm(onConfirm);

    function onInput(res) {
      if (res.value.length > editBoxImpl._maxLength) {
        res.value = res.value.slice(0, editBoxImpl._maxLength);
      }

      if (editBoxImpl._delegate && editBoxImpl._delegate.editBoxTextChanged) {
        if (editBoxImpl._text !== res.value) {
          editBoxImpl._text = res.value;

          editBoxImpl._delegate.editBoxTextChanged(editBoxImpl._text);
        }
      }
    }

    jsb.inputBox.onInput(onInput);

    function onComplete(res) {
      editBoxImpl._endEditing();

      jsb.inputBox.offConfirm(onConfirm);
      jsb.inputBox.offInput(onInput);
      jsb.inputBox.offComplete(onComplete);
    }

    jsb.inputBox.onComplete(onComplete);
  };

  _p.setTabIndex = function (index) {// jsb not support 
  };

  _p.setFocus = function () {
    this._beginEditing();
  };

  _p.isFocused = function () {
    return this._editing;
  }, _p.stayOnTop = function (flag) {// jsb not support 	
  };

  _p._updateMatrix = function () {// jsb not support 			
  };

  _p._updateSize = function (newWidth, newHeight) {// jsb not support
  };

  _p._getRect = function () {
    var node = this._node,
        scaleX = cc.view._scaleX,
        scaleY = cc.view._scaleY;
    var dpr = cc.view._devicePixelRatio;
    var math = cc.vmath;
    var matrix = math.mat4.create();
    node.getWorldMatrix(matrix);
    var contentSize = node._contentSize;
    var vec3 = cc.v3();
    vec3.x = -node._anchorPoint.x * contentSize.width;
    vec3.y = -node._anchorPoint.y * contentSize.height;
    math.mat4.translate(matrix, matrix, vec3);
    scaleX /= dpr;
    scaleY /= dpr;
    var finalScaleX = matrix.m00 * scaleX;
    var finaleScaleY = matrix.m05 * scaleY;
    return {
      x: matrix.m12 * finalScaleX,
      y: matrix.m13 * finaleScaleY,
      width: contentSize.width * finalScaleX,
      height: contentSize.height * finaleScaleY
    };
  };

  _p.setMaxLength = function (maxLength) {
    if (!isNaN(maxLength)) {
      if (maxLength < 0) {
        //we can't set Number.MAX_VALUE to input's maxLength property
        //so we use a magic number here, it should works at most use cases.
        maxLength = 65535;
      }

      this._maxLength = maxLength;
    }
  };

  _p.setString = function (text) {
    this._text = text;

    this._updateInput();

    updateLabelsInvisible(this._delegate);
  };

  _p._updateInput = function () {
    var tmpText = this._text;

    if (this._inputFlag === InputFlag.PASSWORD) {
      tmpText = tmpText.replace(/./g, '*');
    }

    this._delegate._textLabel.string = tmpText;
  };

  _p.setFontSize = function (fontSize) {
    this._edFontSize = fontSize || this._edFontSize;
    this._delegate._textLabel.fontSize = this._edFontSize;
  };

  _p.setFontColor = function (color) {
    this._textColor = color;
    this._delegate._textLabel.fontColor = this._textColor;
  };

  _p.setInputMode = function (inputMode) {
    this._inputMode = inputMode;
  };

  _p.setInputFlag = function (inputFlag) {
    this._inputFlag = inputFlag;
  };

  _p.setReturnType = function (returnType) {
    this._returnType = returnType;
  };

  _p._beginEditing = function () {
    this.createInput();
  };

  _p._endEditing = function () {
    var self = this;

    if (this._editing) {
      self._endEditingOnMobile();

      if (self._delegate && self._delegate.editBoxEditingDidEnded) {
        self._delegate.editBoxEditingDidEnded();
      }
    }

    this._editing = false;
  };

  _p.clear = function () {
    this._node = null;
    this.setDelegate(null);
  };
})();