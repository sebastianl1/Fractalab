import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

uniform vec2  uCenter;
uniform float uZoom;
uniform float uMaxIter;
uniform float uPalette;
uniform vec2  uResolution;

varying vec2 vUv;

vec3 palette0(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
}

vec3 palette1(float t) {
  return vec3(pow(t, 0.5) * 1.2, pow(t, 1.2) * 0.78, pow(t, 2.5));
}

vec3 palette2(float t) {
  float r = sin(t * 3.14159) * 0.7 + 0.08;
  float g = cos(t * 3.14159 * 0.5) * 0.86 + 0.14;
  float b = sin(t * 3.14159 * 1.5) * 0.9 + 0.1;
  return vec3(r, g, b);
}

vec3 palette3(float t) {
  float r = pow(t, 2.0) * 0.31;
  float g = pow(t, 0.7) * 0.86;
  float b = pow(t, 0.4);
  return vec3(r, g, b);
}

vec3 getColor(float smooth, float maxIter, float palette) {
  if (smooth >= maxIter) return vec3(0.04, 0.055, 0.1);
  float t = smooth / maxIter;
  float cycle = fract(smooth * 0.08);
  if (palette < 0.5) return palette0(cycle);
  else if (palette < 1.5) return palette1(t);
  else if (palette < 2.5) return palette2(cycle);
  else return palette3(t);
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float aspect = uResolution.x / uResolution.y;
  uv.x *= aspect;

  vec2 c = uCenter + uv * uZoom;
  vec2 z = vec2(0.0, 0.0);

  float n = 0.0;
  float maxIter = uMaxIter;

  for (float i = 0.0; i < 256.0; i += 1.0) {
    if (n >= maxIter) break;
    float zr2 = z.x * z.x;
    float zi2 = z.y * z.y;
    if (zr2 + zi2 > 4.0) break;
    z.y = 2.0 * z.x * z.y + c.y;
    z.x = zr2 - zi2 + c.x;
    n += 1.0;
  }

  float smoothVal = n;
  if (n < maxIter) {
    float log_zn = log(z.x * z.x + z.y * z.y) / 2.0;
    float nu = log(log_zn / 0.693147) / 0.693147;
    smoothVal = n + 1.0 - nu;
  }

  vec3 color = getColor(smoothVal, maxIter, uPalette);
  gl_FragColor = vec4(color, 1.0);
}
`;

export class MandelbrotShader {
  constructor(canvasElement, onSelectC) {
    this.canvas = canvasElement;
    this.onSelectC = onSelectC;

    this.centerX = -0.75;
    this.centerY = 0.0;
    this.zoom = 3.2;
    this.maxIter = 150;
    this.palette = 0;
    this.selectedC = -0.75;
    this.model = null;
    this.renderer = null;

    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragCenterStart = { x: 0, y: 0 };

    this.ctx = canvasElement.getContext('2d');
    this.useWebGL = true;

    this.createOverlay();
    this.initGL();
    if (!this.renderer) {
      this.useWebGL = false;
    }
    this.initEvents();
  }

  createOverlay() {
    const parent = this.canvas.parentElement;
    this.overlayCanvas = document.createElement('canvas');
    this.overlayCanvas.className = 'mandelbrot-overlay';
    this.overlayCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2;';
    parent.appendChild(this.overlayCanvas);
    this.overlayCtx = this.overlayCanvas.getContext('2d');
  }

  initGL() {
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false
      });

      const rect = this.canvas.parentElement.getBoundingClientRect();
      const dpr = Math.max(window.devicePixelRatio || 1, 2);
      this.renderer.setPixelRatio(dpr);
      this.renderer.setSize(rect.width, rect.height, false);
      this.overlayCanvas.width = this.canvas.width;
      this.overlayCanvas.height = this.canvas.height;

      this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      this.camera.position.z = 1;
      this.scene = new THREE.Scene();

      this.material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uCenter: { value: new THREE.Vector2(this.centerX, this.centerY) },
          uZoom: { value: this.zoom },
          uMaxIter: { value: this.maxIter },
          uPalette: { value: this.palette },
          uResolution: { value: new THREE.Vector2(rect.width * dpr, rect.height * dpr) }
        }
      });

      const geo = new THREE.PlaneGeometry(2, 2);
      this.mesh = new THREE.Mesh(geo, this.material);
      this.scene.add(this.mesh);

      this.renderGL();
    } catch (e) {
      this.renderer = null;
    }
  }

  renderGL() {
    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  renderFallback() {
    let width = this.canvas.width;
    let height = this.canvas.height;
    if (!width || !height) {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const dpr = Math.max(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.floor(rect.width * dpr);
      this.canvas.height = Math.floor(rect.height * dpr);
      width = this.canvas.width;
      height = this.canvas.height;
    }
    if (!width || !height) return;

    const dpr = Math.max(window.devicePixelRatio || 1, 2);
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.imageSmoothingEnabled = false;

    const imgData = this.ctx.createImageData(width, height);
    const data = imgData.data;

    const minX = this.centerX - this.zoom * 0.5 * (width / height);
    const maxY = this.centerY + this.zoom * 0.5;
    const dx = this.zoom * (width / height) / width;
    const dy = this.zoom / height;

    for (let py = 0; py < height; py++) {
      const ci = maxY - py * dy;
      const rowOffset = py * width * 4;
      for (let px = 0; px < width; px++) {
        const cr = minX + px * dx;
        let zr = 0, zi = 0, zr2 = 0, zi2 = 0;
        let n = 0;
        while (zr2 + zi2 <= 4 && n < this.maxIter) {
          zi = 2 * zr * zi + ci;
          zr = zr2 - zi2 + cr;
          zr2 = zr * zr;
          zi2 = zi * zi;
          n++;
        }

        const idx = rowOffset + px * 4;
        if (n >= this.maxIter) {
          data[idx] = 10; data[idx + 1] = 14; data[idx + 2] = 26;
        } else {
          const log_zn = Math.log(zr2 + zi2) / 2;
          const nu = Math.log(log_zn / Math.LN2) / Math.LN2;
          const smooth = n + 1 - nu;
          const t = smooth / this.maxIter;
          const cycle = (smooth * 0.08) % 1;
          let r, g, b;

          if (this.palette === 0) {
            r = Math.floor(Math.sin(cycle * Math.PI * 2) * 127 + 128);
            g = Math.floor(Math.sin((cycle + 0.33) * Math.PI * 2) * 127 + 128);
            b = Math.floor(Math.sin((cycle + 0.66) * Math.PI * 2) * 127 + 128);
          } else if (this.palette === 1) {
            r = Math.floor(Math.min(255, Math.pow(t, 0.5) * 255 * 1.2));
            g = Math.floor(Math.min(255, Math.pow(t, 1.2) * 200));
            b = Math.floor(Math.min(255, Math.pow(t, 2.5) * 255));
          } else if (this.palette === 2) {
            r = Math.floor(Math.sin(cycle * Math.PI) * 180 + 20);
            g = Math.floor(Math.cos(cycle * Math.PI * 0.5) * 220 + 35);
            b = Math.floor(Math.sin(cycle * Math.PI * 1.5) * 230 + 25);
          } else {
            r = Math.floor(Math.pow(t, 2) * 80);
            g = Math.floor(Math.pow(t, 0.7) * 220);
            b = Math.floor(Math.pow(t, 0.4) * 255);
          }
          data[idx] = Math.min(255, r);
          data[idx + 1] = Math.min(255, g);
          data[idx + 2] = Math.min(255, b);
        }
        data[idx + 3] = 255;
      }
    }
    this.ctx.putImageData(imgData, 0, 0);
  }

  setModel(model) {
    this.model = model;
  }

  setSelectedR(r) {
    if (this.model) {
      this.selectedC = this.model.rToC(r);
    } else {
      this.selectedC = (2 * r - r * r) / 4;
    }
    if (this.useWebGL && this.renderer) {
      const uv = this.model ? this.model.rToC(r) : ((2 * r - r * r) / 4);
      this.material.uniforms.uCenter.value.set(this.centerX, this.centerY);
      this.renderGL();
    } else {
      this.renderFallback();
    }
    this.renderOverlay();
  }

  setSelectedC(c) {
    this.selectedC = c;
    this.renderOverlay();
  }

  setPalette(index) {
    this.palette = index;
    if (this.useWebGL && this.renderer) {
      this.material.uniforms.uPalette.value = index;
      this.renderGL();
    } else {
      this.renderFallback();
    }
    this.renderOverlay();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 2);

    if (this.useWebGL && this.renderer) {
      this.renderer.setSize(rect.width, rect.height, false);
      this.material.uniforms.uResolution.value.set(rect.width * dpr, rect.height * dpr);
      this.renderGL();
    } else {
      this.canvas.width = Math.floor(rect.width * dpr);
      this.canvas.height = Math.floor(rect.height * dpr);
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      this.renderFallback();
    }

    this.overlayCanvas.width = this.canvas.width;
    this.overlayCanvas.height = this.canvas.height;
    this.renderOverlay();
  }

  complexToPixel(cr, ci) {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const width = this.canvas.width;
    const height = this.canvas.height;
    const aspect = rect.width / rect.height;
    const ux = (cr - this.centerX) / (this.zoom * aspect / 2);
    const uy = (this.centerY - ci) / (this.zoom / 2);
    return {
      px: (ux / 2 + 0.5) * width,
      py: (uy / 2 + 0.5) * height
    };
  }

  renderOverlay() {
    const ctx = this.overlayCtx;
    if (!ctx) return;
    ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

    const pStart = this.complexToPixel(-2.0, 0.0);
    const pEnd = this.complexToPixel(0.25, 0.0);

    ctx.save();

    ctx.beginPath();
    ctx.moveTo(pStart.px, pStart.py);
    ctx.lineTo(pEnd.px, pEnd.py);
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 10;
    ctx.stroke();

    const pSel = this.complexToPixel(this.selectedC, 0.0);
    ctx.beginPath();
    ctx.arc(pSel.px, pSel.py, 9, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 0, 128, 0.4)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pSel.px, pSel.py, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#f43f5e';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText(`c = ${this.selectedC.toFixed(4)}`, pSel.px + 10, pSel.py - 10);

    ctx.restore();
  }

  render() {
    if (this.useWebGL && this.renderer) {
      this.renderGL();
    } else {
      this.renderFallback();
    }
    this.renderOverlay();
  }

  pixelToComplex(px, py) {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const ux = (px / rect.width) * 2 - 1;
    const uy = (py / rect.height) * 2 - 1;
    const aspect = rect.width / rect.height;
    return {
      cr: this.centerX + ux * aspect * this.zoom / 2,
      ci: this.centerY - uy * this.zoom / 2
    };
  }

  resetView() {
    this.centerX = -0.75;
    this.centerY = 0.0;
    this.zoom = 3.2;
    this.maxIter = 150;

    if (this.useWebGL && this.renderer) {
      this.material.uniforms.uCenter.value.set(this.centerX, this.centerY);
      this.material.uniforms.uZoom.value = this.zoom;
      this.material.uniforms.uMaxIter.value = this.maxIter;
      this.renderGL();
    } else {
      this.renderFallback();
    }
    this.renderOverlay();
  }

  initEvents() {
    const getCoords = (e) => {
      if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      return { x: e.clientX, y: e.clientY };
    };

    const startDrag = (e) => {
      this.isDragging = true;
      const c = getCoords(e);
      this.dragStart = { x: c.x, y: c.y };
      this.dragCenterStart = { x: this.centerX, y: this.centerY };
    };

    const moveDrag = (e) => {
      if (!this.isDragging) return;
      const c = getCoords(e);
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const dx = ((c.x - this.dragStart.x) / rect.width) * this.zoom;
      const dy = ((c.y - this.dragStart.y) / rect.height) * this.zoom;

      this.centerX = this.dragCenterStart.x - dx;
      this.centerY = this.dragCenterStart.y + dy;

      if (this.useWebGL && this.renderer) {
        this.material.uniforms.uCenter.value.set(this.centerX, this.centerY);
        this.renderGL();
      } else {
        this.renderFallback();
      }
      this.renderOverlay();
    };

    const endDrag = () => {
      this.isDragging = false;
    };

    const handleClick = (e) => {
      const c = getCoords(e);
      if (Math.abs(this.dragStart.x - c.x) < 5 && Math.abs(this.dragStart.y - c.y) < 5) {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const px = c.x - rect.left;
        const py = c.y - rect.top;
        const comp = this.pixelToComplex(px, py);
        const clickedC = Math.max(-2.0, Math.min(0.25, comp.cr));
        this.selectedC = clickedC;
        this.renderOverlay();
        if (this.onSelectC) this.onSelectC(clickedC);
      }
    };

    // Mouse
    this.canvas.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup', endDrag);
    this.canvas.addEventListener('click', handleClick);

    // Touch
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startDrag(e);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      e.preventDefault();
      moveDrag(e);
    }, { passive: false });

    window.addEventListener('touchend', endDrag);

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const c = getCoords(e);
      const px = c.x - rect.left;
      const py = c.y - rect.top;
      const comp = this.pixelToComplex(px, py);

      const zoomFactor = e.deltaY < 0 ? 0.8 : 1.25;
      this.zoom *= zoomFactor;
      this.maxIter = Math.min(2000, Math.floor(100 + Math.pow(1 / this.zoom, 0.4) * 200));

      const ux = (px / rect.width) * 2 - 1;
      const uy = (py / rect.height) * 2 - 1;
      const aspect = rect.width / rect.height;
      const newCr = this.centerX + ux * aspect * this.zoom / 2;
      const newCi = this.centerY - uy * this.zoom / 2;
      this.centerX += (comp.cr - newCr);
      this.centerY += (comp.ci - newCi);

      if (this.useWebGL && this.renderer) {
        this.material.uniforms.uCenter.value.set(this.centerX, this.centerY);
        this.material.uniforms.uZoom.value = this.zoom;
        this.material.uniforms.uMaxIter.value = this.maxIter;
        this.renderGL();
      } else {
        this.renderFallback();
      }
      this.renderOverlay();
    }, { passive: false });
  }
}
