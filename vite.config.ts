import { defineConfig } from 'vite';
// Project Pages nằm dưới tên repo; dùng cùng base ở dev, preview và production để bắt lỗi đường dẫn sớm.
export default defineConfig({ base: '/EVENTIDE/', build: { rollupOptions: { output: { manualChunks: { phaser: ['phaser'] } } } } });
