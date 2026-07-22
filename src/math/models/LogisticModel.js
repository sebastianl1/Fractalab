import { ModelInterface } from './ModelInterface.js';

export class LogisticModel extends ModelInterface {
  constructor() {
    super();
    this.id = 'logistic';
    this.name = 'Mapa Logístico';
    this.equationLatex = 'x_{n+1} = r \\cdot x_n \\cdot (1 - x_n)';
    this.derivativeLatex = "f'(x) = r \\cdot (1 - 2x)";
    this.defaultR = 3.0;
    this.rRange = { min: 1.0, max: 4.0 };
    this.xRange = { min: 0.0, max: 1.0 };
  }

  next(x, r) {
    return r * x * (1 - x);
  }

  derivative(x, r) {
    return r * (1 - 2 * x);
  }

  rToC(r) {
    return (2 * r - r * r) / 4;
  }

  cToR(c) {
    if (c > 0.25) return 1.0;
    return 1 + Math.sqrt(1 - 4 * c);
  }
}
