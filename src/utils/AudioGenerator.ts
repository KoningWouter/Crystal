/**
 * AudioGenerator - Fractalist sound generation via Web Audio API
 * 
 * Frequency mapping: A=432Hz as anchor
 *   gematria 10 (Yod) = A4 = 432.00 Hz (exact)
 *   each gematria step = 1 semitone (2^(1/12))
 *   
 *   gematria 1  =  27.14 Hz  (below hearing threshold — for meditation/void work)
 *   gematria 10 = 432.00 Hz  (A4 — anchor point)
 *   gematria 22 = 864.00 Hz  (A5 — one octave above anchor)
 *   
 *   formula: f(g) = 432 * 2^((g - 10) / 12)
 */

export interface AudioConfig {
  baseFrequency?: number;
  ratio?: number;
  waveType?: OscillatorType;
  volume?: number;
  gematriaAnchor?: number;
}

export type MeditationPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const PHASE_FREQUENCIES: Record<MeditationPhase, number[]> = {
  inhale: [174, 285, 396],
  hold:   [417, 528, 639],
  exhale: [741, 852, 963],
  rest:   [432],
};

export class AudioGenerator {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: Map<string, OscillatorNode> = new Map();
  private gains: Map<string, GainNode> = new Map();
  private config: Required<AudioConfig>;
  // Saved state for tab-resume
  private savedBinaural: { base: number; beat: number } | null = null;
  private savedTones: Array<{ id: string; frequency: number }> = [];

  constructor(config: AudioConfig = {}) {
    this.config = {
      baseFrequency: config.baseFrequency ?? 432,   // A4 = 432 Hz (anker)
      ratio: config.ratio ?? Math.pow(2, 1/12),     // 2^(1/12) = semitoon
      waveType: config.waveType ?? 'sine',
      volume: config.volume ?? 0.3,
      gematriaAnchor: config.gematriaAnchor ?? 10,  // Yod = gematria 10 = A4
    };
  }

  init(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.setValueAtTime(this.config.volume, this.audioContext.currentTime);
    }
    // If context was suspended (tab switch), resume and restart all audio
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        if (this.savedBinaural) {
          this.startBinaural(this.savedBinaural.base, this.savedBinaural.beat, false);
        }
        // Restore any hanging tones (for meditation/multi-tone sessions)
        this.savedTones.forEach(t => {
          this.startTone(t.id, t.frequency);
        });
      });
    } else if (this.audioContext.state === 'closed') {
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.setValueAtTime(this.config.volume, this.audioContext.currentTime);
      this.oscillators.clear();
      this.gains.clear();
    }
    return this.audioContext;
  }

  /**
   * gematria → frequency mapping
   * gematria 10 (Yod) = A4 = 432 Hz (anchor)
   * Each gematria step = 1 semitone
   * 22 letters = Lydian octave cycle
   * Wrap all to audible range (150-1500 Hz)
   */
  gematriaToFrequency(gematria: number): number {
    // Yod (gematria 10) = A4 = 432 Hz
    const anchor = 10
    const A4 = 432
    // Semitone from A4
    let freq = A4 * Math.pow(2, (gematria - anchor) / 12)
    // Wrap to comfortable hearing range
    while (freq > 1500) freq /= 2
    while (freq < 150) freq *= 2
    return freq
  }

  getFrequency(gematria: number): number {
    return this.gematriaToFrequency(gematria);
  }

  /** Start a tone that hangs (for meditation) */
  startTone(id: string, frequency: number, duration?: number): void {
    const ctx = this.init()
    if (this.oscillators.has(id)) return

    // Save for tab-resume restoration
    if (!duration) {
      this.savedTones = this.savedTones.filter(t => t.id !== id)
      this.savedTones.push({ id, frequency })
    }

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    // Always pure sine for relaxation
    osc.type = 'sine'
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)

    // Slow fade-in (600ms) — soft, gradual
    const attackTime = 0.6
    const vol = this.config.volume * 0.8
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + attackTime)

    osc.connect(gain)
    gain.connect(this.masterGain!)
    osc.start()
    this.oscillators.set(id, osc)
    this.gains.set(id, gain)

    if (duration) {
      const fadeStart = duration - 1.0
      gain.gain.setValueAtTime(vol, ctx.currentTime + fadeStart)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)
      setTimeout(() => this.stopTone(id), duration * 1000 + 100)
    }
  }

  startChord(id: string, frequencies: number[]): void {
    frequencies.forEach((freq, i) => {
      this.startTone(`${id}_${i}`, freq);
    });
  }

  startPhase(phase: MeditationPhase): void {
    this.stopAll();
    const freqs = PHASE_FREQUENCIES[phase];
    freqs.forEach((freq, i) => {
      this.startTone(`phase_${phase}_${i}`, freq);
    });
  }

  /**
   * Play letter as harmonic chord: fundamental + quint + octave
   * with staggered attack for a harmony-drunk effect
   */
  playLetterChordAt(id: string, frequency: number, duration: number): void {
    const ctx = this.init()
    const chord = [frequency, frequency * 1.5, frequency * 2]

    chord.forEach((freq, i) => {
      const oscId = `${id}_${i}`
      if (this.oscillators.has(oscId)) return

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = this.config.waveType
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      // Staggered fade-in (50ms delay per tone)
      const delay = i * 0.05
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(this.config.volume * (1 - i * 0.2), ctx.currentTime + delay + 0.1)

      osc.connect(gain)
      gain.connect(this.masterGain!)
      osc.start()
      this.oscillators.set(oscId, osc)
      this.gains.set(oscId, gain)
    })

    setTimeout(() => this.stopChord(id), duration * 1000)
  }

  /** Play a single tone with specific id — relaxing pure wave */
  playToneAt(id: string, frequency: number, duration: number): void {
    const ctx = this.init()
    if (this.oscillators.has(id)) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    // Pure sine for relaxation
    osc.type = 'sine'
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)

    // Slow fade-in (400ms) for soft start
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(this.config.volume * 0.8, ctx.currentTime + 0.4)
    // Slow fade-out (800ms before the end)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration - 0.8)

    osc.connect(gain)
    gain.connect(this.masterGain!)
    osc.start()
    this.oscillators.set(id, osc)
    this.gains.set(id, gain)

    setTimeout(() => this.stopTone(id), duration * 1000 + 200)
  }

  stopChord(id: string): void {
    ;[0, 1, 2].forEach(i => this.stopTone(`${id}_${i}`))
  }

  /** Play a single letter frequency */
  playLetter(gematria: number, duration = 3): void {
    const freq = this.gematriaToFrequency(gematria)
    this.startTone(`letter_${gematria}`, freq, duration)
  }

  /** Binaural beat: links baseFreq, rechts baseFreq + beatHz */
  startBinaural(baseFreq: number, beatHz: number, restart = true): void {
    if (restart) {
      this.stopAll();
    }
    // Save state so init() can resume after tab switch
    this.savedBinaural = { base: baseFreq, beat: beatHz };
    const ctx = this.init();

    const makeChannel = (freq: number, pan: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(this.config.volume * 0.5, ctx.currentTime);
      panner.pan.setValueAtTime(pan, ctx.currentTime);

      osc.connect(gain);
      gain.connect(panner);
      panner.connect(this.masterGain!);
      osc.start();
      return osc;
    };

    this.oscillators.set('binaural_left', makeChannel(baseFreq, -1));
    this.oscillators.set('binaural_right', makeChannel(baseFreq + beatHz, 1));
  }

  stopTone(id: string): void {
    const osc = this.oscillators.get(id);
    const gain = this.gains.get(id);
    if (!osc || !this.audioContext) return;
    const ctx = this.audioContext;

    if (gain) {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.25);
      setTimeout(() => {
        try { osc.stop(now + 0.3); } catch (_) {}
      }, 280);
    } else {
      try { osc.stop(ctx.currentTime + 0.02); } catch (_) {}
    }

    this.oscillators.delete(id);
    this.gains.delete(id);
  }

  stopAll(): void {
    if (!this.audioContext || !this.masterGain) return;
    const ctx = this.audioContext;

    // Immediately cancel any in-progress ramp and reset to full volume
    this.masterGain.gain.cancelScheduledValues(ctx.currentTime);
    this.masterGain.gain.setValueAtTime(this.config.volume, ctx.currentTime);

    // Stop ALL oscillators immediately (no fade — full stop)
    this.oscillators.forEach((osc, id) => {
      try {
        osc.stop(ctx.currentTime);
      } catch (_) {}
      const gain = this.gains.get(id)
      if (gain) {
        gain.gain.cancelScheduledValues(ctx.currentTime)
        gain.gain.setValueAtTime(0, ctx.currentTime)
      }
    });

    this.oscillators.clear();
    this.gains.clear();

    // Clear saved state — don't restore old tones after session ends
    this.savedTones = [];
    this.savedBinaural = null;
  }

  setVolume(vol: number): void {
    this.config.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setValueAtTime(this.config.volume, this.audioContext.currentTime);
    }
  }

  fadeTo(targetVol: number, durationSec: number): void {
    if (!this.masterGain || !this.audioContext) return;
    this.masterGain.gain.linearRampToValueAtTime(targetVol, this.audioContext.currentTime + durationSec);
  }

  get currentTime(): number {
    return this.audioContext?.currentTime ?? 0;
  }

  destroy(): void {
    this.stopAll();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.masterGain = null;
    this.gains.clear();
  }
}

let sharedGenerator: AudioGenerator | null = null;

export function getAudioGenerator(config?: AudioConfig): AudioGenerator {
  if (!sharedGenerator) {
    sharedGenerator = new AudioGenerator(config);
  }
  return sharedGenerator;
}

export default AudioGenerator;