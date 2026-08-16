import type { BifurcationModel } from '../math/models/BaseModel.js';

// ─── Musical scales (semitone offsets from root, 2 octaves) ───────────

const BASE_FREQ = 220; // A3

const SCALE_MAP: Record<string, number[]> = {
  pentatonicMinor: [0, 3, 5, 7, 10],
  pentatonicMajor: [0, 2, 4, 7, 9],
  naturalMinor: [0, 2, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  blues: [0, 3, 5, 6, 7, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  chords: [0, 4, 7, 12, 16, 19], // E minor + A minor triads
  glissando: [], // continuous mode
};

const NOTE_NAMES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

// ─── Style presets ───────────────────────────────────────────────────

export interface StylePreset {
  id: string;
  name: string;
  scale: string;
  tempoMs: number;
  dynamics: boolean;
  subGain: number; // warmth: higher = more sub
}

const PRESETS: StylePreset[] = [
  { id: 'melancholic', name: 'Melancólica (Einaudi)', scale: 'naturalMinor', tempoMs: 140, dynamics: true, subGain: 0.03 },
  { id: 'classic', name: 'Clásica (Beethoven)', scale: 'naturalMinor', tempoMs: 100, dynamics: true, subGain: 0.02 },
  { id: 'serenade', name: 'Serenata (Debussy)', scale: 'lydian', tempoMs: 200, dynamics: true, subGain: 0.015 },
];

// ─── Dynamics by Lyapunov ────────────────────────────────────────────

function dynamicsFromLyapunov(lambda: number): number {
  if (lambda < -0.5) return 0.03;
  if (lambda < 0) return 0.05;
  if (lambda < 0.05) return 0.07;
  return 0.10;
}

// ─── Sonifier class ──────────────────────────────────────────────────

export type MusicalMode = keyof typeof SCALE_MAP;

export class Sonifier {
  private model: BifurcationModel | null = null;
  private r = 3.0;
  private orbit: number[] = [];

  // Audio nodes
  private audioCtx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null; // 2nd harmonic
  private subOsc: OscillatorNode | null = null;
  private envGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private subGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  // State
  private stepIndex = 0;
  private timerId: number | null = null;
  private _musicalMode: MusicalMode = 'pentatonicMinor';
  private _dynamicsOn = true;
  private _subWarmth = 0.02;

  isPlaying = false;
  tempoMs = 140;
  lastNote = '—';
  lastFreq = 0;
  lastDynamics = '';
  onNotePlayed?: (note: string) => void;

  // Scale cache
  private builtScale: number[] = [];

  // ── Getters/Setters ──────────────────────────────────────────────

  get musicalMode(): MusicalMode { return this._musicalMode; }
  set musicalMode(mode: MusicalMode) {
    this._musicalMode = mode;
    this.buildScaleCache();
  }

  get dynamicsEnabled(): boolean { return this._dynamicsOn; }
  set dynamicsEnabled(v: boolean) { this._dynamicsOn = v; }

  // ── Scale builder ────────────────────────────────────────────────

  private buildScaleCache(): void {
    const semitones = SCALE_MAP[this._musicalMode]!;
    if (!semitones || semitones.length === 0) {
      this.builtScale = [];
      return;
    }
    const notes: number[] = [];
    for (let oct = 3; oct <= 5; oct++) {
      for (const s of semitones) {
        notes.push(BASE_FREQ * Math.pow(2, (s + (oct - 3) * 12) / 12));
      }
    }
    this.builtScale = notes;
  }

  // ── Public API ───────────────────────────────────────────────────

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

  setTempo(ms: number): void {
    this.tempoMs = Math.max(40, Math.min(600, ms));
    if (this.isPlaying && this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = window.setInterval(() => this.tick(), this.tempoMs);
    }
  }

  applyPreset(presetId: string): void {
    const p = PRESETS.find((pr) => pr.id === presetId);
    if (!p) return;
    this._musicalMode = p.scale as MusicalMode;
    this.tempoMs = p.tempoMs;
    this._dynamicsOn = p.dynamics;
    this._subWarmth = p.subGain;
    this.buildScaleCache();
    if (this.isPlaying && this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = window.setInterval(() => this.tick(), this.tempoMs);
    }
  }

  togglePlay(): boolean {
    if (this.isPlaying) { this.stop(); } else { this.start(); }
    return this.isPlaying;
  }

  start(): void {
    this.initAudio();
    this.isPlaying = true;
    this.buildScaleCache();
    this.setR(this.r);
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(0.08, this.audioCtx.currentTime, 0.03);
    }
    this.stepIndex = 0;
    if (this.timerId !== null) window.clearInterval(this.timerId);
    this.timerId = window.setInterval(() => this.tick(), this.tempoMs);
  }

  stop(): void {
    this.isPlaying = false;
    if (this.timerId !== null) { window.clearInterval(this.timerId); this.timerId = null; }
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(0.0, this.audioCtx.currentTime, 0.05);
    }
  }

  // ── Audio initialization (piano-like synth) ──────────────────────

  private initAudio(): void {
    if (this.audioCtx) { if (this.audioCtx.state === 'suspended') void this.audioCtx.resume(); return; }
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    this.audioCtx = new Ctx();

    // Master gain
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.audioCtx.destination);

    // Envelope gain (per-note shape)
    this.envGain = this.audioCtx.createGain();
    this.envGain.gain.value = 0;
    this.envGain.connect(this.masterGain);

    // High-shelf filter for piano brightness
    this.filter = this.audioCtx.createBiquadFilter();
    this.filter.type = 'highshelf';
    this.filter.frequency.value = 3000;
    this.filter.gain.value = 8;
    this.filter.connect(this.envGain);

    // Lead oscillator (sine)
    this.osc = this.audioCtx.createOscillator();
    this.osc.type = 'sine';
    this.osc.connect(this.filter);
    this.osc.start();

    // 2nd harmonic (triangle, low gain for warmth)
    this.osc2 = this.audioCtx.createOscillator();
    this.osc2.type = 'triangle';
    const osc2Gain = this.audioCtx.createGain();
    osc2Gain.gain.value = 0.12;
    this.osc2.connect(osc2Gain);
    osc2Gain.connect(this.envGain);
    this.osc2.start();

    // Sub oscillator (triangle, octave below)
    this.subGain = this.audioCtx.createGain();
    this.subGain.gain.value = 0.02;
    this.subOsc = this.audioCtx.createOscillator();
    this.subOsc.type = 'triangle';
    this.subOsc.connect(this.subGain);
    this.subGain.connect(this.masterGain);
    this.subOsc.start();

    if (this.audioCtx.state === 'suspended') void this.audioCtx.resume();
  }

  // ── Tick: map orbit → note ───────────────────────────────────────

  private tick(): void {
    if (!this.isPlaying || !this.osc || !this.osc2 || !this.envGain || !this.subGain || !this.audioCtx || !this.model || !this.masterGain) return;

    const rawVal = this.orbit[this.stepIndex % this.orbit.length] ?? 0;
    this.stepIndex++;

    const xMin = this.model.xRange.min;
    const xMax = this.model.xRange.max;
    const norm = Math.max(0, Math.min(1, (rawVal - xMin) / (xMax - xMin)));

    const now = this.audioCtx.currentTime;
    const noteLen = this.tempoMs / 1000;

    let freq: number;
    let noteName: string;

    if (this.builtScale.length > 0) {
      // Quantize to nearest note in the scale
      const idx = Math.min(this.builtScale.length - 1, Math.round(norm * (this.builtScale.length - 1)));
      freq = this.builtScale[idx] ?? 220;
      // Convert to note name
      const scale = SCALE_MAP[this._musicalMode]!;
      const octave = 3 + Math.floor(idx / scale.length);
      const noteIdx = idx % scale.length;
      noteName = NOTE_NAMES[(scale[noteIdx]! + 9) % 12]! + octave;
    } else {
      // Glissando continuous
      freq = 160 + norm * 940;
      noteName = `${freq.toFixed(0)} Hz`;
    }

    // Oscillators
    this.osc.frequency.setValueAtTime(freq, now);
    this.osc2.frequency.setValueAtTime(freq * 2, now);
    this.subOsc?.frequency.setValueAtTime(freq / 2, now);

    // Dynamics from Lyapunov
    const lambda = this.model.computeLyapunov(this.r, 200, 100);
    const dynGain = this._dynamicsOn ? dynamicsFromLyapunov(lambda) : 0.06;
    this.lastDynamics = lambda < -0.5 ? 'p' : lambda < 0 ? 'mp' : lambda < 0.05 ? 'mf' : 'f';

    // Sub warmth
    if (this.subGain) this.subGain.gain.setTargetAtTime(this._subWarmth, now, 0.01);

    // Envelope: per-note pluck shape
    this.envGain.gain.cancelScheduledValues(now);
    this.envGain.gain.setValueAtTime(0.0, now);
    this.envGain.gain.linearRampToValueAtTime(dynGain * 1.2, now + 0.008);
    this.envGain.gain.exponentialRampToValueAtTime(dynGain * 0.6, now + noteLen * 0.4);
    this.envGain.gain.exponentialRampToValueAtTime(0.0001, now + noteLen * 0.95);

    // Update indicator
    this.lastNote = noteName;
    this.lastFreq = Math.round(freq);
    this.onNotePlayed?.(`${noteName} · ${Math.round(freq)} Hz · ${this.lastDynamics}`);
  }
}
