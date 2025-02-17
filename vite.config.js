import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import cesium from "vite-plugin-cesium";
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
import { splitVendorChunkPlugin } from 'vite';
import { resolve } from 'path';
export default defineConfig({
    plugins: [
        vue(),
        cesium(),
        splitVendorChunkPlugin(),
        compression({
            // gzip 压缩
            verbose: true,
            disable: false,
            threshold: 10240,
            algorithm: 'gzip',
        }),
        // 构建完成后生成包分析报告
        visualizer({
            filename: 'dist/stats.html',
            open: false,
            gzipSize: true,
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    base: "./",
    build: {
        // 启用 CSS 代码分割
        cssCodeSplit: true,
        // 构建后的文件目录
        outDir: 'dist',
        // 启用 source map
        sourcemap: false,
        // 启用压缩
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true, // 移除 console
                drop_debugger: true, // 移除 debugger
            },
        },
        // 分块策略
        rollupOptions: {
            output: {
                // 分包策略
                manualChunks: {
                    'vue-chunk': ['vue'],
                    'lodash-chunk': ['lodash-es'],
                },
                // 用于从入口点创建的块的打包输出格式
                chunkFileNames: 'assets/js/[name]-[hash].js',
                // 用于输出静态资源的命名
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
                // 拆分 js 到模块文件夹
                entryFileNames: 'assets/js/[name]-[hash].js',
            },
            input: {
                main: resolve(__dirname, 'index.html'),
            },
        },
        // 设置块大小警告的限制
        chunkSizeWarningLimit: 2000,
    },
    optimizeDeps: {
        // 预构建分析的入口点
        entries: ['./src/main.ts'],
        // 预构建中强制排除的依赖项
        exclude: [],
    },
    server: {
        // 开发服务器配置
        port: 5173,
        host: true,
        open: true,
        cors: true,
        // 代理配置
        proxy: {
            '/api': {
                target: 'your-api-url',
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api/, ''); },
            },
        },
    },
});
