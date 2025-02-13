// 优化 Viewer 配置
export function createViewer(container: string) {
    return new Cesium.Viewer(container, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        requestRenderMode: true, // 仅在需要时渲染
        maximumRenderTimeChange: Infinity, // 优化渲染性能
        scene3DOnly: true, // 仅使用3D模式
        targetFrameRate: 60, // 目标帧率
    });
}