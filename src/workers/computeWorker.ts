// 定义 Worker 错误类型
interface WorkerError extends ErrorEvent {
  message: string;
  filename: string;
  lineno: number;
  colno: number;
}

// 处理坐标转换和数据计算的 Worker
self.onerror = ((event: ErrorEvent) => {
  const workerError = event as unknown as WorkerError;
  self.postMessage({
    type: 'error',
    error: {
      message: workerError.message || 'Unknown error',
      filename: workerError.filename || '',
      lineno: workerError.lineno || 0,
      colno: workerError.colno || 0
    }
  });
}) as OnErrorEventHandler;

self.onmessage = (e) => {
  try {
    const { type, data } = e.data;

    switch (type) {
      case 'computePositions':
        const positions = computeCartesianPositions(data);
        self.postMessage({ type: 'positions', data: positions });
        break;

      case 'processTerrainData':
        const processedData = processTerrainData(data);
        self.postMessage({ type: 'terrain', data: processedData });
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

function computeCartesianPositions(data: any) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format for position computation');
  }

  const { longitude, latitude, height } = data;
  // 坐标转换计算
  return {
    x: longitude,
    y: latitude,
    z: height ?? 0
  };
}

function processTerrainData(data: any) {
  if (!data) {
    throw new Error('No terrain data provided');
  }
  return data;
}

// 确保 TypeScript 知道这是一个 Worker 文件
export {};