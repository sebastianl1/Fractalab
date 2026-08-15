import type { BifurcationModel } from '../math/models/BaseModel.js';

/** Sonifies the active orbit with the Web Audio API. */
export class Sonifier {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private model: BifurcationModel | null = null;
  private r = 3.0;
  private stepIndex = 0;
  private orbit: number[] = [];
  private timerId: number | null = null;
  private tempoMs = 120;

  isPlaying = false;

  setModel(model: BifurcationModel): void {
    this.model = model;
    if (this.isPlaying) this.setR(this.r);
  }

  setR(r: number): void {
    this.r = r;
    if (this.model) {
      this.orbit = Array.from(this.model.getOrbit(r, 400, 128));
    }
  }

  private initAudio(): void {
    if (!this.audioCtx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      this.audioCtx = new Ctx();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.05, this.audioCtx.currentTime);

      this.oscillator = this.audioCtx.createOscillator();
      this.oscillator.type = 'sine';
      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);
      this.oscillator.start();
    }

    if (this.audioCtx.state === 'suspended') void this.audioCtx.resume();
  }

  togglePlay(): boolean {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  start(): void {
    this.initAudio();
    this.isPlaying = true;
    this.setR(this.r);

    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setTargetAtTime(0.08, this.audioCtx.currentTime, 0.02);
    }

    this.stepIndex = 0;
    if (this.timerId !== null) window.clearInterval(this.timerId);
    this.timerId = window.setInterval(() => this.tick(), this.tempoMs);
  }

  stop(): void {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setTargetAtTime(0.0, this.audioCtx.currentTime, 0.05);
    }
  }

  private tick(): void {
    if (
      !this.isPlaying ||
      this.orbit.length === 0 ||
      !this.oscillator ||
      !this.audioCtx ||
      !this.model
    ) {
      return;
    }

    const rawVal = this.orbit[this.stepIndex % this.orbit.length] ?? 0;
    this.stepIndex++;

    const xMin = this.model.xRange.min;
    const xMax = this.model.xRange.max;
    const norm = Math.max(0, Math.min(1, (rawVal - xMin) / (xMax - xMin)));

    const freq = 160 + norm * 940;
    this.oscillator.frequency.setTargetAtTime(freq, this.audioCtx.currentTime, 0.015);
  }
}
