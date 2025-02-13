<script setup>
import * as Cesium from 'cesium';
import { onMounted, ref } from 'vue';
import positionImg from '@/assets/img/position.png'
import { isLoading } from '@/store'
import EcoLoading from '@/components/EcoLoading.vue'

const showPanel = ref(false);
const showBackButton = ref(false);
const viewerInstance = ref(null);
const currentCity = ref('全国平均');

// 存储相机位置历史
const cameraPositions = ref([]);

// 1. 优化数据结构和常量定义
const ANIMATION_DURATION = {
    CITY_FLY: 2.5,
    BACK: 1.5,
    ENTRY: 3
};

const DEFAULT_VIEW = {
    position: {
        lon: 111.5,
        lat: 13.5,
        height: 3500000
    },
    orientation: {
        heading: 0,
        pitch: -50,
        roll: 0
    }
};

const CITY_VIEW = {
    offsetLon: 1.3,
    offsetLat: -1.8,
    height: 150000,
    heading: -30,
    pitch: -35
};

// 2. 优化监测点数据结构
const monitoringPoints = [
    { lon: 116.4074, lat: 39.9042, name: '北京市', height: 5000 },
    { lon: 121.4737, lat: 31.2304, name: '上海市', height: 5000 },
    { lon: 113.2644, lat: 23.1291, name: '广州市', height: 5000 },
    { lon: 104.0668, lat: 30.5728, name: '成都市', height: 5000 }
].map(point => ({
    ...point,
    id: crypto.randomUUID(), // 添加唯一ID
    colorEffect: {
        cylinders: 3,
        baseHeight: 8000,
        heightIncrement: 2000
    }
}));

// 3. 优化环境数据生成
function generateRandomEcoData() {
    const getRandomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    return {
        airQuality: getRandomInRange(30, 80),
        vegetation: getRandomInRange(40, 80),
        waterQuality: Math.random() > 0.3 ? '良好' : '一般'
    };
}

// 环境数据存储
const ecoData = ref({
    '全国平均': {
        airQuality: 75,
        vegetation: 65,
        waterQuality: '良好'
    }
});

// 保存相机位置
function savePosition(camera) {
    const position = {
        lon: Cesium.Math.toDegrees(Cesium.Cartographic.fromCartesian(camera.position).longitude),
        lat: Cesium.Math.toDegrees(Cesium.Cartographic.fromCartesian(camera.position).latitude),
        height: Cesium.Cartographic.fromCartesian(camera.position).height,
        heading: camera.heading,
        pitch: camera.pitch,
        roll: camera.roll
    };
    cameraPositions.value.push(position);
    showBackButton.value = true;
}

// 返回上一个位置
function goBack() {
    if (cameraPositions.value.length === 0) return;

    const lastPosition = cameraPositions.value.pop();
    const viewer = viewerInstance.value;

    if (!viewer) return;

    // 如果返回到初始视角，重置为全国数据
    if (cameraPositions.value.length === 0) {
        currentCity.value = '全国平均';
        // 清除统计图
        viewer.entities.values
            .filter(entity => entity.id?.startsWith('chart-'))
            .forEach(entity => viewer.entities.remove(entity));
    }

    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
            lastPosition.lon,
            lastPosition.lat,
            lastPosition.height
        ),
        orientation: {
            heading: lastPosition.heading,
            pitch: lastPosition.pitch,
            roll: lastPosition.roll
        },
        duration: 1.5,
        complete: function () {
            if (cameraPositions.value.length === 0) {
                showBackButton.value = false;
            }
        }
    });
}

// function getCameraPosition(viewer) {
//     // 获取当前相机位置的笛卡尔坐标
//     const cameraPosition = viewer.camera.position;

//     // 将笛卡尔坐标转换为地理坐标（弧度）
//     const cartographic = Cesium.Cartographic.fromCartesian(cameraPosition);

//     // 转换为度数
//     const longitude = Cesium.Math.toDegrees(cartographic.longitude);
//     const latitude = Cesium.Math.toDegrees(cartographic.latitude);
//     const height = cartographic.height; // 高度（米）

//     console.log('相机位置：', {
//         longitude: longitude.toFixed(6), // 经度
//         latitude: latitude.toFixed(6),   // 纬度
//         height: height.toFixed(2),       // 高度
//         heading: Cesium.Math.toDegrees(viewer.camera.heading).toFixed(2), // 方向角
//         pitch: Cesium.Math.toDegrees(viewer.camera.pitch).toFixed(2),     // 俯仰角
//         roll: Cesium.Math.toDegrees(viewer.camera.roll).toFixed(2)        // 翻滚角
//     });

//     return { longitude, latitude, height };
// }

// // 可以在相机移动事件中监听位置变化
// function addCameraChangeListener(viewer) {
//     viewer.camera.changed.addEventListener(() => {
//         getCameraPosition(viewer);
//     });
// }

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
        terrainProvider: await Cesium.createWorldTerrainAsync({
            requestVertexNormals: true,
            requestWaterMask: true // 启用水面特效
        }),
    })

    viewerInstance.value = viewer; // 保存 viewer 实例

    // 先定义 PolylineTrailMaterialProperty
    function PolylineTrailMaterialProperty(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._trailLength = undefined;
        this._period = undefined;
        this._time = new Date().getTime();

        this.color = options.color;
        this.trailLength = options.trailLength;
        this.period = options.period;
    }

    Object.defineProperties(PolylineTrailMaterialProperty.prototype, {
        isConstant: {
            get: function () {
                return false;
            }
        },
        definitionChanged: {
            get: function () {
                return this._definitionChanged;
            }
        },
        color: Cesium.createPropertyDescriptor('color'),
        trailLength: Cesium.createPropertyDescriptor('trailLength'),
        period: Cesium.createPropertyDescriptor('period')
    });

    PolylineTrailMaterialProperty.prototype.getType = function () {
        return 'PolylineTrail';
    };

    PolylineTrailMaterialProperty.prototype.getValue = function (time, result) {
        if (!Cesium.defined(result)) {
            result = {};
        }
        result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
        result.trailLength = this.trailLength;
        result.period = this.period;
        result.time = (((new Date().getTime() - this._time) % (this.period * 1000)) / (this.period * 1000));
        return result;
    };

    PolylineTrailMaterialProperty.prototype.equals = function (other) {
        return (
            this === other ||
            (other instanceof PolylineTrailMaterialProperty &&
                Cesium.Property.equals(this._color, other._color) &&
                this._trailLength === other._trailLength &&
                this._period === other._period)
        );
    };

    // 注册材质
    Cesium.Material._materialCache.addMaterial('PolylineTrail', {
        fabric: {
            type: 'PolylineTrail',
            uniforms: {
                color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
                time: 0,
                trailLength: 0.5,
                period: 2.0
            },
            source: `
                czm_material czm_getMaterial(czm_materialInput materialInput) {
                    czm_material material = czm_getDefaultMaterial(materialInput);
                    vec2 st = materialInput.st;
                    float t = time;

                    float trail = smoothstep(1.0 - trailLength, 1.0, fract(st.s - t));
                    trail *= smoothstep(0.0, trailLength, fract(st.s - t));

                    material.diffuse = color.rgb;
                    material.alpha = color.a * trail;

                    return material;
                }
            `
        },
        translucent: function () {
            return true;
        }
    });

    let firstLoad = true;

    // 添加环境监测点位
    function addEnvironmentPoint(lon, lat, name, height = 5000) {
        // 创建点位实体
        viewer.entities.add({
            name: name, // 添加名称属性用于识别
            position: Cesium.Cartesian3.fromDegrees(lon, lat, height),
            // 使用 Cesium 内置的 pin 图标
            billboard: {
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                scale: 1,
                image: new Cesium.PinBuilder().fromColor(Cesium.Color.ROYALBLUE, 48)
            },
            // 添加标签
            label: {
                text: name,
                font: '16px sans-serif',
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -60)
            },
            // 添加发光柱效果
            cylinder: {
                length: height,
                topRadius: 500,
                bottomRadius: 500,
                material: new Cesium.Color(0, 191, 255, 0.3),
                outline: true,
                outlineColor: Cesium.Color.AQUA
            }
        });
    }

    // 修改监测点数据
    const monitoringPoints = [
        { lon: 116.4074, lat: 39.9042, name: '北京市' },
        { lon: 121.4737, lat: 31.2304, name: '上海市' },
        { lon: 113.2644, lat: 23.1291, name: '广州市' },
        { lon: 104.0668, lat: 30.5728, name: '成都市' }
    ];

    // 添加动态颜色变化效果
    function addColorChangeEffect(lon, lat) {
        // 使用多个圆柱体叠加创建动态效果
        for (let i = 0; i < 3; i++) {
            viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(lon, lat),
                cylinder: {
                    length: 8000 + i * 2000,
                    topRadius: new Cesium.CallbackProperty(function (time) {
                        return 50000 + Math.sin(Date.now() / 1000 + i) * 10000;
                    }, false),
                    bottomRadius: new Cesium.CallbackProperty(function (time) {
                        return 50000 + Math.sin(Date.now() / 1000 + i) * 10000;
                    }, false),
                    material: Cesium.Color.AQUA.withAlpha(0.2)
                }
            });
        }
    }

    // 4. 优化相机动画函数
    function createCameraAnimation(destination, orientation, duration) {
        return {
            destination: Cesium.Cartesian3.fromDegrees(
                destination.lon,
                destination.lat,
                destination.height
            ),
            orientation: {
                heading: Cesium.Math.toRadians(orientation.heading),
                pitch: Cesium.Math.toRadians(orientation.pitch),
                roll: orientation.roll
            },
            duration
        };
    }

    // 添加3D统计图相关函数
    function create3DChart(lon, lat, data) {
        // 清除之前的统计图
        viewerInstance.value.entities.values
            .filter(entity => entity.id?.startsWith('chart-'))
            .forEach(entity => viewerInstance.value.entities.remove(entity));

        // 设置基础参数
        const offsetLon = -0.6;
        const offsetLat = -0.8;

        // 优化缓动函数，使用更平滑的曲线
        const easeInOut = (t) => {
            // 使用三次贝塞尔曲线实现更平滑的过渡
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        // 添加动画控制
        const startTime = Date.now();
        const animationDuration = 1500; // 1.5秒的增长动画

        // 计算固定位置
        const chartPosition = Cesium.Cartesian3.fromDegrees(lon + offsetLon, lat + offsetLat, data.airQuality * 250);
        const chartPositionVeg = Cesium.Cartesian3.fromDegrees(lon + offsetLon, lat + offsetLat + 0.1, data.vegetation * 250);

        // 创建空气质量柱状图
        viewerInstance.value.entities.add({
            id: 'chart-air',
            position: chartPosition, // 使用固定位置
            cylinder: {
                length: new Cesium.CallbackProperty((time) => {
                    const elapsedTime = Date.now() - startTime;
                    const progress = Math.min(elapsedTime / animationDuration, 1);
                    const easeProgress = easeInOut(progress);
                    return data.airQuality * 1000 * easeProgress;
                }, false),
                topRadius: 5000,
                bottomRadius: 5000,
                material: new Cesium.ColorMaterialProperty(
                    new Cesium.CallbackProperty(() => {
                        const time = Date.now();
                        const phase = (time % 6000) / 6000;
                        const easedPhase = easeInOut(phase);
                        const alpha = 0.92 - easedPhase * 0.08;
                        const g = 0.5 + easedPhase * 0.08;
                        return new Cesium.Color(0.1, g, 1.0, alpha);
                    }, false)
                ),
                outline: false
            }
        });

        // 添加空气质量光环效果，跟随柱子高度增长
        viewerInstance.value.entities.add({
            id: 'chart-air-glow',
            position: chartPosition, // 使用相同的固定位置
            cylinder: {
                length: new Cesium.CallbackProperty((time) => {
                    const elapsedTime = Date.now() - startTime;
                    const progress = Math.min(elapsedTime / animationDuration, 1);
                    const easeProgress = easeInOut(progress);
                    return (data.airQuality * 1000 + 2000) * easeProgress;
                }, false),
                topRadius: 6000,
                bottomRadius: 6000,
                material: new Cesium.ColorMaterialProperty(
                    new Cesium.CallbackProperty(() => {
                        const time = Date.now();
                        const phase = (time % 8000) / 8000;
                        const easedPhase = easeInOut(phase);
                        const alpha = 0.25 + easedPhase * 0.1;
                        return new Cesium.Color(0.2, 0.6, 1.0, alpha);
                    }, false)
                ),
                outline: false
            }
        });

        // 创建植被覆盖率柱状图
        viewerInstance.value.entities.add({
            id: 'chart-vegetation',
            position: chartPositionVeg, // 使用固定位置
            cylinder: {
                length: new Cesium.CallbackProperty((time) => {
                    const elapsedTime = Date.now() - startTime;
                    const progress = Math.min(elapsedTime / animationDuration, 1);
                    const easeProgress = easeInOut(progress);
                    return data.vegetation * 1000 * easeProgress;
                }, false),
                topRadius: 5000,
                bottomRadius: 5000,
                material: new Cesium.ColorMaterialProperty(
                    new Cesium.CallbackProperty(() => {
                        const time = Date.now();
                        const phase = ((time + 3000) % 6000) / 6000;
                        const easedPhase = easeInOut(phase);
                        const alpha = 0.92 - easedPhase * 0.08;
                        const g = 0.85 + easedPhase * 0.08;
                        return new Cesium.Color(0.2, g, 0.3, alpha);
                    }, false)
                ),
                outline: false
            }
        });

        // 添加植被覆盖率光环效果，跟随柱子高度增长
        viewerInstance.value.entities.add({
            id: 'chart-vegetation-glow',
            position: chartPositionVeg, // 使用相同的固定位置
            cylinder: {
                length: new Cesium.CallbackProperty((time) => {
                    const elapsedTime = Date.now() - startTime;
                    const progress = Math.min(elapsedTime / animationDuration, 1);
                    const easeProgress = easeInOut(progress);
                    return (data.vegetation * 1000 + 2000) * easeProgress;
                }, false),
                topRadius: 6000,
                bottomRadius: 6000,
                material: new Cesium.ColorMaterialProperty(
                    new Cesium.CallbackProperty(() => {
                        const time = Date.now();
                        const phase = ((time + 1500) % 8000) / 8000;
                        const easedPhase = easeInOut(phase);
                        const alpha = 0.25 + easedPhase * 0.1;
                        return new Cesium.Color(0.2, 0.9, 0.3, alpha);
                    }, false)
                ),
                outline: false
            }
        });

        // 底座使用固定位置
        const basePosition = Cesium.Cartesian3.fromDegrees(lon + offsetLon, lat + offsetLat, 0);
        viewerInstance.value.entities.add({
            id: 'chart-base',
            position: basePosition,
            cylinder: {
                length: 500,
                topRadius: 25000,
                bottomRadius: 25000,
                material: new Cesium.ColorMaterialProperty(
                    new Cesium.CallbackProperty(() => {
                        const time = Date.now();
                        const phase = (time % 10000) / 10000;
                        const easedPhase = easeInOut(phase);
                        const alpha = 0.18 + easedPhase * 0.07;
                        return new Cesium.Color(0.2, 0.6, 1.0, alpha);
                    }, false)
                ),
                outline: false
            }
        });

        // 添加空气质量标签
        viewerInstance.value.entities.add({
            id: 'chart-air-label',
            position: new Cesium.CallbackProperty(() => {
                return Cesium.Cartesian3.fromDegrees(
                    lon + offsetLon,
                    lat + offsetLat,
                    data.airQuality * 1000 + 5000
                );
            }, false),
            label: {
                text: `空气质量: ${data.airQuality}`,
                font: '16px "Microsoft YaHei"',
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -10),
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        });

        // 添加植被覆盖率标签
        viewerInstance.value.entities.add({
            id: 'chart-vegetation-label',
            position: new Cesium.CallbackProperty(() => {
                return Cesium.Cartesian3.fromDegrees(
                    lon + offsetLon,
                    lat + offsetLat + 0.1,
                    data.vegetation * 1000 + 5000
                );
            }, false),
            label: {
                text: `植被覆盖: ${data.vegetation}%`,
                font: '16px "Microsoft YaHei"',
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -10),
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        });
    }

    // 5. 优化 flyToCity 函数
    function flyToCity(lon, lat, name) {
        savePosition(viewerInstance.value.camera);
        currentCity.value = name;

        if (!ecoData.value[name]) {
            ecoData.value[name] = generateRandomEcoData();
        }

        const destination = {
            lon: lon + CITY_VIEW.offsetLon,
            lat: lat + CITY_VIEW.offsetLat,
            height: CITY_VIEW.height
        };

        // 先执行相机飞行，在完成回调中创建3D统计图
        viewerInstance.value.camera.flyTo({
            ...createCameraAnimation(
                destination,
                CITY_VIEW,
                ANIMATION_DURATION.CITY_FLY
            ),
            complete: () => {
                console.log(`已到达${name}`);
                // 相机到达后延迟300ms再创建统计图
                setTimeout(() => {
                    create3DChart(lon, lat, ecoData.value[name]);
                }, 300);
            }
        });
    }

    // 6. 优化 entry 函数
    function entry() {
        cameraPositions.value = [];
        showBackButton.value = false;
        currentCity.value = '全国平均';

        viewer.camera.flyTo({
            ...createCameraAnimation(
                DEFAULT_VIEW.position,
                DEFAULT_VIEW.orientation,
                ANIMATION_DURATION.ENTRY
            ),
            complete: () => {
                monitoringPoints.forEach(point => {
                    addColorChangeEffect(point.lon, point.lat);
                    addEnvironmentPoint(point.lon, point.lat, point.name, point.height);
                });
                setTimeout(() => showPanel.value = true, 500);
            }
        });

        firstLoad = false;
        isLoading.value = false;
    }

    // 修改点击事件处理
    function handleEntityClick(entity) {
        if (entity && entity.name) {
            const point = monitoringPoints.find(p => p.name === entity.name);
            if (point) {
                flyToCity(point.lon, point.lat, point.name);
            }
        }
    }

    viewer.screenSpaceEventHandler.setInputAction((movement) => {
        const pickedObject = viewer.scene.pick(movement.position);
        if (Cesium.defined(pickedObject)) {
            const entity = pickedObject.id;
            handleEntityClick(entity);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // 添加双击返回全局视图
    viewer.screenSpaceEventHandler.setInputAction(() => {
        entry();
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    // 添加相机变化监听
    // addCameraChangeListener(viewer);

    viewer.scene.globe.tileLoadProgressEvent.addEventListener((currentLoad) => {
        if (currentLoad === 0 && firstLoad) {
            console.log('地图加载完成');
            entry();
        }
    });

    // 添加中国边界线
    let chinaMapLine = Cesium.GeoJsonDataSource.load('https://geo.datav.aliyun.com/areas_v3/bound/100000.json', {
        stroke: new Cesium.Color(0.4, 0.8, 1.0, 0.3),
        fill: Cesium.Color.TRANSPARENT,
        strokeWidth: 10,
        markerSymbol: '?'
    });

    chinaMapLine.then(dataSource => {
        viewer.dataSources.add(dataSource);
        let entities = dataSource.entities.values;

        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            let positions = entity.polygon.hierarchy._value.positions;

            // 创建基础轮廓线（暗色）
            entity.polyline = {
                positions: positions,
                width: 2,
                material: new Cesium.Color(0.4, 0.8, 1.0, 0.1)
            };

            // 创建发光效果线
            viewer.entities.add({
                polyline: {
                    positions: positions,
                    width: 3,
                    material: new Cesium.PolylineGlowMaterialProperty({
                        glowPower: 0.15,
                        taperPower: 0.5,
                        color: new Cesium.Color(0.4, 0.8, 1.0, 0.8)
                    })
                }
            });

            // 创建流动发光效果
            viewer.entities.add({
                polyline: {
                    positions: positions,
                    width: 4,
                    material: new PolylineTrailMaterialProperty({
                        color: new Cesium.Color(0.4, 0.8, 1.0, 0.6),
                        trailLength: 0.3,
                        period: 3.0
                    })
                }
            });
        }
    });
})
</script>
<template>
    <Suspense>
        <template #default>
            <div class="cesium-container">
                <div id="cesiumContainer"></div>
                <!-- 修改返回按钮点击事件 -->
                <div v-show="showBackButton" class="back-button" @click="goBack">
                    <span class="back-icon">←</span>
                    <span>返回上一视角</span>
                </div>
                <!-- 修改提示信息，添加与面板同步的类名 -->
                <div class="tip-message" :class="{ 'tip-hidden': !showPanel }">
                    <span class="tip-icon">🔍</span>
                    <span>点击城市查看市级信息</span>
                </div>
                <div class="eco-panel" :class="{ 'panel-hidden': !showPanel }">
                    <div class="panel-header">
                        <h3>环境生态监测面板 ({{ currentCity }})</h3>
                        <div class="header-decoration"></div>
                    </div>
                    <div class="eco-data">
                        <div class="data-item">
                            <div class="data-label">
                                <span class="icon">◈</span>
                                <span>空气质量指数</span>
                            </div>
                            <div class="data-value">
                                <span>{{ ecoData[currentCity].airQuality }}</span>
                                <div class="value-bar" :style="{ '--percent': ecoData[currentCity].airQuality + '%' }">
                                </div>
                            </div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">
                                <span class="icon">◈</span>
                                <span>植被覆盖率</span>
                            </div>
                            <div class="data-value">
                                <span>{{ ecoData[currentCity].vegetation }}%</span>
                                <div class="value-bar" :style="{ '--percent': ecoData[currentCity].vegetation + '%' }">
                                </div>
                            </div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">
                                <span class="icon">◈</span>
                                <span>水质状况</span>
                            </div>
                            <div class="data-value">
                                <span :class="{ 'status-good': ecoData[currentCity].waterQuality === '良好' }">
                                    {{ ecoData[currentCity].waterQuality }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <template #fallback>
            <EcoLoading />
        </template>
    </Suspense>
</template>

<style scoped>
#cesiumContainer {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}

.cesium-container {
    position: relative;
}

.eco-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, rgba(16, 36, 57, 0.95), rgba(0, 0, 0, 0.85));
    color: white;
    padding: 0;
    border-radius: 8px;
    min-width: 280px;
    transform: translateX(0);
    opacity: 1;
    will-change: transform, opacity;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(76, 175, 255, 0.2);
    box-shadow: 0 0 20px rgba(0, 191, 255, 0.1);
}

.panel-header {
    position: relative;
    padding: 15px 20px;
    border-bottom: 1px solid rgba(76, 175, 255, 0.2);
}

.panel-header h3 {
    margin: 0;
    font-size: 16px;
    color: #4CAFFF;
    font-weight: 500;
    letter-spacing: 1px;
}

.header-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg,
            transparent 0%,
            #4CAFFF 50%,
            transparent 100%);
    opacity: 0.6;
}

.eco-data {
    padding: 15px 20px;
}

.data-item {
    display: flex;
    flex-direction: column;
    margin: 12px 0;
    position: relative;
    opacity: 1;
    transform: translateY(0);
    transition: all 0.3s ease-out;
}

.data-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
}

.icon {
    color: #4CAFFF;
    font-size: 12px;
}

.data-value {
    margin-top: 6px;
    padding-left: 20px;
    position: relative;
    height: 24px;
    display: flex;
    align-items: center;
}

.data-value span {
    color: #4CAFFF;
    font-size: 16px;
    font-weight: 500;
    position: relative;
    z-index: 1;
    opacity: 1;
    transform: translateY(0);
    transition: all 0.3s ease-out;
    will-change: transform, opacity;
}

.value-bar {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: calc(var(--percent));
    height: 6px;
    background: linear-gradient(90deg,
            rgba(76, 175, 255, 0.2),
            rgba(76, 175, 255, 0.1));
    border-radius: 3px;
    transform-origin: left center;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.value-bar::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    background: #4CAFFF;
    border-radius: 50%;
    box-shadow: 0 0 10px #4CAFFF;
}

.status-good {
    color: #4CAF50 !important;
    text-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

.panel-hidden {
    transform: translateX(50px);
    opacity: 0;
    pointer-events: none;
}

.panel-hidden .data-item {
    opacity: 0;
    transform: translateY(10px);
}

.panel-hidden .data-item:nth-child(1) {
    transition-delay: 0s;
}

.panel-hidden .data-item:nth-child(2) {
    transition-delay: 0.05s;
}

.panel-hidden .data-item:nth-child(3) {
    transition-delay: 0.1s;
}

@keyframes glow {

    0%,
    100% {
        box-shadow: 0 0 20px rgba(0, 191, 255, 0.1);
    }

    50% {
        box-shadow: 0 0 25px rgba(0, 191, 255, 0.15);
    }
}

.eco-panel {
    animation: glow 6s ease-in-out infinite;
}

.back-button {
    position: absolute;
    top: 20px;
    left: 20px;
    background: linear-gradient(135deg, rgba(16, 36, 57, 0.95), rgba(0, 0, 0, 0.85));
    color: #4CAFFF;
    padding: 10px 15px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(76, 175, 255, 0.2);
    box-shadow: 0 0 20px rgba(0, 191, 255, 0.1);
    font-size: 14px;
    animation: fadeIn 0.3s ease-out;
}

.back-button:hover {
    background: linear-gradient(135deg, rgba(26, 46, 67, 0.95), rgba(10, 10, 10, 0.85));
    transform: translateY(-1px);
    box-shadow: 0 0 25px rgba(0, 191, 255, 0.2);
}

.back-icon {
    font-size: 18px;
    font-weight: bold;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 修改提示信息样式 */
.tip-message {
    position: absolute;
    top: 80px;
    left: 20px;
    background: linear-gradient(135deg, rgba(16, 36, 57, 0.95), rgba(0, 0, 0, 0.85));
    color: #4CAFFF;
    padding: 10px 15px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(76, 175, 255, 0.2);
    box-shadow: 0 0 20px rgba(0, 191, 255, 0.1);
    font-size: 14px;
    transform: translateX(0);
    opacity: 1;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    /* 使用与面板相同的过渡效果 */
    will-change: transform, opacity;
}

/* 提示信息隐藏状态 */
.tip-hidden {
    transform: translateX(-50px);
    opacity: 0;
    pointer-events: none;
}

/* 修改动画效果，使其与面板一致 */
.tip-message,
.eco-panel {
    animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 悬浮效果 */
.tip-message:hover {
    background: linear-gradient(135deg, rgba(26, 46, 67, 0.95), rgba(10, 10, 10, 0.85));
    box-shadow: 0 0 25px rgba(0, 191, 255, 0.2);
}

/* 确保动画关键帧定义一致 */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* 添加发光动画效果 */
.tip-message,
.eco-panel {
    animation: glow 6s ease-in-out infinite;
}
</style>