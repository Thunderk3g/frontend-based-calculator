import { defineConfig } from 'vite';

export default defineConfig({
    base: '/term-plan-compare/',
    server: {
        port: 5173,
        proxy: {
            '/term-plan-compare/goal-assure-compare': {
                target: 'http://localhost:5174',
                changeOrigin: true
            }
        }
    },
    build: {
        outDir: '../../../dist',
        emptyOutDir: false,
        assetsDir: '', // Flatten the structure
        rollupOptions: {
            output: {
                entryFileNames: '[name]-[hash].js',
                chunkFileNames: '[name]-[hash].js',
                assetFileNames: '[name]-[hash].[ext]'
            }
        }
    }
});
