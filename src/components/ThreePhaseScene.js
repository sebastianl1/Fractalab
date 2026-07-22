import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class ThreePhaseScene {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.model = null;
    this.r = 3.0;
    this.orbitPoints = [];
    this.animationId = null;

    this.initScene();
    this.initEvents();
    this.animate();
  }

  initScene() {
    const rect = this.canvas.parentElement.getBoundingClientRect();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x040714);

    this.camera = new THREE.PerspectiveCamera(50, rect.width / rect.height, 0.1, 20);
    this.camera.position.set(2.5, 1.8, 3.0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false
    });
    this.renderer.setPixelRatio(Math.max(window.devicePixelRatio, 2));
    this.renderer.setSize(rect.width, rect.height);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.autoRotate = false;
    this.controls.target.set(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0x404060);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(1, 2, 1);
    this.scene.add(dirLight);

    this.buildBoundingBox();

    this.lineMaterial = new THREE.LineBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.8
    });

    this.pointsMaterial = new THREE.PointsMaterial({
      color: 0xf43f5e,
      size: 0.035,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    this.orbitLine = new THREE.Line(new THREE.BufferGeometry(), this.lineMaterial);
    this.orbitPointsObj = new THREE.Points(new THREE.BufferGeometry(), this.pointsMaterial);
    this.scene.add(this.orbitLine);
    this.scene.add(this.orbitPointsObj);

    this.headSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffaa00 })
    );
    this.scene.add(this.headSphere);
  }

  buildBoundingBox() {
    const boxSize = 1.8;
    const geo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const edges = new THREE.EdgesGeometry(geo);
    const mat = new THREE.LineBasicMaterial({
      color: 0x334466,
      transparent: true,
      opacity: 0.25
    });
    const wireframe = new THREE.LineSegments(edges, mat);
    this.scene.add(wireframe);

    const axesMat = (color) => new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 });
    const axisLen = 1.2;
    [-1, 0, 1].forEach((val, i) => {
      const isX = i === 0, isY = i === 1, isZ = i === 2;
      const color = isX ? 0xff4444 : isY ? 0x44ff44 : 0x4488ff;
      const dir = new THREE.Vector3(isX ? 1 : 0, isY ? 1 : 0, isZ ? 1 : 0);
      const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), axisLen, color, 0.15, 0.1);
      this.scene.add(arrow);
    });
  }

  setModel(model) {
    this.model = model;
    this.computeOrbit();
  }

  setR(r) {
    this.r = r;
    this.computeOrbit();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(rect.width, rect.height);
  }

  computeOrbit() {
    if (!this.model) return;
    const numPoints = 400;
    const orbit = this.model.getOrbit(this.r, 200, numPoints + 2);
    const xMin = this.model.xRange.min;
    const xMax = this.model.xRange.max;
    const xSpan = xMax - xMin || 1;

    const positions = [];
    for (let i = 0; i < numPoints; i++) {
      const nx = ((orbit[i] - xMin) / xSpan) * 2 - 1;
      const ny = ((orbit[i + 1] - xMin) / xSpan) * 2 - 1;
      const nz = ((orbit[i + 2] - xMin) / xSpan) * 2 - 1;
      positions.push(nx, ny, nz);
    }

    this.orbitPositions = positions;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this.orbitLine.geometry.dispose();
    this.orbitLine.geometry = geo;

    const colors = new Float32Array(numPoints * 3);
    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      if (t < 0.5) {
        colors[i * 3] = 0.35 + t * 0.4;
        colors[i * 3 + 1] = 0.2 + t * 0.4;
        colors[i * 3 + 2] = 0.7 + t * 0.3;
      } else {
        const t2 = (t - 0.5) * 2;
        colors[i * 3] = 0.55 + t2 * 0.4;
        colors[i * 3 + 1] = 0.1 - t2 * 0.05;
        colors[i * 3 + 2] = 0.85 - t2 * 0.6;
      }
    }
    this.orbitLine.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    this.orbitLine.material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      linewidth: 1
    });

    const pointsGeo = new THREE.BufferGeometry();
    if (positions.length >= 3) {
      const lastThree = positions.slice(-3);
      pointsGeo.setAttribute('position', new THREE.Float32BufferAttribute(lastThree, 3));
    }
    this.orbitPointsObj.geometry.dispose();
    this.orbitPointsObj.geometry = pointsGeo;

    if (positions.length >= 3) {
      const lastIdx = positions.length - 3;
      this.headSphere.position.set(
        positions[lastIdx],
        positions[lastIdx + 1],
        positions[lastIdx + 2]
      );
    }
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());
  }

  dispose() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }
}
