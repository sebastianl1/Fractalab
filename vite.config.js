import { defineConfig } from 'vite';

export default defineConfig({
  base: '/bifurcation-mandelbrot-explorer/',
  build: {
    outDir: 'docs',
    assetsDir: 'assets',
    sourcemap: false
  }
});
