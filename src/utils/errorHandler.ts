export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCount: Map<string, number> = new Map();
  private readonly MAX_RETRIES = 3;
  private readonly RESET_INTERVAL = 5 * 60 * 1000; // 5分钟

  private constructor() {
    // 定期重置错误计数
    setInterval(() => this.resetErrorCounts(), this.RESET_INTERVAL);
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  async handleFetch(url: string, options?: RequestInit): Promise<Response> {
    const errorCount = this.errorCount.get(url) || 0;

    if (errorCount >= this.MAX_RETRIES) {
      console.warn(`Request to ${url} has failed too many times. Waiting for reset.`);
      return Promise.reject(new Error('Too many failed attempts'));
    }

    try {
      const response = await fetch(url, {
        ...options,
        // 添加超时处理
        signal: options?.signal || AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 成功后重置该URL的错误计数
      this.errorCount.set(url, 0);
      return response;

    } catch (error) {
      this.errorCount.set(url, errorCount + 1);
      console.error(`Fetch error for ${url}:`, error);
      throw error;
    }
  }

  handleWorkerError(error: any) {
    console.error('Worker error:', error);
    // 这里可以添加错误上报逻辑
  }

  private resetErrorCounts() {
    this.errorCount.clear();
  }
}

// 创建一个全局的错误处理函数
export function setupGlobalErrorHandling() {
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Unhandled promise rejection:', event.reason);
    // 防止错误显示在控制台
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // 防止错误显示在控制台
    event.preventDefault();
  });
}