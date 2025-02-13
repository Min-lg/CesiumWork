import * as Cesium from 'cesium';
import { create3DChart as createChartBase, createChartColumns, createChartLabels } from './chart-utils';

interface ChartOptions {
  position: {
    lon: number;
    lat: number;
  };
  data: {
    airQuality: number;
    vegetation: number;
  };
}

interface ChartPositions {
  base: Cesium.Cartesian3[];
  columns: Cesium.Cartesian3[][];
  labels: { position: Cesium.Cartesian3; text: string }[];
}

function computePositions(options: ChartOptions): ChartPositions {
  const { lon, lat } = options.position;
  const { airQuality, vegetation } = options.data;

  return {
    base: [Cesium.Cartesian3.fromDegrees(lon, lat, 0)],
    columns: [
      [Cesium.Cartesian3.fromDegrees(lon, lat, airQuality * 1000)],
      [Cesium.Cartesian3.fromDegrees(lon + 0.1, lat, vegetation * 1000)]
    ],
    labels: [
      {
        position: Cesium.Cartesian3.fromDegrees(lon, lat, airQuality * 1000 + 5000),
        text: `空气质量: ${airQuality}`
      },
      {
        position: Cesium.Cartesian3.fromDegrees(lon + 0.1, lat, vegetation * 1000 + 5000),
        text: `植被覆盖: ${vegetation}%`
      }
    ]
  };
}

// 优化实体创建
export function create3DChart(viewer: Cesium.Viewer, options: ChartOptions) {
    // 使用实体批量创建
    const entities: Cesium.Entity[] = [];

    // 预计算位置
    const positions = computePositions(options);

    // 批量创建实体
    entities.push(
        createChartBase(positions.base),
        createChartColumns(positions.columns),
        createChartLabels(positions.labels)
    );

    // 批量添加实体
    entities.forEach(entity => {
        viewer.entities.add(entity);
    });

    // 返回清理函数
    return () => {
        entities.forEach(entity => viewer.entities.remove(entity));
    };
}