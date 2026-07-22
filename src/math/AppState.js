import { globalModelRegistry } from './models/ModelRegistry.js';

class AppState {
  constructor() {
    this._listeners = {};
    this._model = globalModelRegistry.getModel('logistic');
    this._r = this._model.defaultR;
    this._lyapunovEnabled = true;
    this._palette = 0;
    this._audioEnabled = false;
  }

  on(event, fn) {
    (this._listeners[event] = this._listeners[event] || []).push(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    const list = this._listeners[event];
    if (list) this._listeners[event] = list.filter(f => f !== fn);
  }

  _emit(event, data) {
    (this._listeners[event] || []).forEach(fn => fn(data));
  }

  get model() { return this._model; }

  set modelId(id) {
    const newModel = globalModelRegistry.setModel(id);
    if (newModel !== this._model) {
      this._model = newModel;
      this._emit('modelChange', this._model);
    }
  }

  get r() { return this._r; }

  set r(val) {
    const clamped = Math.max(this._model.rRange.min, Math.min(this._model.rRange.max, val));
    if (Math.abs(clamped - this._r) > 1e-10) {
      this._r = clamped;
      this._emit('rChange', this._r);
    }
  }

  get c() { return this._model.rToC(this._r); }

  get lyapunovEnabled() { return this._lyapunovEnabled; }

  set lyapunovEnabled(val) {
    this._lyapunovEnabled = val;
    this._emit('lyapunovChange', val);
  }

  get palette() { return this._palette; }

  set palette(val) {
    this._palette = val;
    this._emit('paletteChange', val);
  }

  get audioEnabled() { return this._audioEnabled; }

  set audioEnabled(val) {
    this._audioEnabled = val;
    this._emit('audioChange', val);
  }
}

export const appState = new AppState();
