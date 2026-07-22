export class BifurcationCanvas {
  constructor(canvasElement, onSelectR) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.onSelectR = onSelectR;

    this.model = null;
    this.rRange = { min: 1.0, max: 4.0 };
    this.xRange = { min: 0.0, max: 1.0 };
    this.selectedR = 3.0;

    this.showLyapunov = true;
    this.orbitDensity = 1200;

    this._rafId = null;
    this._dirty = false;
    this._dragging = false;

    this.initEvents();
  }

  _scheduleRender() {
    if (this._rafId) return;
    this._dirty = true;
    this._rafId = requestAnimationFrame(() => {
      this._rafId = null;
      if (this._dirty) {
        this._dirty = false;
        this._render();
      }
    });
  }

  setModel(model) {
    this.model = model;
    this.rRange = { ...model.rRange };
    this.xRange = { ...model.xRange };
    this.selectedR = Math.max(this.rRange.min, Math.min(this.rRange.max, this.selectedR));
    this.render();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.ctx.imageSmoothingEnabled = false;

    this.render();
  }

  setSelectedR(r) {
    if (!this.model) return;
    this.selectedR = Math.max(this.rRange.min, Math.min(this.rRange.max, r));
    this.render();
  }

  setSelectedC(c) {
    if (!this.model) return;
    const r = this.model.cToR(c);
    this.setSelectedR(r);
  }

  toggleLyapunov(show) {
    this.showLyapunov = show;
    this.render();
  }

  rToPixelX(r) {
    return ((r - this.rRange.min) / (this.rRange.max - this.rRange.min)) * this.canvas.width;
  }

  pixelXToR(px) {
    return this.rRange.min + (px / this.canvas.width) * (this.rRange.max - this.rRange.min);
  }

  xToPixelY(x) {
    return (1.0 - (x - this.xRange.min) / (this.xRange.max - this.xRange.min)) * this.canvas.height;
  }

  render() {
    this._scheduleRender();
  }

  _render() {
    if (!this.canvas.width || !this.canvas.height || !this.model) return;

    // Lower orbit points during drag for responsiveness
    const orbitPoints = this._dragging
      ? Math.min(150, this.orbitDensity)
      : Math.min(800, this.orbitDensity);

    const width = this.canvas.width;
    const height = this.canvas.height;

    // Clear background - Deep Space Dark
    this.ctx.fillStyle = '#040714';
    this.ctx.fillRect(0, 0, width, height);

    // Grid lines with high resolution
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    this.ctx.lineWidth = 1;
    const stepR = (this.rRange.max - this.rRange.min) / 6;
    for (let r = this.rRange.min; r <= this.rRange.max; r += stepR) {
      const px = this.rToPixelX(r);
      this.ctx.beginPath();
      this.ctx.moveTo(px, 0);
      this.ctx.lineTo(px, height);
      this.ctx.stroke();
    }

    // Density-based heatmap accumulation
    const density = new Uint16Array(width * height);
    const transient = 300;

    for (let col = 0; col < width; col++) {
      const r = this.pixelXToR(col);
      const orbit = this.model.getOrbit(r, transient, orbitPoints);

      for (let i = 0; i < orbit.length; i++) {
        const py = Math.floor(this.xToPixelY(orbit[i]));
        if (py >= 0 && py < height) {
          density[py * width + col]++;
        }
      }
    }

    const maxDensity = Math.max(1, density.reduce((a, b) => Math.max(a, b), 0));
    const imgData = this.ctx.createImageData(width, height);
    const data = imgData.data;

    for (let i = 0; i < density.length; i++) {
      const d = density[i];
      if (d > 0) {
        const t = Math.min(1, Math.log(1 + d) / Math.log(1 + maxDensity));
        const idx = i * 4;
        if (t < 0.5) {
          const t2 = t * 2;
          data[idx] = Math.floor(t2 * 10);
          data[idx + 1] = Math.floor(t2 * 80);
          data[idx + 2] = Math.floor(40 + t2 * 120);
        } else {
          const t2 = (t - 0.5) * 2;
          data[idx] = Math.floor(t2 * 200);
          data[idx + 1] = Math.floor(80 + t2 * 175);
          data[idx + 2] = Math.floor(160 - t2 * 60);
        }
        data[idx + 3] = 255;
      }
    }

    this.ctx.putImageData(imgData, 0, 0);

    // Draw Lyapunov Exponent Curve (HD smooth vector path)
    if (this.showLyapunov) {
      this.ctx.save();
      this.ctx.beginPath();
      const lyapIterations = this._dragging ? 80 : 400;
      const lyapTransient = this._dragging ? 40 : 120;
      const samples = this._dragging
        ? Math.floor(width * 0.15)
        : Math.floor(width * 0.8);
      let prevPy = null;
      for (let s = 0; s < samples; s++) {
        const px = (s / samples) * width;
        const r = this.pixelXToR(px);
        const lyap = this.model.computeLyapunov(r, lyapIterations, lyapTransient);
        const normLyap = Math.max(0, Math.min(1, (lyap + 2.0) / 3.0));
        const py = (1.0 - normLyap) * height;

        if (prevPy !== null && Math.abs(py - prevPy) > height * 0.3) {
          this.ctx.stroke();
          this.ctx.beginPath();
          this.ctx.moveTo(px, py);
        } else if (s === 0) {
          this.ctx.moveTo(px, py);
        } else {
          this.ctx.lineTo(px, py);
        }
        prevPy = py;
      }
      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.lineWidth = 2.5;
      this.ctx.shadowColor = '#f59e0b';
      this.ctx.shadowBlur = 10;
      this.ctx.stroke();

      const zeroPy = (1.0 - (0 + 2.0) / 3.0) * height;
      this.ctx.beginPath();
      this.ctx.setLineDash([5, 5]);
      this.ctx.moveTo(0, zeroPy);
      this.ctx.lineTo(width, zeroPy);
      this.ctx.strokeStyle = 'rgba(255, 170, 0, 0.4)';
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Selected R Vertical Cursor Line
    const selPx = this.rToPixelX(this.selectedR);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(selPx, 0);
    this.ctx.lineTo(selPx, height);
    this.ctx.strokeStyle = '#f43f5e';
    this.ctx.lineWidth = 3;
    this.ctx.shadowColor = '#f43f5e';
    this.ctx.shadowBlur = 14;
    this.ctx.stroke();

    // Label on vertical cursor
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 12px "JetBrains Mono", monospace';
    this.ctx.fillText(`r = ${this.selectedR.toFixed(4)}`, Math.min(selPx + 8, width - 95), 24);
    this.ctx.restore();
  }

  resetZoom() {
    if (!this.model) return;
    this.rRange = { ...this.model.rRange };
    this.render();
  }

  initEvents() {
    let isDraggingR = false;

    const getClientX = (e) => {
      if (e.touches) return e.touches[0].clientX;
      return e.clientX;
    };

    const startDrag = (clientX) => {
      isDraggingR = true;
      this._dragging = true;
      const rect = this.canvas.getBoundingClientRect();
      const px = (clientX - rect.left) * (this.canvas.width / rect.width);
      const newR = this.pixelXToR(px);
      this.setSelectedR(newR);
      if (this.onSelectR) this.onSelectR(newR);
    };

    const moveDrag = (clientX) => {
      if (!isDraggingR) return;
      const rect = this.canvas.getBoundingClientRect();
      const px = (clientX - rect.left) * (this.canvas.width / rect.width);
      const newR = this.pixelXToR(px);
      this.setSelectedR(newR);
      if (this.onSelectR) this.onSelectR(newR);
    };

    const endDrag = () => {
      isDraggingR = false;
      this._dragging = false;
      this._scheduleRender();
    };

    // Mouse
    this.canvas.addEventListener('mousedown', (e) => startDrag(e.clientX));
    window.addEventListener('mousemove', (e) => moveDrag(e.clientX));
    window.addEventListener('mouseup', endDrag);

    // Touch
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startDrag(e.touches[0].clientX);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!isDraggingR) return;
      e.preventDefault();
      moveDrag(e.touches[0].clientX);
    }, { passive: false });

    window.addEventListener('touchend', endDrag);

    // Scroll/Wheel
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      const mouseR = this.pixelXToR(px);

      const zoom = e.deltaY < 0 ? 0.8 : 1.25;
      const span = (this.rRange.max - this.rRange.min) * zoom;
      const ratio = (mouseR - this.rRange.min) / (this.rRange.max - this.rRange.min);

      const newMin = Math.max(this.model.rRange.min, mouseR - span * ratio);
      const newMax = Math.min(this.model.rRange.max, mouseR + span * (1 - ratio));

      if (newMax - newMin > 0.005) {
        this.rRange.min = newMin;
        this.rRange.max = newMax;
        this.render();
      }
    }, { passive: false });
  }
}
