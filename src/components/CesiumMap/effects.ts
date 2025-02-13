// 优化实体创建
export function create3DChart(viewer: Cesium.Viewer, options: ChartOptions) {
    // 使用实体批量创建
    const entities = [];

    // 预计算位置
    const positions = computePositions(options);

    // 批量创建实体
    entities.push(
        createChartBase(positions.base),
        createChartColumns(positions.columns),
        createChartLabels(positions.labels)
    );

    // 批量添加实体
    viewer.entities.add(entities);

    // 返回清理函数
    return () => {
        entities.forEach(entity => viewer.entities.remove(entity));
    };
}