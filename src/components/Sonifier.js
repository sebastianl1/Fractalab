export class Sonifier {
  constructor() {
    this.audioCtx = null;
    this.oscillator = null;
    this.gainNode = null;
    this.isPlaying = false;

    this.model = null;
    this.r = 3.0;
    this.stepIndex = 0;
    this.orbit = [];
    this.timerId = null;
    this.tempoMs = 120; // 120ms per orbit step
  }

  setModel(model) {
    this.model = model;
    if (this.isPlaying) {
      this.setR(this.r);
    }
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.05, this.audioCtx.currentTime);

      this.oscillator = this.audioCtx.createOscillator();
      this.oscillator.type = 'sine';
      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);
      this.oscillator.start();
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setR(r) {
    this.r = r;
    if (this.model) {
      this.orbit = Array.from(this.model.getOrbit(r, 400, 128));
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  start() {
    this.initAudio();
    this.isPlaying = true;
    this.setR(this.r);

    if (this.gainNode) {
      this.gainNode.gain.setTargetAtTime(0.08, this.audioCtx.currentTime, 0.02);
    }

    this.stepIndex = 0;
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => this.tick(), this.tempoMs);
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setTargetAtTime(0.0, this.audioCtx.currentTime, 0.05);
    }
  }

  tick() {
    if (!this.isPlaying || !this.orbit.length || !this.oscillator || !this.audioCtx || !this.model) return;

    const rawVal = this.orbit[this.stepIndex % this.orbit.length];
    this.stepIndex++;

    const xMin = this.model.xRange.min;
    const xMax = this.model.xRange.max;
    const norm = Math.max(0, Math.min(1, (rawVal - xMin) / (xMax - xMin)));

    // Map x in [0, 1] to musical frequency [160Hz - 1100Hz]
    const freq = 160 + norm * 940;
    this.oscillator.frequency.setTargetAtTime(freq, this.audioCtx.currentTime, 0.015);
  }
}
