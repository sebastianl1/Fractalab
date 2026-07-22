import { BIFURCATION_MILESTONES } from '../math/feigenbaum.js';

export class InspectorPanel {
  constructor(panelElement) {
    this.container = panelElement;
    this.model = null;
  }

  setModel(model) {
    this.model = model;
  }

  update(r) {
    if (!this.model) return;
    const c = this.model.rToC(r);
    const lyapunov = this.model.computeLyapunov(r, 500, 150);

    let stateBadge = '';
    let stateColor = '';

    if (lyapunov > 0.05) {
      stateBadge = 'DETERMINISTIC CHAOS 🌀';
      stateColor = '#f43f5e';
    } else if (Math.abs(lyapunov) <= 0.05) {
      stateBadge = 'CRITICAL BIFURCATION ⚡';
      stateColor = '#f59e0b';
    } else {
      stateBadge = 'STABLE ATTRACTOR 🟢';
      stateColor = '#06b6d4';
    }

    // Find closest milestone
    let closest = BIFURCATION_MILESTONES[0];
    let minDiff = Infinity;
    for (const milestone of BIFURCATION_MILESTONES) {
      const diff = Math.abs(milestone.r - r);
      if (diff < minDiff) {
        minDiff = diff;
        closest = milestone;
      }
    }

    this.container.innerHTML = `
      <div class="inspector-card">
        <div class="state-header" style="border-left-color: ${stateColor}">
          <span class="state-title">${stateBadge}</span>
          <span class="state-r">r = ${r.toFixed(5)}</span>
        </div>

        <div class="metrics-grid">
          <div class="metric-item">
            <span class="metric-label">Parámetro Mandelbrot (c)</span>
            <span class="metric-value font-mono">${c.toFixed(5)}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Exponente de Lyapunov (λ)</span>
            <span class="metric-value font-mono" style="color: ${lyapunov > 0 ? '#f43f5e' : '#06b6d4'}">
              ${lyapunov.toFixed(4)}
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Modelo Activo</span>
            <span class="metric-value font-mono text-xs">${this.model.name}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Conversión Isomórfica</span>
            <span class="metric-value font-mono text-xs">c = (2r - r²)/4</span>
          </div>
        </div>

        <div class="milestone-box">
          <div class="milestone-title">📍 Hito de Feigenbaum / Estabilidad: <strong>${closest.name}</strong></div>
          <div class="milestone-desc">${closest.description}</div>
        </div>
      </div>
    `;
  }
}
