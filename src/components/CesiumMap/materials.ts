// 优化材质定义，使用缓存
const materialCache = new Map();

export function getPolylineTrailMaterial(options) {
    const key = JSON.stringify(options);
    if (materialCache.has(key)) {
        return materialCache.get(key);
    }

    const material = new PolylineTrailMaterialProperty(options);
    materialCache.set(key, material);
    return material;
}