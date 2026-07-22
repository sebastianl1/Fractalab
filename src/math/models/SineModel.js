import { ModelInterface } from './ModelInterface.js';

export class SineModel extends ModelInterface {
  constructor() {
    super();
    this.id = 'sine';
    this.name = 'Mapa Seno';
    this.equationLatex = 'x_{n+1} = r \\cdot \\sin(\\pi \\cdot x_n)';
    this.derivativeLatex = "f'(x) = r \\cdot \\pi \\cdot \\cos(\\pi \\cdot x_n)";
    this.defaultR = 0.85;
    this.rRange = { min: 0.1, max: 1.0 };
    this.xRange = { min: 0.0, max: 1.0 };
  }

  next(x, r) {
    return r * Math.sin(Math.PI * x);
  }

  derivative(x, r) {
    return r * Math.PI * Math.cos(Math.PI * x);
  }

  rToC(r) {
    // Isomorphic parameter mapping to real axis Mandelbrot slice [-2, 0.25]
    // Maps r in [0.1, 1.0] -> c in [0.25, -2.0]
    return 0.25 - (r - 0.1) * (2.25 / 0.9);
  }

  cToR(c) {
    const norm = (0.25 - c) / 2.25;
    return Math.max(0.1, Math.min(1.0, 0.1 + norm * 0.9));
  }
}
