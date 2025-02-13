import { debounce, throttle } from 'lodash-es';

export function setupEventHandlers(viewer: Cesium.Viewer, handlers: Handlers) {
    // 节流处理相机移动事件
    const handleCameraMove = throttle(() => {
        // 相机移动处理逻辑
    }, 16); // 约60fps

    // 防抖处理点击事件
    const handleClick = debounce((movement) => {
        const pickedObject = viewer.scene.pick(movement.position);
        if (Cesium.defined(pickedObject)) {
            handlers.onClick?.(pickedObject.id);
        }
    }, 200);

    viewer.camera.changed.addEventListener(handleCameraMove);
    viewer.screenSpaceEventHandler.setInputAction(handleClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // 返回清理函数
    return () => {
        viewer.camera.changed.removeEventListener(handleCameraMove);
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };
}