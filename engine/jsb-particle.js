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
    if (window.middleware === undefined) return;
    var ParticleSystem = cc.ParticleSystem;
    if (ParticleSystem === undefined) return;
    var PSProto = ParticleSystem.prototype;
    ParticleSystem._assembler = undefined;

    var renderEngine = cc.renderer.renderEngine;

    PSProto.initProperties = function () {

        this._simulator = new middleware.ParticleSimulator()
        
        this._previewTimer = null;
        this._focused = false;
        this._texture = null;
        this._renderData = null;

        this._simulator.__particleSystem__ = this;

        this._simulator.setFinishedCallback(function () {
            var self = this.__particleSystem__;
            self._finishedSimulation();
        });

        this._simulator.setStopCallback(function () {
            var self = this.__particleSystem__;
            self.stopSystem();
        })

        // init properties
        for (var key in propertiesList) {
            var propName = propertiesList[key];
            this[propName] = this[propName];
        }

        var objPropList = ['gravity','sourcePos','posVar','startColor','startColorVar','endColor','endColorVar'];
        for (var key in objPropList) {
            var propName = objPropList[key];
            this[propName] = this[propName];
        }
    }

    Object.defineProperty(PSProto, 'gravity', {
        get () {
            !this._gravity && (this._gravity = cc.v2(0, 0));
            return this._gravity;
        },
        set (val) {
            if (!val) return;
            !this._gravity && (this._gravity = cc.v2(0, 0));

            this.gravity.x = val.x;
            this.gravity.y = val.y;
            this._simulator && this._simulator.setGravity(val.x, val.y, 0);
        }
    });

    Object.defineProperty(PSProto, 'sourcePos', {
        get () {
            !this._sourcePos && (this._sourcePos = cc.v2(0, 0));
            return this._sourcePos;
        },
        set (val) {
            if (!val) return;
            !this._sourcePos && (this._sourcePos = cc.v2(0, 0));

            this._sourcePos.x = val.x;
            this._sourcePos.y = val.y;
            this._simulator && this._simulator.setSourcePos(val.x, val.y, 0);
        }
    });

    Object.defineProperty(PSProto, 'posVar', {
        get () {
            !this._posVar && (this._posVar = cc.v2(0, 0));
            return this._posVar;
        },
        set (val) {
            if (!val) return;
            !this._posVar && (this._posVar = cc.v2(0, 0));
            
            this._posVar.x = val.x;
            this._posVar.y = val.y;
            this._simulator && this._simulator.setPosVar(val.x, val.y, 0);
        }
    });

    Object.defineProperty(PSProto, 'startColor', {
        get () {
            !this._startColor && (this._startColor = cc.color(255, 255, 255, 255));
            return this._startColor;
        },
        set (val) {
            if (!val) return;
            !this._startColor && (this._startColor = cc.color(255, 255, 255, 255));

            this._startColor.r = val.r;
            this._startColor.g = val.g;
            this._startColor.b = val.b;
            this._startColor.a = val.a;
            this._simulator && this._simulator.setStartColor(val.r, val.g, val.b, val.a);
        }
    });

    Object.defineProperty(PSProto, 'startColorVar', {
        get () {
            !this._startColorVar && (this._startColorVar = cc.color(0, 0, 0, 0));
            return this._startColorVar;
        },
        set (val) {
            if (!val) return;
            !this._startColorVar && (this._startColorVar = cc.color(0, 0, 0, 0));

            this._startColorVar.r = val.r;
            this._startColorVar.g = val.g;
            this._startColorVar.b = val.b;
            this._startColorVar.a = val.a;
            this._simulator && this._simulator.setStartColorVar(val.r, val.g, val.b, val.a);
        }
    });

    Object.defineProperty(PSProto, 'endColor', {
        get () {
            !this._endColor && (this._endColor = cc.color(255, 255, 255, 0));
            return this._endColor;
        },
        set (val) {
            if (!val) return;
            !this._endColor && (this._endColor = cc.color(255, 255, 255, 0));

            this._endColor.r = val.r;
            this._endColor.g = val.g;
            this._endColor.b = val.b;
            this._endColor.a = val.a;
            this._simulator && this._simulator.setEndColor(val.r, val.g, val.b, val.a);
        }
    });

    Object.defineProperty(PSProto, 'endColorVar', {
        get () {
            !this._endColorVar && (this._endColorVar = cc.color(0, 0, 0, 0));
            return this._endColorVar;
        },
        set (val) {
            if (!val) return;
            !this._endColorVar && (this._endColorVar = cc.color(0, 0, 0, 0));

            this._endColorVar.r = val.r;
            this._endColorVar.g = val.g;
            this._endColorVar.b = val.b;
            this._endColorVar.a = val.a;
            this._simulator && this._simulator.setEndColorVar(val.r, val.g, val.b, val.a);
        }
    });

    Object.defineProperty(PSProto, 'particleCount', {
        get () {
            if (!this._simulator) {
                return 0;
            }
            return this._simulator.getParticleCount();
        }
    });

    Object.defineProperty(PSProto, 'active', {
        get () {
            if (!this._simulator) {
                return false;
            }
            return this._simulator.active();
        }
    });
    
    PSProto.onLoad = function () {
        this._simulator.bindNodeProxy(this.node._proxy);
    }

    // shield in native
    PSProto.update = undefined;

    PSProto.initNativeHandle = function () {
        this._assembler = undefined;
        this._renderHandle = new middleware.MiddlewareRenderHandle();
        this._renderHandle.bind(this);
    };

    var _onEnable = PSProto.onEnable;
    PSProto.onEnable = function () {
        _onEnable.call(this);
        if (this._simulator) {
            this._simulator.onEnable();
        }
    }

    var _onDisable = PSProto.onDisable;
    PSProto.onDisable = function () {
        _onDisable.call(this);
        if (this._simulator) {
            this._simulator.onDisable();
        }
    }

    PSProto._onTextureLoaded = function () {
        this._texture = this._renderSpriteFrame.getTexture();
        this._simulator.updateUVs(this._renderSpriteFrame.uv);
        // Reactivate material
        this._activateMaterial();
    },

    PSProto._activateMaterial = function () {
        if (!this._material) {
            this._material = new renderEngine.SpriteMaterial();
            this._material.useTexture = true;
            this._material.useModel = true;
            this._material.useColor = false;
            this._simulator.setNativeEffect(this._material.effect._nativeObj);
        }

        if (!this._texture || !this._texture.loaded) {
            this._simulator.onDisable();
            this.markForRender(false);
            if (this._renderSpriteFrame) {
                this._applySpriteFrame();
            }
        }
        else {
            this.markForRender(true);
            this._simulator.onEnable();
            this._material.texture = this._texture;
            this._updateMaterial(this._material);
        }
    }

    var _applyFile = PSProto._applyFile;
    PSProto._applyFile = function () {
        _applyFile.call(this);
        this._simulator.setGravity(this._gravity.x, this._gravity.y, 0);
        this._simulator.setSourcePos(this._sourcePos.x, this._sourcePos.y, 0);
        this._simulator.setPosVar(this._posVar.x, this._posVar.y, 0);
        this._simulator.setStartColor(this._startColor.r, this._startColor.g, this._startColor.b, this._startColor.a);
        this._simulator.setStartColorVar(this._startColorVar.r, this._startColorVar.g, this._startColorVar.b, this._startColorVar.a);
        this._simulator.setEndColor(this._endColor.r, this._endColor.g, this._endColor.b, this._endColor.a);
        this._simulator.setEndColorVar(this._endColorVar.r, this._endColorVar.g, this._endColorVar.b, this._endColorVar.a);
    }

    var propertiesList = [
        "positionType",
        "emissionRate",
        "totalParticles",
        "duration",
        "emitterMode",
        "life",
        "lifeVar",
        "startSize",
        "startSizeVar",
        "endSize",
        "endSizeVar",
        "startSpin",
        "startSpinVar",
        "endSpin",
        "endSpinVar",
        "angle",
        "angleVar",
        "speed",
        "speedVar",
        "radialAccel",
        "radialAccelVar",
        "tangentialAccel",
        "tangentialAccelVar",
        "rotationIsDir",
        "startRadius",
        "startRadiusVar",
        "endRadius",
        "endRadiusVar",
        "rotatePerS",
        "rotatePerSVar",
    ];

    propertiesList.forEach( function(getSetName) {
        var varName = "_" + getSetName;
        Object.defineProperty(PSProto, getSetName, {
            get () {
                this[varName] === undefined && (this[varName] = 0);
                return this[varName];
            },
            set (val) {
                this[varName] = val;
                this._simulator && (this._simulator[getSetName] = val);
            }
        });
    });
    
 })();