/**
 * Mathematical engine for Mandelbrot Set rendering and real-axis slicing.
 */

export class MandelbrotEngine {
  constructor() {
    this.maxIterations = 250;
  }

  /**
   * Calculates the iteration count and smooth potential for complex number c = cr + ci*i.
   * z_{n+1} = z_n^2 + c
   */
  calcPoint(cr, ci, maxIter = this.maxIterations) {
    let zr = 0.0;
    let zi = 0.0;
    let zr2 = 0.0;
    let zi2 = 0.0;

    let n = 0;
    while (zr2 + zi2 <= 4.0 && n < maxIter) {
      zi = 2.0 * zr * zi + ci;
      zr = zr2 - zi2 + cr;
      zr2 = zr * zr;
      zi2 = zi * zi;
      n++;
    }

    if (n === maxIter) {
      return { iter: maxIter, smooth: maxIter, inside: true };
    }

    // Smooth continuous potential function coloring
    const log_zn = Math.log(zr2 + zi2) / 2.0;
    const nu = Math.log(log_zn / Math.LN2) / Math.LN2;
    const smooth = n + 1.0 - nu;

    return { iter: n, smooth: Math.max(0, smooth), inside: false };
  }

  /**
   * Generates RGBA color from smooth iteration value.
   * Palettes: 0: Electric Cyan/Magenta, 1: Golden Chaos, 2: Deep Cosmic, 3: Fire
   */
  getColor(smooth, maxIter, paletteIndex = 0) {
    if (smooth >= maxIter) {
      return [10, 14, 26, 255]; // Deep dark space background for interior
    }

    const t = smooth / maxIter;
    const cycle = (smooth * 0.08) % 1.0;

    let r = 0, g = 0, b = 0;

    switch (paletteIndex) {
      case 0: // Neon Cyberpunk (Cyan - Purple - Pink - Gold)
        r = Math.floor(Math.sin(cycle * Math.PI * 2) * 127 + 128);
        g = Math.floor(Math.sin((cycle + 0.33) * Math.PI * 2) * 127 + 128);
        b = Math.floor(Math.sin((cycle + 0.66) * Math.PI * 2) * 127 + 128);
        break;

      case 1: // Golden Amber / Fire
        r = Math.floor(Math.min(255, Math.pow(t, 0.5) * 255 * 1.2));
        g = Math.floor(Math.min(255, Math.pow(t, 1.2) * 200));
        b = Math.floor(Math.min(255, Math.pow(t, 2.5) * 255));
        break;

      case 2: // Cosmic Nebula (Blue, Violet, Emerald)
        r = Math.floor(Math.sin(cycle * Math.PI) * 180 + 20);
        g = Math.floor(Math.cos(cycle * Math.PI * 0.5) * 220 + 35);
        b = Math.floor(Math.sin(cycle * Math.PI * 1.5) * 230 + 25);
        break;

      default: // Electric Blue
        r = Math.floor(Math.pow(t, 2) * 80);
        g = Math.floor(Math.pow(t, 0.7) * 220);
        b = Math.floor(Math.pow(t, 0.4) * 255);
        break;
    }

    return [r, g, b, 255];
  }
}
