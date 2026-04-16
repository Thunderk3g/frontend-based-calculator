import { defineConfig } from 'vite';

export default defineConfig({
    base: '/term-plan-compare/goal-assure-compare/',
    server: {
        port: 5174,
        proxy: {
            '/api/fund-details': {
                target: 'https://online.bajajlife.com',
                changeOrigin: true,
                rewrite: (path) => '/OnlineCustomerPortal/ws/Prelogin/azbj_fund_dtls',
                secure: true,
            }
        }
    },
    build: {
        // Shared monorepo dist/ — emptyOutDir MUST stay false so the shell build
        // doesn't wipe this subfolder. Root `pnpm clean` handles wiping dist.
        outDir: '../../../dist/goal-assure-compare',
        emptyOutDir: false,
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
