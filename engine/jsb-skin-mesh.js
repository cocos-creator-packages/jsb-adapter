(function(){
    if (!cc.SkinnedMeshRenderer) return;

    let SkinnedMeshAssembler = cc.SkinnedMeshRenderer.__assembler__.prototype;
    let _updateRenderData = SkinnedMeshAssembler.updateRenderData;
    cc.js.mixin(SkinnedMeshAssembler, {
        updateRenderData (comp) {
            _updateRenderData.call(this, comp);
            comp.node._renderFlag |= cc.RenderFlow.FLAG_UPDATE_RENDER_DATA;
        },
    });
})();