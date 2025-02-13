<script setup>
import { onMounted, onBeforeUnmount, ref, shallowRef } from 'vue';
import { createViewer } from '@/utils/cesium/viewer';
import { setupEventHandlers } from '@/utils/cesium/handlers';
import { create3DChart } from './effects';
import { ANIMATION_DURATION, DEFAULT_VIEW } from './constants';

// 使用 shallowRef 优化性能
const viewer = shallowRef(null);
const cleanup = ref(null);

onMounted(async () => {
    // 初始化 viewer
    viewer.value = createViewer('cesiumContainer');

    // 设置事件处理
    cleanup.value = setupEventHandlers(viewer.value, {
        onClick: handleEntityClick
    });

    // 优化地形加载
    await loadTerrainProvider(viewer.value);

    // 初始化视图
    initializeView(viewer.value);
});

onBeforeUnmount(() => {
    // 清理资源
    cleanup.value?.();
    viewer.value?.destroy();
});
</script>