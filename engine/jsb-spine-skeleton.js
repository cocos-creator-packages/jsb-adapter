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

(function(){
    if (window.sp === undefined || window.spine === undefined || window.middleware === undefined) return;

    sp.VertexEffectDelegate = spine.VertexEffectDelegate;
    jsb.generateGetSet(spine);

    // spine global time scale
    Object.defineProperty(sp, 'timeScale', {
        get () {
            return this._timeScale;
        },
        set (value) {
            this._timeScale = value;
            spine.SkeletonAnimation.setGlobalTimeScale(value);
        },
        configurable: true,
    });

    let skeletonDataProto = sp.SkeletonData.prototype;
    let _gTextureIdx = 1;
    let _textureKeyMap = {};
    let _textureMap = new WeakMap();

    skeletonDataProto.destroy = function () {
        if (this._jsbTextures) {
            this._jsbTextures = null;
            spine.disposeSkeletonData(this._uuid);
            let textures = this.textures;
            for (let i = 0; i < textures.length; ++i) {
                let texture = textures[i];
                let index = texture && texture.__textureIndex__; 
                if (index) {
                    let texKey = _textureKeyMap[index];
                    if (texKey && _textureMap.has(texKey)) {
                        _textureMap.delete(texKey);
                        delete _textureKeyMap[index];
                    }
                }
            }
        }
        cc.Asset.prototype.destroy.call(this);
    };

    skeletonDataProto.init = function () {
        if (this._skeletonCache) return;

        let uuid = this._uuid;
        if (!uuid) {
            cc.errorID(7504);
            return;
        }
        let atlasText = this.atlasText;
        if (!atlasText) {
            cc.errorID(7508, this.name);
            return;
        }
        let textures = this.textures;
        let textureNames = this.textureNames;
        if (!(textures && textures.length > 0 && textureNames && textureNames.length > 0)) {
            cc.errorID(7507, this.name);
            return;
        }

        let jsbTextures = {};
        for (let i = 0; i < textures.length; ++i) {
            let texture = textures[i];
            let textureIdx = this.recordTexture(texture);
            let spTex = new middleware.Texture2D();
            spTex.setRealTextureIndex(textureIdx);
            spTex.setPixelsWide(texture.width);
            spTex.setPixelsHigh(texture.height);
            spTex.setTexParamCallback(function(texIdx,minFilter,magFilter,wrapS,warpT){
                let tex = this.getTextureByIndex(texIdx);
                tex.setFilters(minFilter, magFilter);
                tex.setWrapMode(wrapS, warpT);
            }.bind(this));
            jsbTextures[textureNames[i]] = spTex;
        }
        this._jsbTextures = jsbTextures;
        this._skeletonCache = spine.initSkeletonData(uuid, this.skeletonJsonStr, atlasText, jsbTextures, this.scale);
    };

    skeletonDataProto.recordTexture = function (texture) {
        let index = _gTextureIdx;
        let texKey = _textureKeyMap[index] = {key:index};
        texture.__textureIndex__ = index;
        _textureMap.set(texKey, texture);
        _gTextureIdx++;
        return index;
    };

    skeletonDataProto.getTextureByIndex = function (textureIdx) {
        let texKey = _textureKeyMap[textureIdx];
        if (!texKey) return;
        return _textureMap.get(texKey);
    };

    let renderCompProto = cc.RenderComponent.prototype;

    let animation = spine.SkeletonAnimation.prototype;
    // The methods are added to be compatibility with old versions.
    animation.setCompleteListener = function (listener) {
        this._compeleteListener = listener;
        this.setCompleteListenerNative(function (trackEntry) {
            let loopCount = Math.floor(trackEntry.trackTime / trackEntry.animationEnd);
            this._compeleteListener(trackEntry, loopCount);
        });
    };

    // Temporary solution before upgrade the Spine API
    animation.setAnimationListener = function (target, callback) {
        this._target = target;
        this._callback = callback;

        this.setStartListener(function (trackEntry) {
            if (this._target && this._callback) {
                this._callback.call(this._target, this, trackEntry, sp.AnimationEventType.START, null, 0);
            }
        });

        this.setInterruptListener(function (trackEntry) {
            if (this._target && this._callback) {
                this._callback.call(this._target, this, trackEntry, sp.AnimationEventType.INTERRUPT, null, 0);
            }
        });

        this.setEndListener(function (trackEntry) {
            if (this._target && this._callback) {
                this._callback.call(this._target, this, trackEntry, sp.AnimationEventType.END, null, 0);
            }
        });

        this.setDisposeListener(function (trackEntry) {
            if (this._target && this._callback) {
                this._callback.call(this._target, this, trackEntry, sp.AnimationEventType.DISPOSE, null, 0);
            }
        });

        this.setCompleteListener(function (trackEntry, loopCount) {
            if (this._target && this._callback) {
                this._callback.call(this._target, this, trackEntry, sp.AnimationEventType.COMPLETE, null, loopCount);
            }
        });

        this.setEventListener(function (trackEntry, event) {
            if (this._target && this._callback) {
                this._callback.call(this._target, this, trackEntry, sp.AnimationEventType.EVENT, event, 0);
            }
        });
    };

    let skeleton = sp.Skeleton.prototype;
    Object.defineProperty(skeleton, 'paused', {
        get () {
            return this._paused || false;
        },
        set (value) {
            this._paused = value;
            if (this._nativeSkeleton) {
                this._nativeSkeleton.paused(value);
            }
        }
    });

    Object.defineProperty(skeleton, 'debugSlots', {
        get () {
            return this._debugSlots || false;
        },
        set (value) {
            this._debugSlots = value;
            this._updateDebugDraw();
            if (this._nativeSkeleton) {
                this._nativeSkeleton.setDebugSlotsEnabled(this._debugSlots);
            }
        }
    });

    Object.defineProperty(skeleton, 'debugBones', {
        get () {
            return this._debugBones || false;
        },
        set (value) {
            this._debugBones = value;
            this._updateDebugDraw();
            if (this._nativeSkeleton) {
                this._nativeSkeleton.setDebugBonesEnabled(this._debugBones);
            }
        }
    });

    Object.defineProperty(skeleton, 'debugMesh', {
        get () {
            return this._debugMesh || false;
        },
        set (value) {
            this._debugMesh = value;
            this._updateDebugDraw();
            if (this._nativeSkeleton) {
                this._nativeSkeleton.setDebugMeshEnabled(this._debugMesh);
            }
        }
    });

    Object.defineProperty(skeleton, "premultipliedAlpha", {
        get () {
            if (this._premultipliedAlpha === undefined){
                return true;
            }
            return this._premultipliedAlpha;
        },
        set (value) {
            this._premultipliedAlpha = value;
            if (this._nativeSkeleton) {
                this._nativeSkeleton.setOpacityModifyRGB(this._premultipliedAlpha);
            }
        }
    });

    Object.defineProperty(skeleton, "timeScale", {
        get () {
            if (this._timeScale === undefined) return 1.0;
            return this._timeScale;
        },
        set (value) {
            this._timeScale = value;
            if (this._nativeSkeleton) {
                this._nativeSkeleton.setTimeScale(this._timeScale);
            }
        }
    });

    Object.defineProperty(skeleton, "useTint", {
        get () {
            return this._useTint || false;
        },
        set (value) {
            this._useTint = value;
            let baseMaterial = this.sharedMaterials[0];
            if (!baseMaterial) return;
            baseMaterial.define('USE_TINT', this._useTint);
            // Update cache material useTint property
            let cache = this._materialCache;
            for (let mKey in cache) {
                let material = cache[mKey];
                if (material) {
                    material.define('USE_TINT', this._useTint);
                }
            }
            if (this._nativeSkeleton) {
                this._nativeSkeleton.setUseTint(this._useTint);
            }
        }
    });

    let _onLoad = skeleton.onLoad;
    skeleton.onLoad = function () {
        if (_onLoad) {
            _onLoad.call(this);
        }

        this._iaPool = [];
        this._iaPool.push(new middleware.MiddlewareIA());
        this._iaRenderData = new cc.IARenderData();
    };

    // Shield use batch in native
    skeleton._updateBatch = function () {};

    skeleton.setSkeletonData = function (skeletonData) {
        null != skeletonData.width && null != skeletonData.height && this.node.setContentSize(skeletonData.width, skeletonData.height);

        let uuid = skeletonData._uuid;
        if (!uuid) {
            cc.errorID(7504);
            return;
        }

        if (this._nativeSkeleton) {
            this._nativeSkeleton.stopSchedule();
            this._nativeSkeleton._comp = null;
            this._nativeSkeleton = null;
        }

        let nativeSkeleton = new spine.SkeletonAnimation();
        try {
            spine.initSkeletonRenderer(nativeSkeleton, uuid);
        } catch (e) {
            cc._throw(e);
            return;
        }
        this._nativeSkeleton = nativeSkeleton;
        this._nativeSkeleton._comp = this;

        this._nativeSkeleton.setOpacityModifyRGB(this.premultipliedAlpha);
        this._nativeSkeleton.setDebugSlotsEnabled(this.debugSlots);
        this._nativeSkeleton.setDebugBonesEnabled(this.debugBones);this._nativeSkeleton.setDebugMeshEnabled(this._debugMesh);
        this._nativeSkeleton.setUseTint(this.useTint);
        this._nativeSkeleton.setTimeScale(this.timeScale);
        this._skeleton = this._nativeSkeleton.getSkeleton();

        this._renderInfoOffset = this._nativeSkeleton.getRenderInfoOffset();
        this._renderInfoOffset[0] = 0;

        // init skeleton listener
        this._startListener && this.setStartListener(this._startListener);
        this._endListener && this.setEndListener(this._endListener);
        this._completeListener && this.setCompleteListener(this._completeListener);
        this._eventListener && this.setEventListener(this._eventListener);
        this._interruptListener && this.setInterruptListener(this._interruptListener);
        this._disposeListener && this.setDisposeListener(this._disposeListener);

        this._activateMaterial();
    };

    skeleton.setAnimationStateData = function (stateData) {
        if (this._nativeSkeleton) {
            this._stateData = stateData;
            return this._nativeSkeleton.setAnimationStateData(stateData);
        }
    };

    skeleton._prepareToRender = function (material) {
        this.setMaterial(0, material);
        this.markForUpdateRenderData(false);
        this.markForRender(false);
        this.markForCustomIARender(true);
    };

    skeleton.onEnable = function () {
        renderCompProto.onEnable.call(this);
        if (this._nativeSkeleton) {
            this._nativeSkeleton.onEnable();
        }
        this._activateMaterial();
        if (this._renderInfoOffset) {
            this._renderInfoOffset[0] = 0;
        }
    };

    skeleton.onDisable = function () {
        renderCompProto.onDisable.call(this);
        if (this._nativeSkeleton) {
            this._nativeSkeleton.onDisable();
        }
    };

    skeleton.update = undefined;

    skeleton.setVertexEffectDelegate = function (effectDelegate) {
        this._nativeSkeleton && this._nativeSkeleton.setVertexEffectDelegate(effectDelegate);
    };

    skeleton.updateWorldTransform = function () {
        this._nativeSkeleton && this._nativeSkeleton.updateWorldTransform();
    };

    skeleton.setToSetupPose = function () {
        this._nativeSkeleton && this._nativeSkeleton.setToSetupPose();
    };

    skeleton.setBonesToSetupPose = function () {
        this._nativeSkeleton && this._nativeSkeleton.setBonesToSetupPose();
    };

    skeleton.setSlotsToSetupPose = function () {
        this._nativeSkeleton && this._nativeSkeleton.setSlotsToSetupPose();
    };

    skeleton.setSlotsRange = function (startSlotIndex, endSlotIndex) {
        this._nativeSkeleton && this._nativeSkeleton.setSlotsRange(startSlotIndex, endSlotIndex);
    };

    skeleton.findBone = function (boneName) {
        if (this._nativeSkeleton) return this._nativeSkeleton.findBone(boneName);
        return null;
    };

    skeleton.findSlot = function (slotName) {
        if (this._nativeSkeleton) return this._nativeSkeleton.findSlot(slotName);
        return null;
    };

    skeleton.setSkin = function (skinName) {
        if (this._nativeSkeleton) return this._nativeSkeleton.setSkin(skinName);
        return null;
    };

    skeleton.getAttachment = function (slotName, attachmentName) {
        if (this._nativeSkeleton) return this._nativeSkeleton.getAttachment(slotName, attachmentName);
        return null;
    };

    skeleton.setAttachment = function (slotName, attachmentName) {
        this._nativeSkeleton && this._nativeSkeleton.setAttachment(slotName, attachmentName);
    };

    skeleton.getTextureAtlas = function (regionAttachment) {
        cc.warn("sp.Skeleton getTextureAtlas not support in native");
        return null;
    };

    skeleton.setMix = function (fromAnimation, toAnimation, duration) {
        if (this._nativeSkeleton) {
            this._nativeSkeleton.setMix(fromAnimation, toAnimation, duration);
        }
    };

    skeleton.setAnimation = function (trackIndex, name, loop) {
        if (this._nativeSkeleton) {
            return this._nativeSkeleton.setAnimation(trackIndex, name, loop);
        }
        return null;
    };

    skeleton.addAnimation = function (trackIndex, name, loop, delay) {
        if (this._nativeSkeleton) {
            delay = delay || 0;
            return this._nativeSkeleton.addAnimation(trackIndex, name, loop, delay);
        }
        return null;
    };

    skeleton.findAnimation = function (name) {
        if (this._nativeSkeleton) return this._nativeSkeleton.findAnimation(name);
        return null;
    };

    skeleton.getCurrent = function (trackIndex) {
        if (this._nativeSkeleton) {
            return this._nativeSkeleton.getCurrent(trackIndex);
        }
        return null;
    };

    skeleton.clearTracks = function () {
        if (this._nativeSkeleton) {
            this._nativeSkeleton.clearTracks();
        }
    };

    skeleton.clearTrack = function (trackIndex) {
        if (this._nativeSkeleton) {
            this._nativeSkeleton.clearTrack(trackIndex);
        }
    };

    skeleton.setStartListener = function (listener) {
        this._startListener = listener;
        if (this._nativeSkeleton) {
            this._nativeSkeleton.setStartListener(listener);
        }
    };

    skeleton.setInterruptListener = function (listener) {
        this._interruptListener = listener;
        if (this._nativeSkeleton) {
            this._nativeSkeleton.setInterruptListener(listener);
        }
    };

    skeleton.setEndListener = function (listener) {
        this._endListener = listener;
        if (this._nativeSkeleton) {
            this._nativeSkeleton.setEndListener(listener);
        }
    };

    skeleton.setDisposeListener = function (listener) {
        this._disposeListener = listener;
        if (this._nativeSkeleton) {
            this._nativeSkeleton.setDisposeListener(listener);
        }
    };

    skeleton.setCompleteListener = function (listener) {
        this._completeListener = listener;
        if (this._nativeSkeleton) {
            this._nativeSkeleton.setCompleteListener(listener);
        }
    };

    skeleton.setEventListener = function (listener) {
        this._eventListener = listener;
        if (this._nativeSkeleton) {
            this._nativeSkeleton.setEventListener(listener);
        }
    };

    skeleton.setTrackStartListener = function (entry, listener) {
        if (this._nativeSkeleton) {
            this._nativeSkeleton.setTrackStartListener(entry, listener);
        }
    };

    skeleton.setTrackInterruptListener = function (entry, listener) {
        if (this._nativeSkeleton) {
            this._nativeSkeleton.setTrackInterruptListener(entry, listener);
        }
    };

    skeleton.setTrackEndListener = function (entry, listener) {
        if (this._nativeSkeleton) {
            this._nativeSkeleton.setTrackEndListener(entry, listener);
        }
    };

    skeleton.setTrackDisposeListener = function (entry, listener) {
        if (this._nativeSkeleton) {
            this._nativeSkeleton.setTrackDisposeListener(entry, listener);
        }
    };

    skeleton.setTrackCompleteListener = function (entry, listener) {
        if (this._nativeSkeleton) {
            this._nativeSkeleton.setTrackCompleteListener(entry, listener);
        }
    };

    skeleton.setTrackEventListener = function (entry, listener) {
        if (this._nativeSkeleton) {
            this._nativeSkeleton.setTrackEventListener(entry, listener);
        }
    };

    skeleton.getState = function () {
        if (this._nativeSkeleton) {
            return this._nativeSkeleton.getState();
        }
    };

    skeleton._ensureListener = function () {
        cc.warn("sp.Skeleton _ensureListener not need in native");
    };

    skeleton._updateSkeletonData = function () {
        if (this.skeletonData) {
            this.skeletonData.init();
            this.setSkeletonData(this.skeletonData);
            this.defaultSkin && this._nativeSkeleton.setSkin(this.defaultSkin);
            this.animation = this.defaultAnimation;
        }
    };

    let _onDestroy = skeleton.onDestroy;
    skeleton.onDestroy = function(){
        _onDestroy.call(this);
        if (this._nativeSkeleton) {
            this._nativeSkeleton.stopSchedule();
            this._nativeSkeleton._comp = null;
            this._nativeSkeleton = null;
        }
        this._stateData = null;
        this._materialCache = null;
    };

})();
