import { defineConfig } from 'vite';

export default defineConfig({
  base: '/bifurcation-mandelbrot-explorer/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
