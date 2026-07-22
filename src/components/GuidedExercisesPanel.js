import { GUIDED_EXERCISES } from '../math/guidedExercises.js';

export class GuidedExercisesPanel {
  constructor(modalElement, backdropElement, getCurrentR, onSelectModelAndR) {
    this.modal = modalElement;
    this.backdrop = backdropElement;
    this.getCurrentR = getCurrentR;
    this.onSelectModelAndR = onSelectModelAndR;

    this.currentExId = 'ex1';
    this.titleEl = document.getElementById('ex-title');
    this.descEl = document.getElementById('ex-desc');
    this.instructionEl = document.getElementById('ex-instruction');
    this.targetLabelEl = document.getElementById('ex-target-label');
    this.currentLabelEl = document.getElementById('ex-current-label');
    this.feedbackEl = document.getElementById('ex-feedback');
    this.questionEl = document.getElementById('ex-question');
    this.optionsContainer = document.getElementById('ex-options-container');

    this.btnVerify = document.getElementById('btn-verify-r');
    this.navBtns = this.modal ? this.modal.querySelectorAll('.ex-nav-btn') : [];

    this.initEvents();
  }

  open() {
    if (this.modal && this.backdrop) {
      this.modal.classList.add('active');
      this.backdrop.classList.add('active');
      this.selectExercise(this.currentExId);
    }
  }

  close() {
    if (this.modal && this.backdrop) {
      this.modal.classList.remove('active');
      this.backdrop.classList.remove('active');
    }
  }

  initEvents() {
    this.navBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const exId = e.target.dataset.ex;
        if (exId) this.selectExercise(exId);
      });
    });

    if (this.btnVerify) {
      this.btnVerify.addEventListener('click', () => this.verifyCurrentR());
    }
  }

  selectExercise(exId) {
    this.currentExId = exId;
    const exData = GUIDED_EXERCISES.find(e => e.id === exId) || GUIDED_EXERCISES[0];

    // Update nav button active states
    this.navBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.ex === exId);
    });

    if (this.titleEl) this.titleEl.textContent = exData.title;
    if (this.descEl) this.descEl.textContent = exData.description;
    if (this.instructionEl) this.instructionEl.textContent = exData.instruction;
    if (this.targetLabelEl) this.targetLabelEl.textContent = exData.targetR.toFixed(4);

    this.updateCurrentRDisplay();
    if (this.feedbackEl) {
      this.feedbackEl.textContent = '';
      this.feedbackEl.style.display = 'none';
    }

    // Render Multiple Choice Options
    if (this.questionEl) this.questionEl.textContent = `Pregunta de Evaluación: ${exData.question}`;
    if (this.optionsContainer) {
      this.optionsContainer.innerHTML = '';
      exData.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'ex-option-btn';
        btn.textContent = `${idx + 1}. ${opt.text}`;
        btn.addEventListener('click', () => this.answerOption(btn, opt.correct));
        this.optionsContainer.appendChild(btn);
      });
    }

    // Set model if required by exercise
    if (this.onSelectModelAndR && exData.modelId) {
      this.onSelectModelAndR(exData.modelId, exData.targetR);
    }
  }

  updateCurrentRDisplay() {
    const currentR = this.getCurrentR ? this.getCurrentR() : 3.0;
    if (this.currentLabelEl) {
      this.currentLabelEl.textContent = currentR.toFixed(4);
    }
  }

  verifyCurrentR() {
    const exData = GUIDED_EXERCISES.find(e => e.id === this.currentExId);
    if (!exData || !this.feedbackEl) return;

    const currentR = this.getCurrentR ? this.getCurrentR() : 3.0;
    const diff = Math.abs(currentR - exData.targetR);

    this.feedbackEl.style.display = 'block';
    if (diff <= exData.tolerance) {
      this.feedbackEl.textContent = `✅ ¡Excelente! r = ${currentR.toFixed(4)} está dentro del margen objetivo.`;
      this.feedbackEl.style.color = 'var(--accent-green)';
    } else {
      this.feedbackEl.textContent = `❌ r = ${currentR.toFixed(4)} todavía dista de ${exData.targetR.toFixed(4)}. Pista: ${exData.hint}`;
      this.feedbackEl.style.color = 'var(--accent-rose)';
    }
  }

  answerOption(btn, isCorrect) {
    if (isCorrect) {
      btn.classList.add('correct');
      btn.textContent += '  ✔ (¡Correcto!)';
    } else {
      btn.classList.add('incorrect');
      btn.textContent += '  ✖ (Inténtalo de nuevo)';
    }
  }
}
