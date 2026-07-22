import { ModelInterface } from './ModelInterface.js';

export class QuadraticModel extends ModelInterface {
  constructor() {
    super();
    this.id = 'quadratic';
    this.name = 'Mapa Cuadrático';
    this.equationLatex = 'x_{n+1} = r - x_n^2';
    this.derivativeLatex = "f'(x) = -2 \\cdot x_n";
    this.defaultR = 1.25;
    this.rRange = { min: -0.25, max: 2.0 };
    this.xRange = { min: -2.0, max: 2.0 };
  }

  next(x, r) {
    return r - x * x;
  }

  derivative(x, r) {
    return -2 * x;
  }

  rToC(r) {
    return -r;
  }

  cToR(c) {
    return -c;
  }
}
