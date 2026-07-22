import { renderLatex } from '../math/latexHelper.js';

export class TheoryModal {
  constructor(modalElement, backdropElement) {
    this.modal = modalElement;
    this.backdrop = backdropElement;
  }

  open() {
    this.modal.classList.add('active');
    this.backdrop.classList.add('active');
    this.renderLatexContent();
  }

  close() {
    this.modal.classList.remove('active');
    this.backdrop.classList.remove('active');
  }

  renderLatexContent() {
    const feigenbaumEl = document.getElementById('latex-feigenbaum-delta');
    const mandelbrotSliceEl = document.getElementById('latex-mandelbrot-slice');
    const isoProofEl = document.getElementById('latex-iso-proof');

    if (feigenbaumEl) renderLatex(feigenbaumEl, '\\delta \\approx 4.669201609102990');
    if (mandelbrotSliceEl) renderLatex(mandelbrotSliceEl, 'c \\in [-2, 0.25]');
    if (isoProofEl) renderLatex(isoProofEl,
      'c = \\frac{2r - r^2}{4} \\quad \\Longleftrightarrow \\quad r = 1 + \\sqrt{1 - 4c}',
      true
    );
  }
}
