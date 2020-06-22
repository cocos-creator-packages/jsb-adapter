/****************************************************************************
 Copyright (c) 2020 Xiamen Yaji Software Co., Ltd.

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
let gfxRect = new gfx.GFXRect();
let gfxColor = new gfx.GFXColor();
let gfxColorArray = [];

// Converters for converting js objects to jsb struct objects
let _converters = {
    origin: function (arg) {
        return arg;
    },
    texImagesToBuffers: function (texImages) {
        if (texImages) {
            let buffers = [];
            for (let i = 0; i < texImages.length; ++i) {
                let texImage = texImages[i];
                if (texImage instanceof HTMLCanvasElement) {
                    // Refer to HTMLCanvasElement and ImageData implementation
                    buffers.push(texImage._data.data);
                }
                else if (texImage instanceof HTMLImageElement) {
                    // Refer to HTMLImageElement implementation
                    buffers.push(texImage._data);
                }
                else {
                    console.log('copyTexImagesToTexture: Convert texImages to data buffers failed');
                    return null;
                }
            }
            return buffers;
        }
    },
    GFXOffset: function (offset) {
        return offset && new gfx.GFXOffset(offset.x, offset.y, offset.z);
    },
    GFXRect: function(rect) {
        if (rect) {
            Object.assign(gfxRect, rect);
        }
        return gfxRect;
    },
    GFXExtent: function (extent) {
        return extent && new gfx.GFXExtent(extent.width, extent.height, extent.depth);
    },
    TextureSubres: function (res) {
        return res && new gfx.TextureSubres(res.mipLevel, res.baseArrayLayer, res.layerCount);
    },
    // TextureCopy,
    BufferTextureCopy: function (obj) {
        let jsbOffset = _converters.GFXOffset(obj.texOffset);
        let jsbExtent = _converters.GFXExtent(obj.texExtent);
        let jsbSubres = _converters.TextureSubres(obj.texSubres);
        return new gfx.BufferTextureCopy(obj.buffStride, obj.buffTexHeight, jsbOffset, jsbExtent, jsbSubres);
    },
    BufferTextureCopyList: function (list) {
        if (list) {
            let jsbList = [];
            for (let i = 0; i < list.length; ++i) {
                jsbList.push(_converters.BufferTextureCopy(list[i]));
            }
            return jsbList;
        }
    },
    GFXViewport: function (vp) {
        return vp && new gfx.GFXViewport(vp.left, vp.top, vp.width, vp.height, vp.minDepth, vp.maxDepth);
    },
    GFXColor: function(color) {
        if (color) {
            Object.assign(gfxColor, color);
        }
        return gfxColor;
    },
    GFXColorArray: function(colors) {
        if (colors) {
            colors.forEach((t, i) => Object.assign(
                gfxColorArray[i] || (gfxColorArray[i] = new gfx.GFXColor()), t));
        }
        return gfxColorArray;
    },
    DeviceInfo: function (info) {
        let width = cc.game.canvas.width,
            height = cc.game.canvas.height,
            handler = window.windowHandler;
        return new gfx.DeviceInfo(handler, width, height, info.nativeWidth, info.nativeHeight, null);
    },
    // ContextInfo,
    BufferInfo: function (info) {
        return new gfx.BufferInfo(info);
    },
    // GFXDrawInfo,
    // GFXIndirectBuffer,
    TextureInfo: function (info) {
        return new gfx.TextureInfo(info);
    },
    TextureViewInfo: function (info) {
        return new gfx.TextureViewInfo(info);
    },
    GFXSamplerInfo: function (info) {
        info.borderColor = _converters.GFXColor(info.borderColor);
        return new gfx.GFXSamplerInfo(info);
    },
    GFXShaderMacro: function (macro) {
        return new gfx.GFXShaderMacro(macro.macro, macro.value);
    },
    GFXUniform: function (u) {
        return new gfx.GFXUniform(u.name, u.type, u.count);
    },
    GFXUniformBlock: function (block) {
        let uniforms = block.members;
        let jsbUniforms;
        if (uniforms) {
            jsbUniforms = [];
            for (let i = 0; i < uniforms.length; ++i) {
                jsbUniforms.push(_converters.GFXUniform(uniforms[i]));
            }
        }
        return new gfx.GFXUniformBlock(block.shaderStages, block.binding, block.name, jsbUniforms);
    },
    GFXUniformSampler: function (sampler) {
        return new gfx.GFXUniformSampler(sampler.shaderStages, sampler.binding, sampler.name, sampler.type, sampler.count);
    },
    GFXShaderStage: function (stage) {
        let macros = stage.macros;
        let jsbMacros;
        if (macros) {
            jsbMacros = [];
            for (let i = 0; i < macros.length; ++i) {
                jsbMacros.push(_converters.GFXShaderMacro(macros[i]));
            }
        }
        return new gfx.GFXShaderStage(stage.type, stage.source, jsbMacros);
    },
    GFXShaderInfo: function (info) {
        let stages = info.stages,
            attributes = info.attributes,
            blocks = info.blocks,
            samplers = info.samplers;
        let jsbStages, jsbAttributes, jsbBlocks, jsbSamplers;
        if (stages) {
            jsbStages = [];
            for (let i = 0; i < stages.length; ++i) {
                jsbStages.push(_converters.GFXShaderStage(stages[i]));
            }
        }
        if (attributes) {
            jsbAttributes = [];
            for (let i = 0; i < attributes.length; ++i) {
                jsbAttributes.push(_converters.GFXAttribute(attributes[i]));
            }
        }
        if (blocks) {
            jsbBlocks = [];
            for (let i = 0; i < blocks.length; ++i) {
                jsbBlocks.push(_converters.GFXUniformBlock(blocks[i]));
            }
        }
        if (samplers) {
            jsbSamplers = [];
            for (let i = 0; i < samplers.length; ++i) {
                jsbSamplers.push(_converters.GFXUniformSampler(samplers[i]));
            }
        }
        return new gfx.GFXShaderInfo(info.name, jsbStages, jsbAttributes, jsbBlocks, jsbSamplers);
    },
    GFXAttribute: function (attr) {
        return new gfx.GFXAttribute(attr.name, attr.format, attr.isNormalized, attr.stream, attr.isInstanced, attr.location);
    },
    InputAssemblerInfo: function (info) {
        let attrs = info.attributes;
        let jsbAttrs;
        if (attrs) {
            jsbAttrs = [];
            for (let i = 0; i < attrs.length; ++i) {
                jsbAttrs.push(_converters.GFXAttribute(attrs[i]));
            }
        }
        return new gfx.InputAssemblerInfo(jsbAttrs, info.vertexBuffers, info.indexBuffer, info.indirectBuffer);
    },
    GFXColorAttachment: function (attachment) {
        return new gfx.GFXColorAttachment(attachment);
    },
    GFXDepthStencilAttachment: function (attachment) {
        return new gfx.GFXDepthStencilAttachment(attachment);
    },
    GFXSubPass: function (subPass) {
        return new gfx.GFXSubPass(subPass);
    },
    RenderPassInfo: function (info) {
        let colors = info.colorAttachments,
            subPasses = info.subPasses;
        let jsbColors, jsbSubPasses;
        if (colors) {
            jsbColors = [];
            for (let i = 0; i < colors.length; ++i) {
                jsbColors.push(_converters.GFXColorAttachment(colors[i]));
            }
        }
        if (subPasses) {
            jsbSubPasses = [];
            for (let i = 0; i < subPasses.length; ++i) {
                jsbSubPasses.push(_converters.GFXSubPass(subPasses[i]));
            }
        }
        let jsbDSAttachment = _converters.GFXDepthStencilAttachment(info.depthStencilAttachment);
        return new gfx.RenderPassInfo(jsbColors, jsbDSAttachment, jsbSubPasses);
    },
    FramebufferInfo: function (info) {
        return new gfx.FramebufferInfo(info);
    },
    GFXBinding: function (binding) {
        return new gfx.GFXBinding(binding.shaderStages, binding.binding, binding.bindingType, binding.name, binding.count);
    },
    BindingLayoutInfo: function (info) {
        let bindings = info.bindings;
        let jsbBindings;
        if (bindings) {
            jsbBindings = [];
            for (let i = 0; i < bindings.length; ++i) {
                jsbBindings.push(_converters.GFXBinding(bindings[i]));
            }
        }
        return new gfx.BindingLayoutInfo(jsbBindings);
    },
    GFXBindingUnit: function (info) {
        return new gfx.GFXBindingUnit(info);
    },
    GFXPushConstantRange: function (range) {
        return new gfx.GFXPushConstantRange(range.shaderType, range.offset, range.count);
    },
    PipelineLayoutInfo: function (info) {
        let ranges = info.pushConstantRanges,
            layouts = info.layouts;
        let jsbRanges;
        if (ranges) {
            jsbRanges = [];
            for (let i = 0; i < ranges.length; ++i) {
                jsbRanges.push(_converters.GFXPushConstantRange(ranges[i]));
            }
        }
        // for (let i = 0; i < layouts.length; ++i) {
        //     jsbLayouts.push(_converters.BindingLayout(layouts[i]));
        // }
        // Layouts are pointers which should be passing through directly
        return new gfx.PipelineLayoutInfo(jsbRanges, layouts);
    },
    GFXInputState: function (info) {
        let attrs = info.attributes;
        let jsbAttrs;
        if (attrs) {
            jsbAttrs = [];
            for (let i = 0; i < attrs.length; ++i) {
                jsbAttrs.push(_converters.GFXAttribute(attrs[i]));
            }
        }
        return new gfx.GFXInputState(jsbAttrs);
    },
    GFXRasterizerState: function (info) {
        return new gfx.GFXRasterizerState(info);
    },
    GFXDepthStencilState: function (info) {
        return new gfx.GFXDepthStencilState(info);
    },
    GFXBlendTarget: function (info) {
        return new gfx.GFXBlendTarget(info);
    },
    GFXBlendState: function (state) {
        let targets = state.targets;
        let jsbTargets;
        if (targets) {
            jsbTargets = [];
            for (let i = 0; i < targets.length; ++i) {
                jsbTargets.push(_converters.GFXBlendTarget(targets[i]));
            }
        }
        let color = _converters.GFXColor(state.blendColor);
        return new gfx.GFXBlendState(state.isA2c, state.isIndepend, color, jsbTargets);
    },
    PipelineStateInfo: function (info) {
        let jsbInfo = {
            primitive: info.primitive,
            shader: info.shader,
            inputState: _converters.GFXInputState(info.inputState),
            rasterizerState: _converters.GFXRasterizerState(info.rasterizerState),
            depthStencilState: _converters.GFXDepthStencilState(info.depthStencilState),
            blendState: _converters.GFXBlendState(info.blendState),
            dynamicStates: info.dynamicStates,
            layout: info.layout,
            renderPass: info.renderPass,
        }
        return new gfx.PipelineStateInfo(jsbInfo);
    },
    GFXCommandAllocatorInfo: function (info) {
        // not available
        return null;
    },
    CommandBufferInfo: function (info) {
        return new gfx.CommandBufferInfo(info);
    },
    QueueInfo: function (info) {
        return new gfx.QueueInfo(info.type);
    },
    GFXFormatInfo: function (info) {
        return new gfx.GFXFormatInfo(info);
    },
    // GFXMemoryStatus,
};

// Helper functions to convert the original jsb function to a wrapper function
function replaceFunction (jsbFunc, ...converters) {
    let l = converters.length;
    // Validation
    for (let i = 0; i < l; ++i) {
        if (!converters[i]) {
            return null;
        }
    }
    if (l === 1) {
        return function (param0) {
            // Convert parameters one by one
            let _jsbParam0 = converters[0](param0);
            return this[jsbFunc](_jsbParam0);
        }
    }
    else if (l === 2) {
        return function (param0, param1) {
            // Convert parameters one by one
            let _jsbParam0 = converters[0](param0);
            let _jsbParam1 = converters[1](param1);
            return this[jsbFunc](_jsbParam0, _jsbParam1);
        }
    }
    else if (l === 3) {
        return function (param0, param1, param2) {
            // Convert parameters one by one
            let _jsbParam0 = converters[0](param0);
            let _jsbParam1 = converters[1](param1);
            let _jsbParam2 = converters[2](param2);
            return this[jsbFunc](_jsbParam0, _jsbParam1, _jsbParam2);
        }
    }
    else {
        return function (...params) {
            if (l !== params.length) {
                throw new Error(jsbFunc + ': The parameters length don\'t match the converters length');
            }
            let jsbParams = new Array(l);
            for (let i = 0; i < l; ++i) {
                jsbParams[i] = converters[i](params[i]);
            }
            return this[jsbFunc].apply(this, jsbParams);
        }
    };
}

// Replace all given functions to the wrapper function provided
function replace (proto, replacements) {
    for (let func in replacements) {
        let oldFunc = proto[func];
        let newFunc = replacements[func];
        if (oldFunc && newFunc) {
            let jsbFunc = '_' + func;
            proto[jsbFunc] = oldFunc;
            proto[func] = newFunc;
        }
    }
}

let deviceProtos = [
    gfx.CCVKDevice && gfx.CCVKDevice.prototype,
    gfx.CCMTLDevice && gfx.CCMTLDevice.prototype,
    gfx.GLES3Device && gfx.GLES3Device.prototype,
    gfx.GLES2Device && gfx.GLES2Device.prototype,
];
deviceProtos.forEach(function(item, index) {
    if (item !== undefined) {
        replace(item, {
            initialize: replaceFunction('_initialize', _converters.DeviceInfo),
            createQueue: replaceFunction('_createQueue', _converters.QueueInfo),
            // createCommandAllocator: replaceFunction('_createCommandAllocator', _converters.GFXCommandAllocatorInfo),
            createCommandBuffer: replaceFunction('_createCommandBuffer', _converters.CommandBufferInfo),
            createBuffer: replaceFunction('_createBuffer', _converters.BufferInfo),
            createSampler: replaceFunction('_createSampler', _converters.GFXSamplerInfo),
            createShader: replaceFunction('_createShader', _converters.GFXShaderInfo),
            createInputAssembler: replaceFunction('_createInputAssembler', _converters.InputAssemblerInfo),
            createRenderPass: replaceFunction('_createRenderPass', _converters.RenderPassInfo),
            createFramebuffer: replaceFunction('_createFramebuffer', _converters.FramebufferInfo),
            createBindingLayout: replaceFunction('_createBindingLayout', _converters.BindingLayoutInfo),
            createPipelineState: replaceFunction('_createPipelineState', _converters.PipelineStateInfo),
            createPipelineLayout: replaceFunction('_createPipelineLayout', _converters.PipelineLayoutInfo),
            copyBuffersToTexture: replaceFunction('_copyBuffersToTexture', _converters.origin, _converters.origin, _converters.BufferTextureCopyList),
            copyTexImagesToTexture: replaceFunction('_copyTexImagesToTexture', _converters.texImagesToBuffers, _converters.origin, _converters.BufferTextureCopyList),
        });

        let oldDeviceCreatTextureFun = item.createTexture;
        item.createTexture = function(info) {
            if (info.texture) {
                return oldDeviceCreatTextureFun.call(this, _converters.TextureViewInfo(info), true);
            } else {
                return oldDeviceCreatTextureFun.call(this, _converters.TextureInfo(info), false);
            }
        }
    }
});

let bindingLayoutProto = gfx.BindingLayout.prototype;
replace(bindingLayoutProto, {
    initialize: replaceFunction('_initialize', _converters.BindingLayoutInfo),
});

let bufferProto = gfx.Buffer.prototype;
replace(bufferProto, {
    initialize: replaceFunction('_initialize', _converters.BufferInfo),
});

let oldUpdate = bufferProto.update;
bufferProto.update = function(buffer, offset, size) {
    let buffSize;
    if (size !== undefined ) {
        buffSize = size;
    } else if (this.usage & 0x40) { // BufferUsageBit.INDIRECT
        // It is a IGFXIndirectBuffer object.
        let drawInfos = buffer.drawInfos;
        buffer = new Uint32Array(drawInfos.length * 7);
        let baseIndex = 0;
        let drawInfo;
        for (let i = 0; i < drawInfos.length; ++i) {
            baseIndex = i * 7;
            drawInfo = drawInfos[i];
            buffer[baseIndex] = drawInfo.vertexCount;
            buffer[baseIndex + 1] = drawInfo.firstVertex;
            buffer[baseIndex + 2] = drawInfo.indexCount;
            buffer[baseIndex + 3] = drawInfo.firstIndex;
            buffer[baseIndex + 4] = drawInfo.vertexOffset;
            buffer[baseIndex + 5] = drawInfo.instanceCount;
            buffer[baseIndex + 6] = drawInfo.firstInstance;
        }

        buffSize = buffer.byteLength;
    } else {
        buffSize = buffer.byteLength;
    }

    oldUpdate.call(this, buffer, offset || 0, buffSize);
}

// let commandAllocProto = gfx.GFXCommandAllocator.prototype;
// replace(commandAllocProto, {
//     initialize: replaceFunction('_initialize', _converters.GFXCommandAllocatorInfo),
// });

let commandBufferProto = gfx.CommandBuffer.prototype;
replace(commandBufferProto, {
    initialize: replaceFunction('_initialize', _converters.CommandBufferInfo),
    setViewport: replaceFunction('_setViewport', _converters.GFXViewport),
    setScissor: replaceFunction('_setScissor', _converters.GFXRect),
    setBlendConstants: replaceFunction('_setBlendConstants', _converters.GFXColor),
    beginRenderPass: replaceFunction('_beginRenderPass',
        _converters.origin,
        _converters.GFXRect,
        _converters.origin,
        _converters.GFXColorArray,
        _converters.origin,
        _converters.origin),
});

// let contextProto = gfx.Context.prototype;
// replace(contextProto, {
//     initialize: replaceFunction('_initialize', _converters.ContextInfo),
// });

let framebufferProto = gfx.Framebuffer.prototype;
replace(framebufferProto, {
    initialize: replaceFunction('_initialize', _converters.FramebufferInfo),
});

let iaProto = gfx.InputAssembler.prototype;
replace(iaProto, {
    initialize: replaceFunction('_initialize', _converters.InputAssemblerInfo),
});

let pipelineLayoutProto = gfx.PipelineLayout.prototype;
replace(pipelineLayoutProto, {
    initialize: replaceFunction('_initialize', _converters.PipelineLayoutInfo),
});

let pipelineStateProto = gfx.PipelineState.prototype;
replace(pipelineStateProto, {
    initialize: replaceFunction('_initialize', _converters.PipelineStateInfo),
});

let queueProto = gfx.Queue.prototype;
replace(queueProto, {
    initialize: replaceFunction('_initialize', _converters.QueueInfo),
});

let renderPassProto = gfx.RenderPass.prototype;
replace(renderPassProto, {
    initialize: replaceFunction('_initialize', _converters.RenderPassInfo),
});

let samplerProto = gfx.GFXSampler.prototype;
replace(samplerProto, {
    initialize: replaceFunction('_initialize', _converters.GFXSamplerInfo),
});

let shaderProto = gfx.GFXShader.prototype;
replace(shaderProto, {
    initialize: replaceFunction('_initialize', _converters.GFXShaderInfo),
});
cc.js.get(shaderProto, 'id', function () {
    return this.hash;
});

let textureProto = gfx.Texture.prototype;
let oldTextureInitializeFunc = textureProto.initialize;
textureProto.initialize = function(info) {
    if (info.texture) {
        oldTextureInitializeFunc.call(this, _converters.TextureViewInfo(info), true);
    } else {
        oldTextureInitializeFunc.call(this, _converters.TextureInfo(info), false);
    }
}
