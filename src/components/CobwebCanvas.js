export class CobwebCanvas {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');

    this.model = null;
    this.r = 3.0;
    this.x0 = 0.4;
    this.maxSteps = 60;
    this.animatingStep = 60;

    this._rafId = null;
    this._dirty = false;

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
    this.render();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.ctx.imageSmoothingEnabled = true;

    this.render();
  }

  setR(r) {
    this.r = r;
    this.render();
  }

  setX0(x0) {
    this.x0 = Math.max(0.01, Math.min(0.99, x0));
    this.render();
  }

  render() {
    this._scheduleRender();
  }

  _render() {
    if (!this.canvas.width || !this.canvas.height || !this.model) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const dpr = Math.max(window.devicePixelRatio || 1, 2);

    const margin = Math.min(width, height) * 0.1;
    const size = Math.min(width, height) - margin * 2;
    const startX = (width - size) / 2;
    const startY = height - (height - size) / 2;

    const xMin = this.model.xRange.min;
    const xMax = this.model.xRange.max;
    const xSpan = xMax - xMin;

    const mapX = (val) => startX + ((val - xMin) / xSpan) * size;
    const mapY = (val) => startY - ((val - xMin) / xSpan) * size;

    // Clear background
    this.ctx.fillStyle = '#040714';
    this.ctx.fillRect(0, 0, width, height);

    // Draw Axes & Border
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.lineWidth = 1.5 * dpr;
    this.ctx.strokeRect(startX, startY - size, size, size);

    // Draw Identity Line y = x
    this.ctx.beginPath();
    this.ctx.moveTo(mapX(xMin), mapY(xMin));
    this.ctx.lineTo(mapX(xMax), mapY(xMax));
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    this.ctx.lineWidth = 1.5 * dpr;
    this.ctx.setLineDash([5 * dpr, 5 * dpr]);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Draw Curve y = f(x)
    this.ctx.beginPath();
    const resolution = 300;
    for (let i = 0; i <= resolution; i++) {
      const x = xMin + (i / resolution) * xSpan;
      const y = this.model.next(x, this.r);
      const px = mapX(x);
      const py = mapY(y);
      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }
    this.ctx.strokeStyle = '#8b5cf6';
    this.ctx.lineWidth = 3 * dpr;
    this.ctx.shadowColor = '#8b5cf6';
    this.ctx.shadowBlur = 10 * dpr;
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    // Draw Cobweb Staircase Trajectory
    let currX = xMin + (xSpan * 0.4);
    this.ctx.beginPath();
    this.ctx.moveTo(mapX(currX), mapY(xMin));

    for (let step = 0; step < this.animatingStep; step++) {
      const nextY = this.model.next(currX, this.r);
      this.ctx.lineTo(mapX(currX), mapY(nextY));
      this.ctx.lineTo(mapX(nextY), mapY(nextY));

      currX = nextY;
    }

    this.ctx.strokeStyle = '#f43f5e';
    this.ctx.lineWidth = 2 * dpr;
    this.ctx.shadowColor = '#f43f5e';
    this.ctx.shadowBlur = 8 * dpr;
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    // Text details
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `${Math.floor(12 * dpr)}px "JetBrains Mono", monospace`;
    this.ctx.fillText(`${this.model.name} | r = ${this.r.toFixed(4)}`, startX + 10 * dpr, startY - size + 24 * dpr);
  }

  initEvents() {
    let draggingX0 = false;

    const getClientX = (e) => e.touches ? e.touches[0].clientX : e.clientX;

    const startDrag = (e) => {
      draggingX0 = true;
      this.updateX0FromEventCoords(getClientX(e));
    };

    const moveDrag = (e) => {
      if (draggingX0) this.updateX0FromEventCoords(getClientX(e));
    };

    const endDrag = () => {
      draggingX0 = false;
    };

    this.canvas.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup', endDrag);

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startDrag(e);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!draggingX0) return;
      e.preventDefault();
      moveDrag(e);
    }, { passive: false });

    window.addEventListener('touchend', endDrag);
  }

  updateX0FromEventCoords(clientX) {
    if (!this.model) return;
    const rect = this.canvas.getBoundingClientRect();
    const width = this.canvas.width;
    const height = this.canvas.height;
    const margin = Math.min(width, height) * 0.1;
    const size = Math.min(width, height) - margin * 2;
    const startX = (width - size) / 2;

    const px = (clientX - rect.left) * (this.canvas.width / rect.width);
    const xSpan = this.model.xRange.max - this.model.xRange.min;
    const newX0 = this.model.xRange.min + ((px - startX) / size) * xSpan;
    this.setX0(newX0);
  }

  updateX0FromEvent(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    this.updateX0FromEventCoords(clientX);
  }
}
