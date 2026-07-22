import { LogisticModel } from './LogisticModel.js';
import { SineModel } from './SineModel.js';
import { QuadraticModel } from './QuadraticModel.js';
import { ExponentialModel } from './ExponentialModel.js';
import { PolynomialModel } from './PolynomialModel.js';

export class ModelRegistry {
  constructor() {
    this.models = {
      logistic: new LogisticModel(),
      sine: new SineModel(),
      quadratic: new QuadraticModel(),
      exponential: new ExponentialModel(),
      polynomial: new PolynomialModel(3)
    };
    this.currentModelId = 'logistic';
  }

  getModel(id = this.currentModelId) {
    return this.models[id] || this.models.logistic;
  }

  setModel(id) {
    if (this.models[id]) {
      this.currentModelId = id;
    }
    return this.getModel();
  }

  setPolynomialK(k) {
    if (this.models.polynomial) {
      this.models.polynomial.updateK(k);
    }
  }
}

export const globalModelRegistry = new ModelRegistry();
