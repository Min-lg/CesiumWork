<script setup>
// The URL on your server where CesiumJS's static files are hosted.
import * as Cesium from 'cesium';
// import "cesium/Build/Cesium/Widgets/widgets.css";
import { onMounted } from 'vue';

onMounted(async () => {
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiM2MyZDMwMy1kYzcyLTQ2YTAtYjc3OC0yZTJiZWFlMTY4ZDQiLCJpZCI6Mjc0NTg3LCJpYXQiOjE3MzkxMDgzNDJ9.Zzu42FvXHZ2iDHvghKkGSr3fvKK4H6hHHJbWid-QS5I';
    // viewer是所有API的开始
    const viewer = new Cesium.Viewer('cesiumContainer', {
        animation: false, // 隐藏动画控件
        baseLayerPicker: false, // 隐藏基础图层选择器
        fullscreenButton: false, // 隐藏全屏按钮
        geocoder: false, // 隐藏地理编码搜索框
        homeButton: false, // 隐藏返回初始视图按钮
        infoBox: false, // 隐藏信息框
        sceneModePicker: false, // 隐藏场景模式选择器（2D/3D切换）
        selectionIndicator: false, // 隐藏选择指示器
        timeline: false, // 隐藏时间轴
        navigationHelpButton: false, // 隐藏导航帮助按钮
        // imageryProvider: esri, // 影像图层，默认是谷歌的
        // terrainProvider: await Cesium.createWorldTerrainAsync({
        //     requestVertexNormals: true, // 水面特效
        // }), // 地形图层，默认是离线数据
    })

    // 添加中国的地图边界轮廓线
    let chinaMapLine = Cesium.GeoJsonDataSource.load('https://geo.datav.aliyun.com/areas_v3/bound/100000.json', {
        stroke: Cesium.Color.AQUA,
        fill: Cesium.Color.PALETURQUOISE.withAlpha(0),//填充区域设置为透明
        strokeWidth: 10,//在这里设置线宽度无效，所以在下边单独进行了线条样式设置
        markerSymbol: '?'
    });

    chinaMapLine.then(dataSource => {
        viewer.dataSources.add(dataSource);
        let entities = dataSource.entities.values;
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            let polyPositions = entity.polygon.hierarchy.getValue(
                Cesium.JulianDate.now()
            ).positions;
            let positions = entity.polygon.hierarchy._value.positions;
            entity.polyline = {
                positions: positions,
                width: 2,
                material: Cesium.Color.fromBytes(3, 255, 255)
            };
        }
    });

    // 在北京位置添加一个好看的光柱旁边悬浮文字北京
    viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(116.4074, 39.9042, 10000),
        billboard: {
            image: '/src/assets/img/position.png',
            scale: 0.15,
            color: Cesium.Color.RED
        },
        label: {
            text: '北京',
            font: '20px sans-serif',
            fillColor: Cesium.Color.WHEAT,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            pixelOffset: new Cesium.Cartesian2(0, -30),
        },
        polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([116.4074, 39.9042, 0, 116.4074, 39.9042, 10000]),
            material: Cesium.Color.AQUA
        }
    })

    let firstLoad = true;

    viewer.scene.globe.tileLoadProgressEvent.addEventListener((currentLoad) => {
        if (currentLoad === 0 && firstLoad) {
            console.log('地图加载完成');
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(116.4074, 32.9042, 700000),
                orientation: {
                    heading: Cesium.Math.toRadians(0),
                    pitch: Cesium.Math.toRadians(-30),
                },
            });
            firstLoad = false;
        }
    });

    // 创建光圈涟漪动画实体
    const rippleEntity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(116.4074, 39.9042, 10000),
        polyline: {
            positions: new Cesium.CallbackProperty(getRipplePositions, false),
            width: 4,
            material: new Cesium.ColorMaterialProperty(Cesium.Color.fromBytes(0, 191, 255, 128)),
            clampToGround: true
        }
    });

    let startTime = Cesium.JulianDate.now();
    let rippleRadius = 0;

    function getRipplePositions() {
        const currentTime = Cesium.JulianDate.now();
        const timeDifference = Cesium.JulianDate.secondsDifference(currentTime, startTime);
        rippleRadius = timeDifference * 80000; // 调整速度

        if (rippleRadius > 100000) {
            startTime = Cesium.JulianDate.now();
            rippleRadius = 0;
        }

        const positions = [];
        const numPoints = 100;
        for (let i = 0; i <= numPoints; i++) {
            const angle = (i / numPoints) * Cesium.Math.TWO_PI;
            const x = rippleRadius * Math.cos(angle);
            const y = rippleRadius * Math.sin(angle);
            positions.push(Cesium.Cartesian3.fromDegrees(116.4074 + x / 111320, 39.9042 + y / 111320, 0));
        }
        return positions;
    }
})
</script>
<template>
    <Suspense>
        <template #default>
            <div id="cesiumContainer"></div>
        </template>
        <template #fallback>
            <div>Loading...</div>
        </template>
    </Suspense>
</template>

<style scoped>
#cesiumContainer {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}
</style>