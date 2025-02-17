export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 0;

  static getInstance() {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  start() {
    const update = () => {
      this.frameCount++;
      const currentTime = performance.now();

      if (currentTime - this.lastTime >= 1000) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.lastTime = currentTime;

        // 如果 FPS 过低，可以触发优化措施
        if (this.fps < 30) {
          this.optimizePerformance();
        }
      }

      requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }

  private optimizePerformance() {
    // 实现动态优化逻辑
    // 例如：降低地形细节、减少实体数量等
  }
}