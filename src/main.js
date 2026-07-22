import { appState } from './math/AppState.js';
import { globalModelRegistry } from './math/models/ModelRegistry.js';
import { MandelbrotShader } from './components/MandelbrotShader.js';
import { BifurcationCanvas } from './components/BifurcationCanvas.js';
import { CobwebCanvas } from './components/CobwebCanvas.js';
import { ThreePhaseScene } from './components/ThreePhaseScene.js';
import { Sonifier } from './components/Sonifier.js';
import { InspectorPanel } from './components/InspectorPanel.js';
import { TheoryModal } from './components/TheoryModal.js';
import { EngineeringCasePanel } from './components/EngineeringCasePanel.js';
import { GuidedExercisesPanel } from './components/GuidedExercisesPanel.js';
import { renderLatex } from './math/latexHelper.js';

document.addEventListener('DOMContentLoaded', () => {
  const selectModel = document.getElementById('select-model');
  const polyKContainer = document.getElementById('poly-k-container');
  const selectPolyK = document.getElementById('select-poly-k');
  const sliderR = document.getElementById('slider-r');
  const labelRVal = document.getElementById('label-r-val');
  const selectPalette = document.getElementById('select-palette');
  const checkLyapunov = document.getElementById('check-lyapunov');
  const btnReset = document.getElementById('btn-reset');
  const btnAudio = document.getElementById('btn-audio');
  const audioText = document.getElementById('audio-text');
  const audioIcon = document.getElementById('audio-icon');
  const btnTheory = document.getElementById('btn-theory');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalTheory = document.getElementById('modal-theory');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalUnderstandBtn = document.getElementById('modal-understand-btn');
  const btnExercises = document.getElementById('btn-exercises');
  const modalExBackdrop = document.getElementById('modal-exercises-backdrop');
  const modalExercises = document.getElementById('modal-exercises');
  const modalExCloseBtn = document.getElementById('modal-ex-close-btn');
  const modalExCloseFooter = document.getElementById('modal-ex-close-footer');
  const inspectorContainer = document.getElementById('inspector-container');
  const activeEquationDisplay = document.getElementById('latex-equation');
  const activeDerivativeDisplay = document.getElementById('latex-derivative');
  const connectorRText = document.getElementById('connector-r-text');
  const connectorCText = document.getElementById('connector-c-text');
  const connectorLatex = document.getElementById('connector-latex');

  const inspector = new InspectorPanel(inspectorContainer);
  const sonifier = new Sonifier();
  const theoryModal = new TheoryModal(modalTheory, modalBackdrop);

  const mandelbrot = new MandelbrotShader(
    document.getElementById('canvas-mandelbrot'),
    (selectedC) => {
      const r = appState.model.cToR(selectedC);
      appState.r = r;
    }
  );

  const bifurcation = new BifurcationCanvas(
    document.getElementById('canvas-bifurcation'),
    (selectedR) => {
      appState.r = selectedR;
    }
  );

  const cobweb = new CobwebCanvas(document.getElementById('canvas-cobweb'));
  const phaseSpace3d = new ThreePhaseScene(document.getElementById('canvas-3d-phase'));

  const engineeringPanel = new EngineeringCasePanel((modelId, targetR) => {
    appState.modelId = modelId;
    appState.r = targetR;
  });

  const exercisesPanel = new GuidedExercisesPanel(
    modalExercises, modalExBackdrop,
    () => appState.r,
    (modelId, targetR) => {
      appState.modelId = modelId;
      appState.r = targetR;
    }
  );

  function syncUI() {
    const model = appState.model;
    const r = appState.r;
    const c = appState.c;

    selectModel.value = model.id;
    polyKContainer.style.display = model.id === 'polynomial' ? 'inline-flex' : 'none';

    sliderR.min = model.rRange.min;
    sliderR.max = model.rRange.max;
    sliderR.step = (model.rRange.max - model.rRange.min) / 10000;
    sliderR.value = r;

    labelRVal.textContent = r.toFixed(4);
    if (connectorRText) connectorRText.textContent = `r = ${r.toFixed(4)}`;
    if (connectorCText) connectorCText.textContent = `c = ${c.toFixed(4)}`;
    if (connectorLatex) renderLatex(connectorLatex, `c = \\frac{2r - r^2}{4} = ${c.toFixed(4)}`);

    if (activeEquationDisplay) renderLatex(activeEquationDisplay, model.equationLatex);
    if (activeDerivativeDisplay) renderLatex(activeDerivativeDisplay, model.derivativeLatex);

    bifurcation.setModel(model);
    bifurcation.setSelectedR(r);
    cobweb.setModel(model);
    cobweb.setR(r);
    phaseSpace3d.setModel(model);
    phaseSpace3d.setR(r);
    inspector.setModel(model);
    inspector.update(r);
    sonifier.setModel(model);
    mandelbrot.setModel(model);
    mandelbrot.setSelectedR(r);

    if (sonifier.isPlaying) sonifier.setR(r);
    exercisesPanel.updateCurrentRDisplay();
  }

  selectModel.addEventListener('change', (e) => {
    appState.modelId = e.target.value;
  });

  if (selectPolyK) {
    selectPolyK.addEventListener('change', (e) => {
      globalModelRegistry.setPolynomialK(parseInt(e.target.value, 10));
      appState.modelId = 'polynomial';
    });
  }

  sliderR.addEventListener('input', (e) => {
    appState.r = parseFloat(e.target.value);
  });

  selectPalette.addEventListener('change', (e) => {
    mandelbrot.setPalette(parseInt(e.target.value, 10));
  });

  checkLyapunov.addEventListener('change', (e) => {
    bifurcation.toggleLyapunov(e.target.checked);
  });

  btnReset.addEventListener('click', () => {
    mandelbrot.resetView();
    bifurcation.resetZoom();
    appState.r = appState.model.defaultR;
  });

  btnAudio.addEventListener('click', () => {
    const isPlaying = sonifier.togglePlay();
    audioText.textContent = isPlaying ? 'Pausar Sonido' : 'Sonificar Órbita';
    audioIcon.textContent = isPlaying ? '⏸️' : '🔊';
    btnAudio.classList.toggle('btn-primary', isPlaying);
  });

  btnTheory.addEventListener('click', () => theoryModal.open());
  modalCloseBtn.addEventListener('click', () => theoryModal.close());
  modalUnderstandBtn.addEventListener('click', () => theoryModal.close());
  modalBackdrop.addEventListener('click', () => theoryModal.close());

  btnExercises.addEventListener('click', () => exercisesPanel.open());
  if (modalExCloseBtn) modalExCloseBtn.addEventListener('click', () => exercisesPanel.close());
  if (modalExCloseFooter) modalExCloseFooter.addEventListener('click', () => exercisesPanel.close());
  if (modalExBackdrop) modalExBackdrop.addEventListener('click', () => exercisesPanel.close());

  function handleResize() {
    mandelbrot.resize();
    bifurcation.resize();
    cobweb.resize();
    phaseSpace3d.resize();
  }

  window.addEventListener('resize', handleResize);

  document.querySelectorAll('.btn-fullscreen').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const canvasId = btn.dataset.fullscreen;
      const panel = btn.closest('.canvas-panel');
      if (!panel) return;
      panel.classList.toggle('fullscreen');
      btn.textContent = panel.classList.contains('fullscreen') ? '✕' : '⛶';
      setTimeout(() => {
        if (canvasId === 'canvas-mandelbrot') mandelbrot.resize();
        else if (canvasId === 'canvas-bifurcation') bifurcation.resize();
        else if (canvasId === 'canvas-cobweb') cobweb.resize();
        else if (canvasId === 'canvas-3d-phase') phaseSpace3d.resize();
      }, 50);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
      const activeFullscreen = document.querySelector('.canvas-panel.fullscreen');
      if (activeFullscreen) {
        activeFullscreen.classList.remove('fullscreen');
        activeFullscreen.querySelector('.btn-fullscreen').textContent = '⛶';
        setTimeout(handleResize, 50);
      }
    }
    if (e.key === 'Escape') {
      document.querySelectorAll('.canvas-panel.fullscreen').forEach(p => {
        p.classList.remove('fullscreen');
        p.querySelector('.btn-fullscreen').textContent = '⛶';
        setTimeout(handleResize, 50);
      });
    }
  });

  appState.on('modelChange', () => syncUI());
  appState.on('rChange', () => syncUI());

  appState.modelId = 'logistic';
  appState.r = 3.0;
  syncUI();
  setTimeout(handleResize, 100);
});
