import { ModelInterface } from './ModelInterface.js';

export class PolynomialModel extends ModelInterface {
  constructor(k = 3) {
    super();
    this.id = 'polynomial';
    this.k = k;
    this.updateK(k);
  }

  updateK(k) {
    this.k = Math.max(1, Math.min(6, k));
    this.name = `Polinómico (k = ${this.k})`;
    this.equationLatex = `x_{n+1} = r \\cdot x_n \\cdot (1 - x_n^{${this.k}})`;
    this.derivativeLatex = `f'(x) = r \\cdot (1 - ${this.k + 1} \\cdot x_n^{${this.k}})`;
    this.defaultR = 2.6;
    this.rRange = { min: 1.0, max: 3.5 };
    this.xRange = { min: 0.0, max: 1.0 };
  }

  next(x, r) {
    return r * x * (1 - Math.pow(x, this.k));
  }

  derivative(x, r) {
    return r * (1 - (this.k + 1) * Math.pow(x, this.k));
  }

  rToC(r) {
    const norm = (r - this.rRange.min) / (this.rRange.max - this.rRange.min);
    return 0.25 - norm * 2.25;
  }

  cToR(c) {
    const norm = (0.25 - c) / 2.25;
    return this.rRange.min + norm * (this.rRange.max - this.rRange.min);
  }
}
