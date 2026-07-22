import { ModelInterface } from './ModelInterface.js';

export class ExponentialModel extends ModelInterface {
  constructor() {
    super();
    this.id = 'exponential';
    this.name = 'Mapa Exponencial';
    this.equationLatex = 'x_{n+1} = r \\cdot e^{-x_n}';
    this.derivativeLatex = "f'(x) = -r \\cdot e^{-x_n}";
    this.defaultR = 5.0;
    this.rRange = { min: 0.1, max: 15.0 };
    this.xRange = { min: 0.0, max: 10.0 };
  }

  next(x, r) {
    return r * Math.exp(-x);
  }

  derivative(x, r) {
    return -r * Math.exp(-x);
  }

  rToC(r) {
    return 0.25 - (r - 0.1) * (2.25 / 14.9);
  }

  cToR(c) {
    const norm = (0.25 - c) / 2.25;
    return Math.max(0.1, Math.min(15.0, 0.1 + norm * 14.9));
  }
}
