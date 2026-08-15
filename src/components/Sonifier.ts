import type { BifurcationModel } from '../math/models/BaseModel.js';

export type SonifyMode = 'glissando' | 'scale';

/** Pentatonic minor scale (A minor pentatonic) as semitone offsets from A3. */
const PENTATONIC_SEMITONES = [0, 3, 5, 7, 10] as const;
const PENTATONIC_NAMES = ['A', 'C', 'D', 'E', 'G'] as const;
const BASE_FREQ = 220; // A3
const SCALE_DEGREES = PENTATONIC_SEMITONES.length * 2; // two octaves

/**
 * Sonifies the active orbit with the Web Audio API.
 *
 * - `glissando` mode: continuous pitch following the orbit (chaos → noisy sweeps).
 * - `scale` mode: orbit values are quantized to a pentatonic minor scale, so
 *   stable attractors sound like a melody and chaos sounds like aleatoric noise.
 *
 * Two voices: a lead sine oscillator with a per-note envelope and a sub
 * oscillator one octave lower for richness.
 */
export class Sonifier {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private subOscillator: OscillatorNode | null = null;
  private envGain: GainNode | null = null;
  private subGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  private model: BifurcationModel | null = null;
  private r = 3.0;
  private stepIndex = 0;
  private orbit: number[] = [];
  private timerId: number | null = null;

  isPlaying = false;
  mode: SonifyMode = 'scale';
  tempoMs = 140;
  lastNote = '—';
  onNotePlayed?: (note: string) => void;

  setTempo(ms: number): void {
    this.tempoMs = Math.max(40, Math.min(1000, ms));
    if (this.isPlaying && this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = window.setInterval(() => this.tick(), this.tempoMs);
    }
  }

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

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 0.0;
      this.masterGain.connect(this.audioCtx.destination);

      // Lead voice: sine with per-note envelope.
      this.envGain = this.audioCtx.createGain();
      this.envGain.gain.value = 0.0;
      this.oscillator = this.audioCtx.createOscillator();
      this.oscillator.type = 'sine';
      this.oscillator.connect(this.envGain);
      this.envGain.connect(this.masterGain);

      // Sub voice: one octave below, quiet, sustained.
      this.subGain = this.audioCtx.createGain();
      this.subGain.gain.value = 0.0;
      this.subOscillator = this.audioCtx.createOscillator();
      this.subOscillator.type = 'triangle';
      this.subOscillator.connect(this.subGain);
      this.subGain.connect(this.masterGain);

      this.oscillator.start();
      this.subOscillator.start();
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

    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(0.14, this.audioCtx.currentTime, 0.03);
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
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(0.0, this.audioCtx.currentTime, 0.05);
    }
  }

  private tick(): void {
    if (
      !this.isPlaying ||
      this.orbit.length === 0 ||
      !this.oscillator ||
      !this.subOscillator ||
      !this.envGain ||
      !this.subGain ||
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

    const now = this.audioCtx.currentTime;

    if (this.mode === 'scale') {
      const { freq, name } = this.scaleNote(norm);
      const noteLen = this.tempoMs / 1000;
      this.oscillator.frequency.setValueAtTime(freq, now);
      this.subOscillator.frequency.setValueAtTime(freq / 2, now);

      // Plucked per-note envelope: fast attack, exponential decay.
      this.envGain.gain.cancelScheduledValues(now);
      this.envGain.gain.setValueAtTime(0.0, now);
      this.envGain.gain.linearRampToValueAtTime(0.09, now + 0.008);
      this.envGain.gain.exponentialRampToValueAtTime(0.0001, now + noteLen * 0.85);

      this.subGain.gain.cancelScheduledValues(now);
      this.subGain.gain.setValueAtTime(0.0, now);
      this.subGain.gain.linearRampToValueAtTime(0.02, now + 0.01);
      this.subGain.gain.exponentialRampToValueAtTime(0.0001, now + noteLen * 0.6);

      this.lastNote = name;
    } else {
      const freq = 160 + norm * 940;
      this.oscillator.frequency.setTargetAtTime(freq, now, 0.015);
      this.subOscillator.frequency.setTargetAtTime(freq / 2, now, 0.015);
      this.envGain.gain.cancelScheduledValues(now);
      this.envGain.gain.setTargetAtTime(0.08, now, 0.02);
      this.subGain.gain.cancelScheduledValues(now);
      this.subGain.gain.setTargetAtTime(0.02, now, 0.02);
      this.lastNote = `${freq.toFixed(0)} Hz`;
    }

    this.onNotePlayed?.(this.lastNote);
  }

  /** Quantize a normalized orbit value to the pentatonic minor scale. */
  private scaleNote(norm: number): { freq: number; name: string } {
    const idx = Math.min(SCALE_DEGREES - 1, Math.round(norm * (SCALE_DEGREES - 1)));
    const octave = Math.floor(idx / PENTATONIC_SEMITONES.length);
    const tone = PENTATONIC_SEMITONES[idx % PENTATONIC_SEMITONES.length]!;
    const semitone = tone + 12 * octave;
    const freq = BASE_FREQ * Math.pow(2, semitone / 12);
    const letter = PENTATONIC_NAMES[idx % PENTATONIC_NAMES.length];
    return { freq, name: `${letter}${3 + octave}` };
  }
}
