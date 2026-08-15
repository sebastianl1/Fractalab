/**
 * Pure CPU Mandelbrot computation used by the WebGL-fallback renderer.
 * Runs on the main thread synchronously or inside a Web Worker.
 */

export interface MandelbrotComputeRequest {
  id: number;
  centerX: number;
  centerY: number;
  zoom: number;
  maxIter: number;
  width: number;
  height: number;
  palette: number;
  /** Pixel stride (1 = full res, 2 = half res during drag). */
  step: number;
}

export interface MandelbrotComputeResult {
  id: number;
  data: Uint8ClampedArray;
  width: number;
  height: number;
  step: number;
}

/**
 * Mirrors the WebGL fragment-shader palettes so the CPU fallback produces
 * identical colors. Palettes follow the "Observatorio Espacial" identity.
 */
function shade(smooth: number, maxIter: number, palette: number): [number, number, number] {
  if (smooth >= maxIter) return [6, 8, 13];
  const t = smooth / maxIter;
  const cycle = (smooth * 0.08) % 1;

  // Solar — amber → gold → deep orange
  if (palette === 0) {
    const r = 1.0;
    const g = 0.45 + 0.35 * t;
    const b = 0.05 + 0.25 * t * t;
    return [r * 255, g * 255, b * 255];
  }
  // Nebulosa — cyan → violet
  if (palette === 1) {
    const x = 6.28318 * cycle;
    const r = 0.5 + 0.5 * Math.cos(x + 0.6);
    const g = 0.5 + 0.5 * Math.cos(x + 0.7);
    const b = 0.5 + 0.5 * Math.cos(x + 0.9);
    return [r * 255, g * 255, b * 255];
  }
  // Espectro — warm white → rose → amber
  if (palette === 2) {
    const x = 6.28318 * cycle;
    const r = 0.75 + 0.25 * Math.cos(x);
    const g = 0.5 + 0.3 * Math.cos(x + 1.2);
    const b = 0.4 + 0.25 * Math.cos(x + 2.4);
    return [r * 255, g * 255, b * 255];
  }
  // Atlas — teal → deep blue (light-friendly)
  const r = 0.15 + 0.5 * Math.pow(t, 2.0);
  const g = 0.4 + 0.45 * Math.pow(t, 0.8);
  const b = 0.7 + 0.3 * Math.pow(t, 0.5);
  return [r * 255, g * 255, b * 255];
}

export function computeMandelbrot(req: MandelbrotComputeRequest): MandelbrotComputeResult {
  const { centerX, centerY, zoom, maxIter, width, height, palette, step } = req;
  const w2 = Math.ceil(width / step);
  const h2 = Math.ceil(height / step);
  const data = new Uint8ClampedArray(w2 * h2 * 4);

  const aspect = width / height;
  const minX = centerX - zoom * 0.5 * aspect;
  const maxY = centerY + zoom * 0.5;
  const dx = (zoom * aspect) / width;
  const dy = zoom / height;

  for (let py = 0; py < h2; py++) {
    const ci = maxY - py * step * dy;
    const rowOffset = py * w2 * 4;
    for (let px = 0; px < w2; px++) {
      const cr = minX + px * step * dx;
      let zr = 0;
      let zi = 0;
      let zr2 = 0;
      let zi2 = 0;
      let n = 0;
      while (zr2 + zi2 <= 4 && n < maxIter) {
        zi = 2 * zr * zi + ci;
        zr = zr2 - zi2 + cr;
        zr2 = zr * zr;
        zi2 = zi * zi;
        n++;
      }

      const idx = rowOffset + px * 4;
      let r: number;
      let g: number;
      let b: number;
      if (n >= maxIter) {
        r = 10;
        g = 14;
        b = 26;
      } else {
        const logZn = Math.log(zr2 + zi2) / 2;
        const nu = Math.log(logZn / Math.LN2) / Math.LN2;
        const smooth = n + 1 - nu;
        [r, g, b] = shade(smooth, maxIter, palette);
      }
      data[idx] = Math.min(255, r);
      data[idx + 1] = Math.min(255, g);
      data[idx + 2] = Math.min(255, b);
      data[idx + 3] = 255;
    }
  }

  return { id: req.id, data, width: w2, height: h2, step };
}
