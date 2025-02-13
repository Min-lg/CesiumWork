import * as Cesium from 'cesium';

interface TrailMaterialOptions {
  color: Cesium.Color;
  trailLength: number;
  period: number;
}

const materialCache = new Map<string, Cesium.Material>();

export function getPolylineTrailMaterial(options: TrailMaterialOptions) {
  const key = JSON.stringify(options);
  if (materialCache.has(key)) {
    return materialCache.get(key);
  }

  const material = new Cesium.Material({
    fabric: {
      type: 'Color',
      uniforms: {
        color: new Cesium.Color(1.0, 1.0, 1.0, 1.0)
      }
    }
  });

  materialCache.set(key, material);
  return material;
}