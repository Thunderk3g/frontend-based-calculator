import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    build: {
        outDir: '../web-dist',
        emptyOutDir: true,
        assetsDir: '',
        rollupOptions: {
            output: {
                entryFileNames: '[name]-[hash].js',
                chunkFileNames: '[name]-[hash].js',
                assetFileNames: '[name]-[hash].[ext]'
            }
        }
    }
});
