import { ENGINEERING_CASES, generateEngineeringSignal } from '../math/engineeringCases.js';
import { renderLatex } from '../math/latexHelper.js';

export class EngineeringCasePanel {
  constructor(onSelectModelAndR) {
    this.onSelectModelAndR = onSelectModelAndR;
    this.currentCaseId = 'electrical';

    this.titleEl = document.getElementById('eng-title');
    this.subtitleEl = document.getElementById('eng-subtitle');
    this.explanationEl = document.getElementById('eng-explanation');
    this.latexEqEl = document.getElementById('eng-latex-eq');
    this.tabsContainer = document.getElementById('engineering-tabs');

    this.canvas = document.getElementById('canvas-engineering');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.initEvents();
    this.selectCase('electrical');
  }

  initEvents() {
    if (!this.tabsContainer) return;
    this.tabsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.eng-tab');
      if (btn && btn.dataset.case) {
        this.selectCase(btn.dataset.case);
      }
    });
  }

  selectCase(caseId) {
    this.currentCaseId = caseId;
    const caseData = ENGINEERING_CASES.find(c => c.id === caseId) || ENGINEERING_CASES[0];

    // Update Tabs Active state
    const tabs = this.tabsContainer.querySelectorAll('.eng-tab');
    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.case === caseId);
    });

    // Update Text Content
    if (this.titleEl) this.titleEl.textContent = caseData.title;
    if (this.subtitleEl) this.subtitleEl.textContent = caseData.subtitle;
    if (this.explanationEl) this.explanationEl.textContent = caseData.explanation;
    if (this.latexEqEl) renderLatex(this.latexEqEl, caseData.equation);

    // Render Canvas Signal with HD DPR
    this.renderSignal(caseData);

    // Notify model and r update if callback attached
    if (this.onSelectModelAndR) {
      this.onSelectModelAndR(caseData.modelId, caseData.targetR);
    }
  }

  renderSignal(caseData) {
    if (!this.canvas || !this.ctx) return;
    
    // HD Device Pixel Ratio scaling for vector clarity
    const dpr = Math.max(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const cssWidth = rect.width || 450;
    const cssHeight = 180;

    this.canvas.width = Math.floor(cssWidth * dpr);
    this.canvas.height = Math.floor(cssHeight * dpr);
    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;
    this.ctx.imageSmoothingEnabled = true;

    const width = this.canvas.width;
    const height = this.canvas.height;

    // Clear background
    this.ctx.fillStyle = '#040714';
    this.ctx.fillRect(0, 0, width, height);

    // Grid lines with sharp subpixels
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1 * dpr;
    const gridStepX = 50 * dpr;
    for (let x = 0; x < width; x += gridStepX) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    // Generate signal waveform points
    const sampleCount = Math.floor(cssWidth * 1.5);
    const points = generateEngineeringSignal(caseData.id, sampleCount, caseData.targetR);

    // Draw high-resolution glowing waveform line
    this.ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const val = points[i];
      const px = (i / sampleCount) * width;
      const py = height - val * (height * 0.75) - height * 0.12;
      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }

    this.ctx.strokeStyle = '#06b6d4';
    this.ctx.lineWidth = 2.5 * dpr;
    this.ctx.shadowColor = '#06b6d4';
    this.ctx.shadowBlur = 10 * dpr;
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
  }
}
