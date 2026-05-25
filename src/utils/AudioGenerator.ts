/**
 * AudioGenerator - Fractalistische geluidsgeneratie via Web Audio API
 * 
 * Frequentie-mapping: A=432Hz als anker
 *   gematria 10 (Yod) = A4 = 432.00 Hz (exact)
 *   elk gematria stap = 1 semitoon (2^(1/12))
 *   
 *   gematria 1  =  27.14 Hz  (onder gehoordrempel — voor meditatie/void-werk)
 *   gematria 10 = 432.00 Hz  (A4 — ankerpunt)
 *   gematria 22 = 864.00 Hz  (A5 — een octaaf boven anker)
 *   
 *   formule: f(g) = 432 * 2^((g - 10) / 12)
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
  private config: Required<AudioConfig>;

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
      this.masterGain.gain.setValueAtTime(this.config.volume, this.audioContext.currentTime);
      this.masterGain.connect(this.audioContext.destination);
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  // Lydian intervals (432 Hz basis)
  private readonly LYDIA_INTERVALS = [1, 10/9, 5/4, 45/32, 3/2, 5/3, 15/8]

  /**
   * gematria → frequentie via Lydian toonladder
   * De 22 letters = één Lydian octaaf (met herhalingen)
   * gematria 10 (Yod) = C4 = 432 Hz (anker)
   * Wrap alle gematria naar hoorbare range (100-1500 Hz)
   */
  gematriaToFrequency(gematria: number): number {
    const base = 432
    const anchor = 10

    // Bepaal Lydian graad (0-6) via 22-positie
    const positionInCycle = (gematria - 1) % 22
    const degreeFromPos = [0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 0]
    const lydianDegree = degreeFromPos[positionInCycle]

    // Bepaal octaaf relatief aan gematria 10
    const cyclesFromAnchor = (gematria - anchor) / 22
    let freq = base * this.LYDIA_INTERVALS[lydianDegree] * Math.pow(2, cyclesFromAnchor)

    // Wrap naar hoorbare range (100-1500 Hz)
    while (freq > 1500) freq /= 2
    while (freq < 100) freq *= 2

    return freq
  }

  getFrequency(gematria: number): number {
    return this.gematriaToFrequency(gematria);
  }

/** Start een toon die blijft hangen (voor meditatie) */
  startTone(id: string, frequency: number, duration?: number): void {
    const ctx = this.init()
    if (this.oscillators.has(id)) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    // Altijd zuivere sinus voor ontspanning
    osc.type = 'sine'
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)

    // Trage inarming (600ms) — zacht, geleidelijk
    const attackTime = 0.6
    const vol = this.config.volume * 0.8
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + attackTime)

    osc.connect(gain)
    gain.connect(this.masterGain!)
    osc.start()
    this.oscillators.set(id, osc)

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
   * Speel letter als harmonisch akkoord: grondtoon + kwint + octaaf
   * met gestaffelde attack voor een harmony-dronend effect
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

      // Gestaffelde fade-in (50ms vertraging per toon)
      const delay = i * 0.05
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(this.config.volume * (1 - i * 0.2), ctx.currentTime + delay + 0.1)

      osc.connect(gain)
      gain.connect(this.masterGain!)
      osc.start()
      this.oscillators.set(oscId, osc)
    })

    setTimeout(() => this.stopChord(id), duration * 1000)
  }

  /** Speel een enkele toon met specifiek id — ontspannende zuivere golf */
  playToneAt(id: string, frequency: number, duration: number): void {
    const ctx = this.init()
    if (this.oscillators.has(id)) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    // Zuivere sinus voor ontspanning
    osc.type = 'sine'
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)

    // Trage inarming (400ms) voor zachte start
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(this.config.volume * 0.8, ctx.currentTime + 0.4)
    // Langzaam uitfaden (800ms voor het einde)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration - 0.8)

    osc.connect(gain)
    gain.connect(this.masterGain!)
    osc.start()
    this.oscillators.set(id, osc)

    setTimeout(() => this.stopTone(id), duration * 1000 + 200)
  }

  stopChord(id: string): void {
    ;[0, 1, 2].forEach(i => this.stopTone(`${id}_${i}`))
  }

  /** Speel een enkele letter-frequentie */
  playLetter(gematria: number, duration = 3): void {
    const freq = this.gematriaToFrequency(gematria)
    this.startTone(`letter_${gematria}`, freq, duration)
  }

  /** Binaural beat: links baseFreq, rechts baseFreq + beatHz */
  startBinaural(baseFreq: number, beatHz: number): void {
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
    if (!osc) return;
    const ctx = this.audioContext!;
    osc.stop(ctx.currentTime + 0.2);
    this.oscillators.delete(id);
  }

  stopAll(): void {
    this.oscillators.forEach((_, id) => this.stopTone(id));
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