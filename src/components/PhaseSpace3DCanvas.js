export class PhaseSpace3DCanvas {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');

    this.model = null;
    this.r = 3.0;

    // 3D Camera Rotation Angles (Euler angles in radians)
    this.rotX = 0.4;
    this.rotY = 0.6;
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };

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

  setR(r) {
    this.r = r;
    this.render();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    this.render();
  }

  // 3D Perspective Projection Function
  project(x, y, z, width, height) {
    // Center coordinates
    let cx = x;
    let cy = y;
    let cz = z;

    // Rotate Y
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    const x1 = cx * cosY + cz * sinY;
    const z1 = -cx * sinY + cz * cosY;

    // Rotate X
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);
    const y2 = cy * cosX - z1 * sinX;
    const z2 = cy * sinX + z1 * cosX;

    // Perspective Projection
    const distance = 3.5;
    const scale = (Math.min(width, height) * 0.42) / (z2 + distance);

    const px = width / 2 + x1 * scale;
    const py = height / 2 - y2 * scale;

    return { px, py, depth: z2 };
  }

  render() {
    this._scheduleRender();
  }

  _render() {
    if (!this.canvas.width || !this.canvas.height || !this.model) return;

    const width = this.canvas.width;
    const height = this.canvas.height;

    // Deep Dark Cosmic Background
    this.ctx.fillStyle = '#040714';
    this.ctx.fillRect(0, 0, width, height);

    // Render 3D Bounding Cube Grid
    this.draw3DBox(width, height);

    // Compute 3D Orbit: (x_n, x_{n+1}, x_{n+2})
    const numPoints = 600;
    const orbit = this.model.getOrbit(this.r, 200, numPoints + 2);
    const xMin = this.model.xRange.min;
    const xMax = this.model.xRange.max;
    const xSpan = xMax - xMin;

    const projectedPoints = [];
    for (let i = 0; i < numPoints; i++) {
      // Normalize coords to [-1, 1]
      const nx = ((orbit[i] - xMin) / xSpan) * 2 - 1;
      const ny = ((orbit[i + 1] - xMin) / xSpan) * 2 - 1;
      const nz = ((orbit[i + 2] - xMin) / xSpan) * 2 - 1;

      const p = this.project(nx, ny, nz, width, height);
      projectedPoints.push(p);
    }

    // Render 3D Trajectory Segments with Depth Cueing
    for (let i = 0; i < projectedPoints.length - 1; i++) {
      const p1 = projectedPoints[i];
      const p2 = projectedPoints[i + 1];

      // Depth shading alpha
      const depthAlpha = Math.max(0.15, Math.min(1.0, 1.0 - (p1.depth + 1.0) * 0.3));

      this.ctx.beginPath();
      this.ctx.moveTo(p1.px, p1.py);
      this.ctx.lineTo(p2.px, p2.py);

      // Gradient color based on progression
      const t = i / projectedPoints.length;
      if (t < 0.5) {
        this.ctx.strokeStyle = `rgba(139, 92, 246, ${depthAlpha * 0.9})`;
      } else {
        this.ctx.strokeStyle = `rgba(244, 63, 94, ${depthAlpha * 0.9})`;
      }

      this.ctx.lineWidth = 1.8;
      this.ctx.stroke();
    }

    // Draw glowing current state head node
    if (projectedPoints.length > 0) {
      const lastP = projectedPoints[projectedPoints.length - 1];
      this.ctx.beginPath();
      this.ctx.arc(lastP.px, lastP.py, 5, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffaa00';
      this.ctx.shadowColor = '#ffaa00';
      this.ctx.shadowBlur = 12;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    // Render 3D Axis Labels
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.font = '11px "JetBrains Mono", monospace';
    this.ctx.fillText(`Rotación 3D: X=${(this.rotX * 180 / Math.PI).toFixed(0)}° Y=${(this.rotY * 180 / Math.PI).toFixed(0)}°`, 12, 22);
  }

  draw3DBox(width, height) {
    const boxVertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1]
    ];
    const boxEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    const projVerts = boxVertices.map(v => this.project(v[0], v[1], v[2], width, height));

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([2, 2]);

    for (const edge of boxEdges) {
      const p1 = projVerts[edge[0]];
      const p2 = projVerts[edge[1]];
      this.ctx.beginPath();
      this.ctx.moveTo(p1.px, p1.py);
      this.ctx.lineTo(p2.px, p2.py);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]);
  }

  initEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouse.x;
      const dy = e.clientY - this.lastMouse.y;

      this.rotY += dx * 0.008;
      this.rotX += dy * 0.008;
      this.lastMouse = { x: e.clientX, y: e.clientY };

      this._scheduleRender();
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
  }
}
