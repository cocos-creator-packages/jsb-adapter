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
    if (window.dragonBones === undefined || window.middleware === undefined) return;
    if (dragonBones.DragonBonesAtlasAsset === undefined) return;

    // dragonbones global time scale.
    Object.defineProperty(dragonBones, 'timeScale', {
        get () {
            return this._timeScale;
        },
        set (value) {
            this._timeScale = value;
            let factory = this.CCFactory.getInstance();
            factory.setTimeScale(value);
        },
        configurable: true,
    });

    ////////////////////////////////////////////////////////////
    // override dragonBones library by native dragonBones
    ////////////////////////////////////////////////////////////
    //--------------------
    // adapt event name
    //--------------------
    dragonBones.EventObject.START = "start";
    dragonBones.EventObject.LOOP_COMPLETE = "loopComplete";
    dragonBones.EventObject.COMPLETE = "complete";
    dragonBones.EventObject.FADE_IN = "fadeIn";
    dragonBones.EventObject.FADE_IN_COMPLETE = "fadeInComplete";
    dragonBones.EventObject.FADE_OUT = "fadeOut";
    dragonBones.EventObject.FADE_OUT_COMPLETE = "fadeOutComplete";
    dragonBones.EventObject.FRAME_EVENT = "frameEvent";
    dragonBones.EventObject.SOUND_EVENT = "soundEvent";

    dragonBones.DragonBones = {
        ANGLE_TO_RADIAN : Math.PI / 180,
        RADIAN_TO_ANGLE : 180 / Math.PI
    };

    //-------------------
    // native factory
    //-------------------

    let factoryProto = dragonBones.CCFactory.prototype;
    factoryProto.createArmatureNode = function (comp, armatureName, node) {
        node = node || new cc.Node();
        let display = node.getComponent(dragonBones.ArmatureDisplay);
        if (!display) {
            display = node.addComponent(dragonBones.ArmatureDisplay);
        }

        node.name = armatureName;
        
        display._armatureName = armatureName;
        display._N$dragonAsset = comp.dragonAsset;
        display._N$dragonAtlasAsset = comp.dragonAtlasAsset;
        display._init();

        return display;
    };

    //-------------------
    // native armature
    //-------------------
    let armatureProto = dragonBones.Armature.prototype;
    Object.defineProperty(armatureProto, 'animation', {
        get () {
            return this.getAnimation();
        }
    });

    Object.defineProperty(armatureProto, 'display', {
        get () {
            return this.getDisplay();
        }
    });

    Object.defineProperty(armatureProto, 'name', {
        get () {
            return this.getName();
        }
    });

    armatureProto.addEventListener = function (eventType, listener, target) {
        if (!this.__persistentDisplay__) {
            this.__persistentDisplay__ = this.getDisplay();
        }
        this.__persistentDisplay__.on(eventType, listener, target);
    };

    armatureProto.removeEventListener = function (eventType, listener, target) {
        if (!this.__persistentDisplay__) {
            this.__persistentDisplay__ = this.getDisplay();
        }
        this.__persistentDisplay__.off(eventType, listener, target);
    };

    //--------------------------
    // native CCArmatureDisplay
    //--------------------------
    let nativeArmatureDisplayProto = dragonBones.CCArmatureDisplay.prototype;

    Object.defineProperty(nativeArmatureDisplayProto,"node",{
        get : function () {
            return this;
        }
    });

    nativeArmatureDisplayProto.getRootNode = function () {
        let rootDisplay = this.getRootDisplay();
        return rootDisplay && rootDisplay._ccNode;
    };

    nativeArmatureDisplayProto.convertToWorldSpace = function (point) {
        let newPos = this.convertToRootSpace(point);
        let ccNode = this.getRootNode();
        if (!ccNode) return newPos;
        let finalPos = ccNode.convertToWorldSpace(newPos);
        return finalPos;
    };

    nativeArmatureDisplayProto.initEvent = function () {
        if (this._eventTarget) {
            return;
        }
        this._eventTarget = new cc.EventTarget();
        this.setDBEventCallback(function(eventObject) {
            this._eventTarget.emit(eventObject.type, eventObject);
        });
    };

    nativeArmatureDisplayProto.on = function (type, listener, target) {
        this.initEvent();
        this._eventTarget.on(type, listener, target);
        this.addDBEventListener(type, listener);
    };

    nativeArmatureDisplayProto.off = function (type, listener, target) {
        this.initEvent();
        this._eventTarget.off(type, listener, target);
        this.removeDBEventListener(type, listener);
    };

    nativeArmatureDisplayProto.once = function (type, listener, target) {
        this.initEvent();
        this._eventTarget.once(type, listener, target);
        this.addDBEventListener(type, listener);
    };

    //-------------------
    // native slot
    //-------------------
    let slotProto = dragonBones.Slot.prototype;
    Object.defineProperty(slotProto, 'childArmature', {
        get () {
            return this.getChildArmature();
        },
        set (val) {
            this.setChildArmature(val);
        }
    });

    Object.defineProperty(slotProto, 'display', {
        get () {
            return this.getDisplay();
        }
    });

    Object.defineProperty(slotProto, 'name', {
        get () {
            return this.getName();
        }
    });

    //------------------------
    // native TransformObject
    //------------------------
    let transformObjectProto = dragonBones.TransformObject.prototype;
    Object.defineProperty(transformObjectProto, 'global', {
        get () {
            return this.getGlobal();
        }
    });

    Object.defineProperty(transformObjectProto, 'origin', {
        get () {
            return this.getOrigin();
        }
    });

    Object.defineProperty(transformObjectProto, 'offset', {
        get () {
            return this.getOffset();
        }
    });

    ////////////////////////////////////////////////////////////
    // override DragonBonesAtlasAsset
    ////////////////////////////////////////////////////////////
    let dbAtlas = dragonBones.DragonBonesAtlasAsset.prototype;
    let gTextureIdx = 0;
    let textureKeyMap = {};
    let textureMap = new WeakMap();
    let textureIdx2Name = {};

    dbAtlas.recordTexture = function () {
        if (this._texture && this._oldTexture !== this._texture) {
            let texKey = textureKeyMap[gTextureIdx] = {key:gTextureIdx};
            textureMap.set(texKey, this._texture);
            this._oldTexture = this._texture;
            this._texture.__textureIndex__ = gTextureIdx;
            gTextureIdx++;
        }
    };

    dbAtlas.getTextureByIndex = function (textureIdx) {
        let texKey = textureKeyMap[textureIdx];
        if (!texKey) return;
        return textureMap.get(texKey);
    };

    dbAtlas.updateTextureAtlasData = function (factory) {
        let url = this._texture.url;
        let preAtlasInfo = textureIdx2Name[url];
        let index;

        // If the texture has store the atlas info before,then get native atlas object,and 
        // update script texture map.
        if (preAtlasInfo) {
            index = preAtlasInfo.index;
            this._textureAtlasData = factory.getTextureAtlasDataByIndex(preAtlasInfo.name,index);
            let texKey = textureKeyMap[preAtlasInfo.index];
            textureMap.set(texKey, this._texture);
            this._texture.__textureIndex__ = index;
            // If script has store the atlas info,but native has no atlas object,then
            // still new native texture2d object,but no call recordTexture to increase
            // textureIndex.
            if (this._textureAtlasData) {
                return;
            }
        } else {
            this.recordTexture();
        }

        index = this._texture.__textureIndex__;
        this.jsbTexture = new middleware.Texture2D();
        this.jsbTexture.setRealTextureIndex(index);
        this.jsbTexture.setPixelsWide(this._texture.width);
        this.jsbTexture.setPixelsHigh(this._texture.height);
        this._textureAtlasData = factory.parseTextureAtlasData(this.atlasJson, this.jsbTexture, this._uuid);

        textureIdx2Name[url] = {name:this._textureAtlasData.name,index:index};
    };

    dbAtlas.init = function (factory) {
        this._factory = factory;

        // If create by manual, uuid is empty.
        if (!this._uuid) {
            let atlasJsonObj = JSON.parse(this.atlasJson);
            this._uuid = atlasJsonObj.name;
        }

        if (this._textureAtlasData) {
            factory.addTextureAtlasData(this._textureAtlasData, this._uuid);
        }
        else {
            this.updateTextureAtlasData(factory);
        }
    };

    dbAtlas._clear = function () {
        if (this._factory) {
            this._factory.removeTextureAtlasData(this._uuid, true);
            this._factory.removeDragonBonesDataByUUID(this._uuid, true);
        }
        this._textureAtlasData = null;
        this.recordTexture();
    };

    ////////////////////////////////////////////////////////////
    // override DragonBonesAsset
    ////////////////////////////////////////////////////////////
    let dbAsset = dragonBones.DragonBonesAsset.prototype;

    dbAsset.init = function (factory, atlasUUID) {
        this._factory = factory;

        // If create by manual, uuid is empty.
        // Only support json format, if remote load dbbin, must set uuid by manual.
        if (!this._uuid && this.dragonBonesJson) {
            let rawData = JSON.parse(this.dragonBonesJson);
            this._uuid = rawData.name;
        }

        let armatureKey = this._uuid + "#" + atlasUUID;
        let dragonBonesData = this._factory.getDragonBonesData(armatureKey);
        if (dragonBonesData) return armatureKey;

        let filePath = null;
        if (this.dragonBonesJson) {
            filePath = this.dragonBonesJson;
        } else {
            filePath = cc.loader.md5Pipe ? cc.loader.md5Pipe.transformURL(this.nativeUrl) : this.nativeUrl;
        }
        this._factory.parseDragonBonesDataByPath(filePath, armatureKey);
        return armatureKey;
    };

    dbAsset._clear = function () {
        if (this._factory) {
            this._factory.removeDragonBonesDataByUUID(this._uuid, true);
        }
    };

    ////////////////////////////////////////////////////////////
    // override ArmatureDisplay
    ////////////////////////////////////////////////////////////
    let armatureDisplayProto = dragonBones.ArmatureDisplay.prototype;
    let assembler = dragonBones.ArmatureDisplay._assembler;
    let renderCompProto = cc.RenderComponent.prototype;
    let gfx = cc.gfx;
    let VertexFormat = gfx.VertexFormat;

    Object.defineProperty(armatureDisplayProto, 'armatureName', {
        get () {
            return this._armatureName;
        },
        set (value) {
            this._armatureName = value;
            let animNames = this.getAnimationNames(this._armatureName);

            if (!this.animationName || animNames.indexOf(this.animationName) < 0) {
                this.animationName = '';
            }

            if (this._armature) {
                this._armature.dispose();
                this._factory.remove(this._armature);
                this._armature = null;
            }
            this._nativeDisplay = null;
            
            this._refresh();
            if (this._armature) {
                this._factory.add(this._armature);
            }
        },
        visible: false
    });

    Object.defineProperty(armatureDisplayProto, 'debugBones', {
        get () {
            return this._debugBones || false;
        },
        set (value) {
            this._debugBones = value;
            this._initDebugDraw();
            if (this._nativeDisplay) {
                this._nativeDisplay.setDebugBonesEnabled(this._debugBones);
            }
        }
    });

    Object.defineProperty(armatureDisplayProto, "premultipliedAlpha", {
        get () {
            if (this._premultipliedAlpha === undefined){
                return false;
            }
            return this._premultipliedAlpha;
        },
        set (value) {
            this._premultipliedAlpha = value;
            if (this._nativeDisplay) {
                this._nativeDisplay.setOpacityModifyRGB(this._premultipliedAlpha);
            }
        }
    });

    armatureDisplayProto._clearRenderData = function () {
        this._renderInfoOffset = null;
        this._nativeDisplay = null;
    };

    armatureDisplayProto.update = null;

    // Shield use batch in native
    armatureDisplayProto._updateBatch = function () {}

    armatureDisplayProto._buildArmature = function () {
        if (!this.dragonAsset || !this.dragonAtlasAsset || !this.armatureName) {
            this._clearRenderData();
            return;
        }

        if (this._nativeDisplay) {
            this._nativeDisplay.dispose();
            this._nativeDisplay._comp = null;
            this._nativeDisplay = null;
        }

        let atlasUUID = this.dragonAtlasAsset._uuid;
        this._armatureKey = this.dragonAsset.init(this._factory, atlasUUID);
        this._nativeDisplay = this._factory.buildArmatureDisplay(this.armatureName, this._armatureKey, "", atlasUUID);
        if (!this._nativeDisplay) {
            this._clearRenderData();
            return;
        }

        this._nativeDisplay._ccNode = this.node;
        this._nativeDisplay._comp = this;
        this._nativeDisplay._eventTarget = this._eventTarget;

        this._nativeDisplay.setOpacityModifyRGB(this.premultipliedAlpha);
        this._nativeDisplay.setDebugBonesEnabled(this.debugBones);
        this._nativeDisplay.setDBEventCallback(function(eventObject) {
            this._eventTarget.emit(eventObject.type, eventObject);
        });

        // add all event into native display
        let callbackTable = this._eventTarget._callbackTable;
        // just use to adapt to native api
        let emptyHandle = function () {};
        for (let key in callbackTable) {
            let list = callbackTable[key];
            if (!list || !list.callbacks || !list.callbacks.length) continue;
            this._nativeDisplay.addDBEventListener(key, emptyHandle);
        }

        this._armature = this._nativeDisplay.armature();
        this._armature.animation.timeScale = this.timeScale;
        
        this._renderInfoOffset = this._nativeDisplay.getRenderInfoOffset();
        this._renderInfoOffset[0] = 0;
        
        if (this.animationName) {
            this.playAnimation(this.animationName, this.playTimes);
        }
    };

    armatureDisplayProto._activateMaterial = function () {
        let texture = this.dragonAtlasAsset && this.dragonAtlasAsset.texture;
        if (!texture) {
            this.disableRender();
            return;
        }

        // Get material
        let material = this.sharedMaterials[0];
        if (!material) {
            material = cc.Material.getInstantiatedBuiltinMaterial('2d-sprite', this);
        } else {
            material = cc.Material.getInstantiatedMaterial(material, this);
        }

        material.define('_USE_MODEL', true);
        material.define('USE_TEXTURE', true);
        material.setProperty('texture', texture);

        this.setMaterial(0, material);
        this.markForUpdateRenderData(false);
        this.markForRender(false);
        this.markForCustomIARender(true);
    };
    
    armatureDisplayProto.onEnable = function () {
        renderCompProto.onEnable.call(this);
        if (this._armature) {
            this._factory.add(this._armature);
        }
        this._activateMaterial();
        if (this._renderInfoOffset) {
            this._renderInfoOffset[0] = 0;
        }
    };

    armatureDisplayProto.onDisable = function () {
        renderCompProto.onDisable.call(this);
        if (this._armature) {
            this._factory.remove(this._armature);
        }
    };

    let _onLoad = armatureDisplayProto.onLoad;
    armatureDisplayProto.onLoad = function () {
        if (_onLoad) {
            _onLoad.call(this);
        }

        this._iaPool = [];
        this._iaPool.push(new middleware.MiddlewareIA());
        this._iaRenderData = new cc.IARenderData();
    };

    armatureDisplayProto.once = function (eventType, listener, target) {
        if (this._nativeDisplay) {
            this._nativeDisplay.addDBEventListener(eventType, listener);
        }
        this._eventTarget.once(eventType, listener, target);
    };

    armatureDisplayProto.addEventListener = function (eventType, listener, target) {
        if (this._nativeDisplay) {
            this._nativeDisplay.addDBEventListener(eventType, listener);
        }
        this._eventTarget.on(eventType, listener, target);
    };

    armatureDisplayProto.removeEventListener = function (eventType, listener, target) {
        if (this._nativeDisplay) {
            this._nativeDisplay.removeDBEventListener(eventType, listener);
        }
        this._eventTarget.off(eventType, listener, target);
    };

    let _onDestroy = armatureDisplayProto.onDestroy;
    armatureDisplayProto.onDestroy = function(){
        _onDestroy.call(this);
        if (this._nativeDisplay) {
            this._nativeDisplay.dispose();
            this._nativeDisplay._comp = null;
            this._nativeDisplay = null;
        }
        this._materialCache = null;
    };

    ////////////////////////////////////////////////////////////
    // override webgl-assembler
    ////////////////////////////////////////////////////////////
    let _slotColor = cc.color(0, 0, 255, 255);
    let _boneColor = cc.color(255, 0, 0, 255);
    let _originColor = cc.color(0, 255, 0, 255);

    let _getSlotMaterial = function (comp, tex, src, dst) {
        let key = tex.url + src + dst;
        let baseMaterial = comp.sharedMaterials[0];
        if (!baseMaterial) return null;

        let materialCache = comp._materialCache;
        let material = materialCache[key];
        
        if (!material) {
            material = new cc.Material();
            material.copy(baseMaterial);

            material.define('_USE_MODEL', true);
            material.setProperty('texture', tex);
    
            // update blend function
            let pass = material.effect.getDefaultTechnique().passes[0];

            pass.setBlend(
                true,
                gfx.BLEND_FUNC_ADD,
                src, dst,
                gfx.BLEND_FUNC_ADD,
                src, dst
            );
            material.updateHash(key);
            materialCache[key] = material;
        }
        else if (material.getProperty('texture') !== tex) {
            material.setProperty('texture', tex);
            material.updateHash(key);
            materialCache[key] = material;
        }
        return material;
    };

    // native enable useModel
    assembler.useModel = true;

    // native no need implement
    assembler.genRenderDatas = function (comp, batchData) {
    };

    // native no need implement
    assembler.updateRenderData = function (comp, batchData) {
    };

    assembler.renderIA = function (comp, renderer) {

        let nativeDisplay = comp._nativeDisplay;
        if (!nativeDisplay) {
            return;
        }

        let renderInfoOffset = comp._renderInfoOffset;
        if (!renderInfoOffset) return;

        let node = comp.node;
        let iaPool = comp._iaPool;
        let poolIdx = 0;

        if (comp.__preColor__ === undefined || 
        !node.color.equals(comp.__preColor__)) {
            nativeDisplay.setColor(node.color);
            comp.__preColor__ = node.color;
        }

        let infoOffset = renderInfoOffset[0];
        renderInfoOffset[0] = 0;

        let renderInfoMgr = middleware.renderInfoMgr;
        let renderInfo = renderInfoMgr.renderInfo;

        let materialIdx = 0,realTextureIndex,realTexture;
        // verify render border
        let border = renderInfo[infoOffset + materialIdx++];
        if (border !== 0xffffffff) return;

        let matLen = renderInfo[infoOffset + materialIdx++];
        if (matLen == 0) return;

        for (let index = 0; index < matLen; index++) {
            realTextureIndex = renderInfo[infoOffset + materialIdx++];
            realTexture = comp.dragonAtlasAsset.getTextureByIndex(realTextureIndex);
            if (!realTexture) return;

            let material = _getSlotMaterial(comp, realTexture,
                renderInfo[infoOffset + materialIdx++],
                renderInfo[infoOffset + materialIdx++]);

            let glIB = renderInfo[infoOffset + materialIdx++];
            let glVB = renderInfo[infoOffset + materialIdx++];
            let indiceOffset = renderInfo[infoOffset + materialIdx++];
            let segmentCount = renderInfo[infoOffset + materialIdx++];

            let ia = iaPool[poolIdx];
            if (!ia) {
                ia = new middleware.MiddlewareIA();
                iaPool[poolIdx] = ia;
            }
            ia._start = indiceOffset;

            ia.count = segmentCount;
            ia.setVertexFormat(VertexFormat.XY_UV_Color);
            ia.setGLIBID(glIB);
            ia.setGLVBID(glVB);

            poolIdx++;

            comp._iaRenderData.ia = ia;
            comp._iaRenderData.material = material;
            renderer._flushIA(comp._iaRenderData);
        }

        if (comp.debugBones && comp._debugDraw) {

            let graphics = comp._debugDraw;
            graphics.clear();

            comp._debugData = comp._debugData || nativeDisplay.getDebugData();
            let debugData = comp._debugData;
            let debugIdx = 0;

            graphics.lineWidth = 5;
            graphics.strokeColor = _boneColor;
            graphics.fillColor = _slotColor; // Root bone color is same as slot color.

            let debugBonesLen = debugData[debugIdx++];
            for (let i = 0; i < debugBonesLen; i += 4) {
                let bx = debugData[debugIdx++];
                let by = debugData[debugIdx++];
                let x = debugData[debugIdx++];
                let y = debugData[debugIdx++];

                // Bone lengths.
                graphics.moveTo(bx, by);
                graphics.lineTo(x, y);
                graphics.stroke();

                // Bone origins.
                graphics.circle(bx, by, Math.PI * 2);
                graphics.fill();
                if (i === 0) {
                    graphics.fillColor = _originColor;
                }
            }
            
        }
    };
})();
