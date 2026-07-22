/**
 * Base Interface / Template for Mathematical Bifurcation Models.
 */
export class ModelInterface {
  constructor() {
    this.id = 'base';
    this.name = 'Base Model';
    this.equationLatex = 'x_{n+1} = f(x_n)';
    this.derivativeLatex = "f'(x) = 0";
    this.defaultR = 3.0;
    this.rRange = { min: 1.0, max: 4.0 };
    this.xRange = { min: 0.0, max: 1.0 };
  }

  // Calculate next x_{n+1} given x_n and parameter r
  next(x, r) {
    return x;
  }

  // Derivative f'(x) for Lyapunov Exponent calculation
  derivative(x, r) {
    return 1.0;
  }

  // Convert r to Mandelbrot equivalent c
  rToC(r) {
    return (2 * r - r * r) / 4;
  }

  // Convert Mandelbrot equivalent c to r
  cToR(c) {
    if (c > 0.25) return this.rRange.min;
    return 1 + Math.sqrt(1 - 4 * c);
  }

  // Get orbit array for a parameter r
  getOrbit(r, transient = 300, points = 200, x0 = 0.5) {
    let x = x0;
    for (let i = 0; i < transient; i++) {
      x = this.next(x, r);
    }
    const orbit = new Float64Array(points);
    for (let i = 0; i < points; i++) {
      x = this.next(x, r);
      orbit[i] = x;
    }
    return orbit;
  }

  // Compute Lyapunov exponent lambda
  computeLyapunov(r, iterations = 600, transient = 200, x0 = 0.5) {
    let x = x0;
    for (let i = 0; i < transient; i++) {
      x = this.next(x, r);
    }
    let sum = 0;
    let count = 0;
    for (let i = 0; i < iterations; i++) {
      x = this.next(x, r);
      const deriv = Math.abs(this.derivative(x, r));
      if (deriv > 1e-12) {
        sum += Math.log(deriv);
        count++;
      }
    }
    return count > 0 ? sum / count : 0;
  }
}
