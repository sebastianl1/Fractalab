import { MandelbrotEngine } from '../math/mandelbrot.js';

export class MandelbrotCanvas {
  constructor(canvasElement, onSelectC) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.engine = new MandelbrotEngine();
    this.onSelectC = onSelectC;

    this.model = null;

    // Viewport coordinates in complex plane
    this.view = {
      centerX: -0.75,
      centerY: 0.0,
      width: 3.2,
      height: 2.4
    };

    this.selectedC = -0.75;
    this.palette = 0;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };

    this.initEvents();
  }

  setModel(model) {
    this.model = model;
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.ctx.imageSmoothingEnabled = false;

    // Maintain aspect ratio
    const aspect = this.canvas.width / this.canvas.height;
    this.view.height = this.view.width / aspect;

    this.render();
  }

  setSelectedR(r) {
    if (this.model) {
      this.selectedC = this.model.rToC(r);
    } else {
      this.selectedC = (2 * r - r * r) / 4;
    }
    this.renderOverlay();
  }

  setSelectedC(c) {
    this.selectedC = c;
    this.renderOverlay();
  }

  setPalette(index) {
    this.palette = index;
    this.render();
  }

  // Convert canvas pixel (px, py) to complex plane (cr, ci)
  pixelToComplex(px, py) {
    const minX = this.view.centerX - this.view.width / 2;
    const maxY = this.view.centerY + this.view.height / 2;

    const cr = minX + (px / this.canvas.width) * this.view.width;
    const ci = maxY - (py / this.canvas.height) * this.view.height;
    return { cr, ci };
  }

  // Convert complex plane (cr, ci) to canvas pixel (px, py)
  complexToPixel(cr, ci) {
    const minX = this.view.centerX - this.view.width / 2;
    const maxY = this.view.centerY + this.view.height / 2;

    const px = ((cr - minX) / this.view.width) * this.canvas.width;
    const py = ((maxY - ci) / this.view.height) * this.canvas.height;
    return { px, py };
  }

  render() {
    if (!this.canvas.width || !this.canvas.height) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const imgData = this.ctx.createImageData(width, height);
    const data = imgData.data;

    const minX = this.view.centerX - this.view.width / 2;
    const maxY = this.view.centerY + this.view.height / 2;
    const dx = this.view.width / width;
    const dy = this.view.height / height;

    for (let py = 0; py < height; py++) {
      const ci = maxY - py * dy;
      const rowOffset = py * width * 4;

      for (let px = 0; px < width; px++) {
        const cr = minX + px * dx;
        const result = this.engine.calcPoint(cr, ci);
        const [r, g, b, a] = this.engine.getColor(result.smooth, this.engine.maxIterations, this.palette);

        const idx = rowOffset + px * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = a;
      }
    }

    this.ctx.putImageData(imgData, 0, 0);
    this.renderOverlay();
  }

  renderOverlay() {
    // Draw Real Axis Line (c in [-2.0, 0.25])
    const pStart = this.complexToPixel(-2.0, 0.0);
    const pEnd = this.complexToPixel(0.25, 0.0);

    this.ctx.save();

    // Highlighted Real Axis Line (Isomorphism Line)
    this.ctx.beginPath();
    this.ctx.moveTo(pStart.px, pStart.py);
    this.ctx.lineTo(pEnd.px, pEnd.py);
    this.ctx.strokeStyle = '#00f3ff';
    this.ctx.lineWidth = 3;
    this.ctx.shadowColor = '#00f3ff';
    this.ctx.shadowBlur = 10;
    this.ctx.stroke();

    // Selected parameter marker on real axis
    const pSel = this.complexToPixel(this.selectedC, 0.0);

    // Glow ring
    this.ctx.beginPath();
    this.ctx.arc(pSel.px, pSel.py, 9, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 0, 128, 0.4)';
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(pSel.px, pSel.py, 5, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ff0080';
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.fill();
    this.ctx.stroke();

    // Label c value
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '11px "JetBrains Mono", monospace';
    this.ctx.fillText(`c = ${this.selectedC.toFixed(4)}`, pSel.px + 10, pSel.py - 10);

    this.ctx.restore();
  }

  resetView() {
    this.view = {
      centerX: -0.75,
      centerY: 0.0,
      width: 3.2,
      height: 2.4
    };
    const aspect = this.canvas.width / this.canvas.height;
    this.view.height = this.view.width / aspect;
    this.render();
  }

  initEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStart = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const rect = this.canvas.getBoundingClientRect();
      const dx = ((e.clientX - this.dragStart.x) / rect.width) * this.view.width;
      const dy = ((e.clientY - this.dragStart.y) / rect.height) * this.view.height;

      this.view.centerX -= dx;
      this.view.centerY += dy;
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.render();
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const mousePx = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      const mousePy = (e.clientY - rect.top) * (this.canvas.height / rect.height);
      const mouseComp = this.pixelToComplex(mousePx, mousePy);

      const zoomFactor = e.deltaY < 0 ? 0.85 : 1.18;
      this.view.width *= zoomFactor;
      this.view.height *= zoomFactor;

      const newMouseComp = this.pixelToComplex(mousePx, mousePy);
      this.view.centerX += mouseComp.cr - newMouseComp.cr;
      this.view.centerY += mouseComp.ci - newMouseComp.ci;

      this.render();
    }, { passive: false });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      const py = (e.clientY - rect.top) * (this.canvas.height / rect.height);
      const comp = this.pixelToComplex(px, py);

      const clickedC = Math.max(-2.0, Math.min(0.25, comp.cr));
      this.selectedC = clickedC;
      this.renderOverlay();

      if (this.onSelectC) {
        this.onSelectC(clickedC);
      }
    });
  }
}
