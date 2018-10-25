/****************************************************************************
 Copyright (c) 2013-2016 Chukong Technologies Inc.
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

if(window.jsbspine !== undefined){

var jsbSkeleton = sp.Skeleton.prototype;
jsbSkeleton.setSkeletonData = function (skeletonData) {
    null != skeletonData.width && null != skeletonData.height && this.node.setContentSize(skeletonData.width, skeletonData.height);

    var uuid = skeletonData._uuid;
    if (!uuid) {
        cc.errorID(7504);
        return;
    }
    var jsonFile = cc.loader.md5Pipe ? cc.loader.md5Pipe.transformURL(skeletonData.nativeUrl, true) : skeletonData.nativeUrl;
    var atlasText = skeletonData.atlasText;
    if (!atlasText) {
        cc.errorID(7508, skeletonData.name);
        return;
    }
    var texValues = skeletonData.textures;
    var texKeys = skeletonData.textureNames;
    if (!(texValues && texValues.length > 0 && texKeys && texKeys.length > 0)) {
        cc.errorID(7507, skeletonData.name);
        return;
    }
    var textures = {};
    for (var i = 0; i < texValues.length; ++i) {
        var spTex = new jsbspine.Texture2D();
        spTex.setRealTextureIndex(i);
        spTex.setPixelsWide(texValues[i].width);
        spTex.setPixelsHigh(texValues[i].height);
        spTex.setTexParamCallback(function(texIdx,minFilter,magFilter,wrapS,warpT){
            texValues[texIdx].setFilters(minFilter, magFilter);
            texValues[texIdx].setWrapMode(wrapS, warpT);
        }.bind(this));
        textures[texKeys[i]] = spTex;
    }

    var skeletonAni = new jsbspine.SpineAnimation();
    try {
        jsbspine._initSkeletonRenderer(skeletonAni, jsonFile, atlasText, textures, skeletonData.scale);
    } catch (e) {
        cc._throw(e);
        return;
    }
    this._skeleton = skeletonAni;
    this._skeletonTextures = textures;

    // init skeleton listener
    this._startListener && this.setStartListener(this._startListener);
    this._endListener && this.setEndListener(this._endListener);
    this._completeListener && this.setCompleteListener(this._completeListener);
    this._eventListener && this.setEventListener(this._eventListener);
    this._interruptListener && this.setInterruptListener(this._interruptListener);
    this._disposeListener && this.setDisposeListener(this._disposeListener);
}

jsbSkeleton.setAnimationStateData = function (stateData) {
    if(this._skeleton){
        return this._skeleton.setAnimationStateData(stateData);
    }
}

jsbSkeleton.update = function (dt) {
    if(this.paused)return;
    var skeleton = this._skeleton;
    if (skeleton) {
        skeleton.update(dt*this.timeScale);
    }
}

jsbSkeleton.updateWorldTransform = function () {
    this._skeleton && this._skeleton.updateWorldTransform();
}

jsbSkeleton.setToSetupPose = function () {
    this._skeleton && this._skeleton.setToSetupPose();
}

jsbSkeleton.setBonesToSetupPose = function () {
    this._skeleton && this._skeleton.setBonesToSetupPose();
}

jsbSkeleton.setSlotsToSetupPose = function () {
    this._skeleton && this._skeleton.setSlotsToSetupPose();
}

jsbSkeleton.findBone = function (boneName) {
    if (this._skeleton) return this._skeleton.findBone(boneName);
    return null;
}

jsbSkeleton.findSlot = function (slotName) {
    if (this._skeleton) return this._skeleton.findSlot(slotName);
    return null;
}

jsbSkeleton.setSkin = function (skinName) {
    if (this._skeleton) return this._skeleton.setSkin(skinName);
    return null;
}

jsbSkeleton.getAttachment = function (slotName, attachmentName) {
    if (this._skeleton) return this._skeleton.getAttachment(slotName, attachmentName);
    return null;
}

jsbSkeleton.setAttachment = function (slotName, attachmentName) {
    this._skeleton && this._skeleton.setAttachment(slotName, attachmentName);
}

jsbSkeleton.getTextureAtlas = function (regionAttachment) {
    cc.warn("sp.Skeleton getTextureAtlas not support in native");
    return null;
}

jsbSkeleton.setMix = function (fromAnimation, toAnimation, duration) {
    if (this._skeleton) {
        this._skeleton.setMix(fromAnimation, toAnimation, duration);
    }
}

jsbSkeleton.setAnimation = function (trackIndex, name, loop) {
    if (this._skeleton) {
        return this._skeleton.setAnimation(trackIndex, name, loop);
    }
    return null;
}

jsbSkeleton.addAnimation = function (trackIndex, name, loop, delay) {
    if (this._skeleton) {
        delay = delay || 0;
        return this._skeleton.addAnimation(trackIndex, name, loop, delay);
    }
    return null;
}

jsbSkeleton.findAnimation = function (name) {
    if (this._skeleton) return this._skeleton.findAnimation(name);
    return null;
}

jsbSkeleton.getCurrent = function (trackIndex) {
    if (this._skeleton) {
        return this._skeleton.getCurrent(trackIndex);
    }
    return null;
}

jsbSkeleton.clearTracks = function () {
    if (this._skeleton) {
        this._skeleton.clearTracks();
    }
}

jsbSkeleton.clearTrack = function (trackIndex) {
    if (this._skeleton) {
        this._skeleton.clearTrack(trackIndex);
    }
}

jsbSkeleton.setStartListener = function (listener) {
    this._startListener = listener;
    if (this._skeleton) {
        this._skeleton.setStartListener(listener);
    }
}

jsbSkeleton.setInterruptListener = function (listener) {
    this._interruptListener = listener;
    if (this._skeleton) {
        this._skeleton.setInterruptListener(listener);
    }
}

jsbSkeleton.setEndListener = function (listener) {
    this._endListener = listener;
    if (this._skeleton) {
        this._skeleton.setEndListener(listener);
    }
}

jsbSkeleton.setDisposeListener = function (listener) {
    this._disposeListener = listener;
    if (this._skeleton) {
        this._skeleton.setDisposeListener(listener);
    }
}

jsbSkeleton.setCompleteListener = function (listener) {
    this._completeListener = listener;
    if (this._skeleton) {
        this._skeleton.setCompleteListenerNative(listener);
    }
}

jsbSkeleton.setEventListener = function (listener) {
    this._eventListener = listener;
    if (this._skeleton) {
        this._skeleton.setEventListener(listener);
    }
}

jsbSkeleton.setTrackStartListener = function (entry, listener) {
    if (this._skeleton) {
        this._skeleton.setTrackStartListener(entry, listener);
    }
}

jsbSkeleton.setTrackInterruptListener = function (entry, listener) {
    if (this._skeleton) {
        this._skeleton.setTrackInterruptListener(entry, listener);
    }
}

jsbSkeleton.setTrackEndListener = function (entry, listener) {
    if (this._skeleton) {
        this._skeleton.setTrackEndListener(entry, listener);
    }
}

jsbSkeleton.setTrackDisposeListener = function (entry, listener) {
    if (this._skeleton) {
        this._skeleton.setTrackDisposeListener(entry, listener);
    }
}

jsbSkeleton.setTrackCompleteListener = function (entry, listener) {
    if (this._skeleton) {
        this._skeleton.setTrackCompleteListenerNative(entry, listener);
    }
}

jsbSkeleton.setTrackEventListener = function (entry, listener) {
    if (this._skeleton) {
        this._skeleton.setTrackEventListener(entry, listener);
    }
}

jsbSkeleton.getState = function () {
    if (this._skeleton) {
        return this._skeleton.getState();
    }
}

jsbSkeleton._ensureListener = function () {
    cc.warn("sp.Skeleton _ensureListener not need in native");
}

jsbSkeleton._updateSkeletonData = function () {
    if (this.skeletonData) {
        this.setSkeletonData(this.skeletonData);
        this.defaultSkin && this._skeleton.setSkin(this.defaultSkin);
        this.animation = this.defaultAnimation;
    }
}

var _onDestroy = jsbSkeleton.onDestroy;
jsbSkeleton.onDestroy = function(){
    _onDestroy.call(this);
    this._skeletonTextures = undefined;
    this._skeleton = undefined;
}

}