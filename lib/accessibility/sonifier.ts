/**
 * Real-Time Algorithmic Audio Sonification Engine
 * Issue #1069 — lib/accessibility/sonifier.ts
 *
 * Byte Frequency Mapping: f(b) = f_base * 2^(b / 255 * k)
 *   f_base = 200 Hz, k = log2(10) ≈ 3.32  →  range: [200 Hz – 2000 Hz]
 *
 * Avalanche Dissonance: Hamming distance → polyphonic chord intervals
 *   Low  dH [0–32]    → Consonant Major Triad    (1 : 1.25 : 1.5)
 *   Mid  dH [33–64]   → Minor Triad              (1 : 1.2  : 1.5)
 *   High dH [65–128]  → Dissonant Tritone Cluster (1 : √2 : 16/9 : 2)
 */

export type ChordType = 'consonant' | 'minor' | 'dissonant';

export interface SonifierConfig {
  /** Base frequency in Hz. Default: 200 */
  baseFrequency?: number;
  /** Octave span. Default: log2(10) ≈ 3.32 → maps to ~2000 Hz max */
  octaves?: number;
  /** Oscillator waveform. Default: 'sine' */
  oscillatorType?: OscillatorType;
  /** Single note duration in seconds. Default: 0.3 */
  noteDuration?: number;
  /** Master volume (0–1). Default: 0.3 */
  masterVolume?: number;
  /** Arpeggiation delay between notes in seconds. Default: 0.02 */
  arpDelay?: number;
}

const DEFAULT_CONFIG: Required<SonifierConfig> = {
  baseFrequency: 200,
  octaves: Math.log2(10), // 200 * 2^3.32 ≈ 2000 Hz
  oscillatorType: 'sine',
  noteDuration: 0.3,
  masterVolume: 0.3,
  arpDelay: 0.02,
};

export class CryptoSonifier {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private config: Required<SonifierConfig>;
  private enabled = false;

  constructor(config: SonifierConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** Must be called after a user gesture to satisfy browser autoplay policy */
  init(): void {
    if (this.audioContext) return;
    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.setValueAtTime(
      this.config.masterVolume,
      this.audioContext.currentTime,
    );
    this.masterGain.connect(this.audioContext.destination);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (enabled && !this.audioContext) {
      this.init();
    }
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setValueAtTime(
        enabled ? this.config.masterVolume : 0,
        this.audioContext.currentTime,
      );
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * f(b) = f_base * 2^(b / 255 * k)
   * Maps a byte value [0–255] to a frequency in [200 Hz – 2000 Hz]
   */
  byteToFrequency(byte: number): number {
    const b = Math.max(0, Math.min(255, Math.round(byte)));
    return this.config.baseFrequency * Math.pow(2, (b / 255) * this.config.octaves);
  }

  /**
   * Play arpeggiated tone for a mutated byte during SubBytes / S-Box step.
   * @param byte  - Substituted byte value [0–255]
   * @param index - Position in state matrix [0–15] for staggered timing
   */
  playByteMutation(byte: number, index: number): void {
    if (!this.enabled || !this.audioContext || !this.masterGain) return;
    const frequency = this.byteToFrequency(byte);
    const startOffset = (index % 16) * this.config.arpDelay;
    this._playTone(frequency, startOffset, this.config.noteDuration);
  }

  /**
   * Classify Hamming distance into chord dissonance type.
   */
  classifyDissonance(hammingDistance: number): ChordType {
    if (hammingDistance <= 32) return 'consonant';
    if (hammingDistance <= 64) return 'minor';
    return 'dissonant';
  }

  /**
   * Play polyphonic chord reflecting avalanche diffusion severity.
   * @param hammingDistance - dH(St, St+1) bit-flip count
   */
  playAvalancheChord(hammingDistance: number): void {
    if (!this.enabled || !this.audioContext || !this.masterGain) return;
    const chordType = this.classifyDissonance(hammingDistance);
    const baseFreq = this.byteToFrequency(Math.min(255, hammingDistance * 2));
    const intervals = this._getChordIntervals(chordType);

    intervals.forEach((ratio, i) => {
      this._playTone(
        baseFreq * ratio,
        i * this.config.arpDelay,
        this.config.noteDuration * 1.5,
      );
    });
  }

  /** Frequency ratio intervals for each chord type */
  private _getChordIntervals(type: ChordType): number[] {
    switch (type) {
      case 'consonant':
        return [1, 1.25, 1.5];
      case 'minor':
        return [1, 1.2, 1.5];
      case 'dissonant':
        return [1, Math.SQRT2, 1.778, 2];
    }
  }

  /** Schedule a single oscillator with ADSR envelope */
  private _playTone(frequency: number, startOffset: number, duration: number): void {
    if (!this.audioContext || !this.masterGain) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime + startOffset;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = this.config.oscillatorType;
    oscillator.frequency.setValueAtTime(frequency, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.02);
    gainNode.gain.setValueAtTime(0.5, now + Math.max(0, duration - 0.05));
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(now);
    oscillator.stop(now + duration);

    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
  }

  /** Gracefully close the AudioContext and release resources */
  dispose(): void {
    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
      this.masterGain = null;
    }
    this.enabled = false;
  }
}
