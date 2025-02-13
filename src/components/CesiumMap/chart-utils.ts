import * as Cesium from 'cesium';

// 基础图表创建函数
export function create3DChart(positions: Cesium.Cartesian3[]): Cesium.Entity {
    return new Cesium.Entity({
        position: positions[0],
        cylinder: {
            length: 500,
            topRadius: 25000,
            bottomRadius: 25000,
            material: new Cesium.ColorMaterialProperty(
                new Cesium.Color(0.2, 0.6, 1.0, 0.2)
            )
        }
    });
}

// 创建柱状图列
export function createChartColumns(positions: Cesium.Cartesian3[][]): Cesium.Entity {
    const entities = positions.map(posArray => new Cesium.Entity({
        position: posArray[0],
        cylinder: {
            length: Cesium.Cartographic.fromCartesian(posArray[0]).height,
            topRadius: 5000,
            bottomRadius: 5000,
            material: new Cesium.ColorMaterialProperty(
                new Cesium.Color(0.4, 0.8, 1.0, 0.8)
            )
        }
    }));

    return entities[0]; // 返回第一个实体作为主实体
}

// 创建标签
export function createChartLabels(labels: { position: Cesium.Cartesian3; text: string }[]): Cesium.Entity {
    const entities = labels.map(label => new Cesium.Entity({
        position: label.position,
        label: {
            text: label.text,
            font: '14px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -10)
        }
    }));

    return entities[0]; // 返回第一个实体作为主实体
}