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
    const EditBox = cc.EditBox;
    const js = cc.js;
    const KeyboardReturnType = EditBox.KeyboardReturnType;
    const InputMode = EditBox.InputMode;
    const InputFlag = EditBox.InputFlag;

    function getInputType (type) {
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

    function getKeyboardReturnType (type) {
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

    function JsbEditBoxImpl () {
        this._delegate = null;
        this._editing = false;
    }

    js.extend(JsbEditBoxImpl, EditBox._ImplClass);
    EditBox._ImplClass = JsbEditBoxImpl;

    Object.assign(JsbEditBoxImpl.prototype, {
        init (delegate) {
            if (!delegate) {
                cc.error('EditBox init failed');
                return;
            }
            this._delegate = delegate;
        },

        setFocus (value) {
            if (value) {
                this.beginEditing();
            }
            else {
                this.endEditing();
            }
        },

        isFocused () {
            return this._editing;
        },

        beginEditing () {
            let self = this;
            let delegate = this._delegate;
            let multiline = (delegate.inputMode === InputMode.ANY);
            let rect = this._getRect();

            let inputTypeString = getInputType(delegate.inputMode);
            if (delegate.inputFlag === InputFlag.PASSWORD) {
                inputTypeString = 'password';
            }

            function onConfirm (res) {
                delegate.editBoxEditingReturn();
            }

            function onInput (res) {
                if (res.value.length > delegate.maxLength) {
                    res.value = res.value.slice(0, delegate.maxLength);
                }
                if (delegate._string !== res.value) {
                    delegate.editBoxTextChanged(res.value);
                }
            }

            function onComplete (res) {
                self.endEditing();
                jsb.inputBox.offConfirm(onConfirm);
                jsb.inputBox.offInput(onInput);
                jsb.inputBox.offComplete(onComplete);
            }

            jsb.inputBox.onInput(onInput);
            jsb.inputBox.onConfirm(onConfirm);
            jsb.inputBox.onComplete(onComplete);

            jsb.inputBox.show({
                defaultValue: delegate._string,
                maxLength: delegate.maxLength,
                multiple: multiline,
                confirmHold: false,
                confirmType: getKeyboardReturnType(delegate.returnType),
                inputType: inputTypeString,
                originX: rect.x,
                originY: rect.y,
                width: rect.width,
                height: rect.height
            });
            this._editing = true;
            delegate.editBoxEditingDidBegan();
        },

        endEditing () {
            this._editing = false;
            jsb.inputBox.hide();
            this._delegate.editBoxEditingDidEnded();
        },

        _getRect () {
            let node = this._delegate.node,
                scaleX = cc.view._scaleX, scaleY = cc.view._scaleY;
            let dpr = cc.view._devicePixelRatio;

            let math = cc.vmath;
            let matrix = math.mat4.create();
            node.getWorldMatrix(matrix);
            let contentSize = node._contentSize;
            let vec3 = cc.v3();
            vec3.x = -node._anchorPoint.x * contentSize.width;
            vec3.y = -node._anchorPoint.y * contentSize.height;


            math.mat4.translate(matrix, matrix, vec3);

            scaleX /= dpr;
            scaleY /= dpr;

            let finalScaleX = matrix.m00 * scaleX;
            let finaleScaleY = matrix.m05 * scaleY;

            return {
                x: matrix.m12 * finalScaleX,
                y: matrix.m13 * finaleScaleY,
                width: contentSize.width * finalScaleX,
                height: contentSize.height * finaleScaleY
            };
        },
    });
}());