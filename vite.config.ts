import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import cesium from "vite-plugin-cesium";

export default defineConfig({
  plugins: [vue(), cesium()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "./", // 设置构建输出目录为项目根目录
    // emptyOutDir: true, // 清空输出目录
    rollupOptions: {
      output: {
        manualChunks: undefined, // 取消默认的代码分割
      },
    },
  },
});
