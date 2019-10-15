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

const RenderFlow = cc.RenderFlow;

cc.js.mixin(renderer.NodeProxy.prototype, {
    _ctor () {
        this._owner = null;
    },

    init (owner) {
        this._owner = owner;
        
        let spaceInfo = owner._spaceInfo;
        this._owner._dirtyPtr = spaceInfo.dirty;
        
        this._dirtyPtr = spaceInfo.dirty;
        this._parentPtr = spaceInfo.parent;
        this._zOrderPtr = spaceInfo.zOrder;
        this._cullingMaskPtr = spaceInfo.cullingMask;
        this._opacityPtr = spaceInfo.opacity;
        this._is3DPtr = spaceInfo.is3D;

        owner._proxy = this;
        this.updateOpacity();
        this.update3DNode();
        this.updateZOrder();
        this.updateCullingMask();
        owner.on(cc.Node.EventType.SIBLING_ORDER_CHANGED, this.updateZOrder, this);
    },

    initNative () {
        this.setName(this._owner._name);
        this.updateParent();
        this.updateOpacity();
        this.update3DNode();
        this.updateZOrder();
        this.updateCullingMask();
    },

    destroy () {
        this.destroyImmediately();

        this._owner.off(cc.Node.EventType.SIBLING_ORDER_CHANGED, this.updateZOrder, this);
        this._owner._proxy = null;
        this._owner = null;
    },

    updateParent () {
        let parent = this._owner._parent;
        if (parent) {
            let parentSpaceInfo = parent._spaceInfo;
            this._parentPtr[0] = parentSpaceInfo.unitID;
            this._parentPtr[1] = parentSpaceInfo.index;

            let parentDirtyPtr = parentSpaceInfo.dirty;
            parentDirtyPtr[0] |= RenderFlow.FLAG_REORDER_CHILDREN;
            this._dirtyPtr[0] |= RenderFlow.FLAG_OPACITY;
        } else {
            this._parentPtr[0] = 0xffffffff;
            this._parentPtr[1] = 0xffffffff;
        }
        this.notifyUpdateParent();
    },

    updateZOrder () {
        this._zOrderPtr[0] = this._owner._localZOrder;
        let parent = this._owner._parent;
        if (parent && parent._proxy) {
            parent._proxy._dirtyPtr[0] |= RenderFlow.FLAG_REORDER_CHILDREN;
        }
    },

    updateCullingMask () {
        this._cullingMaskPtr[0] = this._owner._cullingMask;
    },

    updateOpacity () {
        this._opacityPtr[0] = this._owner.opacity;
        this._dirtyPtr[0] |= RenderFlow.FLAG_OPACITY;
    },

    update3DNode () {
        this._is3DPtr[0] = this._owner.is3DNode ? 0x1 : 0x0;
        this._dirtyPtr[0] |= RenderFlow.FLAG_LOCAL_TRANSFORM;
    },
});