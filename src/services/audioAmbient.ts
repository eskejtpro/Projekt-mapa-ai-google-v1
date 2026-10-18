// Generator nastrojowego tła dźwiękowego przy użyciu natywnego Web Audio API
// Bez konieczności pobierania plików MP3 z sieci - 100% offline, czysta synteza proceduralna

export type AmbientSoundTrack = 'ocean' | 'forest' | 'campfire' | 'crickets' | 'synthPad' | 'none';

class AmbientSoundEngine {
  private audioCtx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTrack: AmbientSoundTrack = 'none';
  private masterGain: GainNode | null = null;
  private volumeLevel: number = 0.5; // Domyślnie 50% głośności
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];
  private timers: number[] = [];

  private initContext(): AudioContext | null {
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    }
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(this.volumeLevel * 0.15, ctx.currentTime);
      gain.connect(ctx.destination);
      this.masterGain = gain;
      this.audioCtx = ctx;
      return ctx;
    } catch (e) {
      console.warn('Web Audio API niedostępne lub zablokowane:', e);
      return null;
    }
  }

  public setVolume(volume: number) {
    this.volumeLevel = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.audioCtx) {
      try {
        this.masterGain.gain.setValueAtTime(this.volumeLevel * 0.15, this.audioCtx.currentTime);
      } catch {
        // Ignoruj jeśli kontekst jest nieaktywny
      }
    }
  }

  public getVolume(): number {
    return this.volumeLevel;
  }

  public getCurrentTrack(): AmbientSoundTrack {
    return this.currentTrack;
  }

  public playTrack(track: AmbientSoundTrack) {
    if (track === 'none') {
      this.stop();
      return;
    }

    if (this.isPlaying && this.currentTrack === track) return;

    this.stopImmediate();

    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    this.isPlaying = true;
    this.currentTrack = track;

    switch (track) {
      case 'ocean':
        this.createOceanSound(ctx, this.masterGain);
        break;
      case 'forest':
        this.createForestSound(ctx, this.masterGain);
        break;
      case 'campfire':
        this.createCampfireSound(ctx, this.masterGain);
        break;
      case 'crickets':
        this.createCricketsSound(ctx, this.masterGain);
        break;
      case 'synthPad':
        this.createSynthPadSound(ctx, this.masterGain);
        break;
    }
  }

  // Domyślny start dla kompatybilności wstecznej
  public startOceanAmbient() {
    this.playTrack('ocean');
  }

  // 1. Szum Oceanu i fal
  private createOceanSound(ctx: AudioContext, destination: GainNode) {
    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(180, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    whiteNoise.connect(filter);
    filter.connect(destination);

    whiteNoise.start();
    lfo.start();

    this.activeNodes.push(whiteNoise, lfo, filter, lfoGain);
  }

  // 2. Szum Lasu i delikatny wiatr
  private createForestSound(ctx: AudioContext, destination: GainNode) {
    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
    }

    const wind = ctx.createBufferSource();
    wind.buffer = noiseBuffer;
    wind.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(450, ctx.currentTime);
    bandpass.Q.setValueAtTime(1.5, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(150, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);

    wind.connect(bandpass);
    bandpass.connect(destination);

    wind.start();
    lfo.start();

    this.activeNodes.push(wind, lfo, bandpass, lfoGain);
  }

  // 3. Trzaskający kominek i ogień obozowy
  private createCampfireSound(ctx: AudioContext, destination: GainNode) {
    // Ciągły szum żaru
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.08;
    }

    const fireBase = ctx.createBufferSource();
    fireBase.buffer = noiseBuffer;
    fireBase.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, ctx.currentTime);

    fireBase.connect(filter);
    filter.connect(destination);
    fireBase.start();

    this.activeNodes.push(fireBase, filter);

    // Proceduralne trzaski drewna (losowe impulsy)
    const crackleInterval = window.setInterval(() => {
      if (!this.isPlaying || !this.audioCtx || this.currentTrack !== 'campfire') return;
      try {
        const osc = this.audioCtx.createOscillator();
        const crackGain = this.audioCtx.createGain();
        const now = this.audioCtx.currentTime;

        osc.frequency.setValueAtTime(600 + Math.random() * 1200, now);
        crackGain.gain.setValueAtTime(0.04 * this.volumeLevel, now);
        crackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03 + Math.random() * 0.05);

        osc.connect(crackGain);
        crackGain.connect(destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } catch {
        // Ignoruj
      }
    }, 120 + Math.random() * 250);

    this.timers.push(crackleInterval);
  }

  // 4. Letnie cykady
  private createCricketsSound(ctx: AudioContext, destination: GainNode) {
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(4.5, ctx.currentTime); // rytm cykady

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.02, ctx.currentTime);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(4600, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.015, ctx.currentTime);

    lfo.connect(gainNode.gain);
    osc.connect(gainNode);
    gainNode.connect(destination);

    osc.start();
    lfo.start();

    this.activeNodes.push(osc, lfo, lfoGain, gainNode);
  }

  // 5. Spokojny pad syntezatorowy (Ambient Harmony)
  private createSynthPadSound(ctx: AudioContext, destination: GainNode) {
    // Akord molowy 7 (C - Eb - G - Bb) łagodnie przefiltrowany
    const freqs = [130.81, 155.56, 196.00, 233.08];
    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.025, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const detuneOsc = ctx.createOscillator();
      detuneOsc.type = 'sine';
      detuneOsc.frequency.setValueAtTime(freq * 1.002, ctx.currentTime);

      osc.connect(filter);
      detuneOsc.connect(filter);

      osc.start();
      detuneOsc.start();

      this.activeNodes.push(osc, detuneOsc);
    });

    filter.connect(padGain);
    padGain.connect(destination);
    this.activeNodes.push(filter, padGain);
  }

  private stopImmediate() {
    this.timers.forEach(t => clearInterval(t));
    this.timers = [];
    this.activeNodes.forEach(node => {
      try {
        node.stop?.();
        node.disconnect?.();
      } catch {
        // Ignoruj
      }
    });
    this.activeNodes = [];
  }

  public stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.currentTrack = 'none';

    try {
      if (this.masterGain && this.audioCtx) {
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.8);
      }
      setTimeout(() => {
        this.stopImmediate();
      }, 900);
    } catch {
      this.stopImmediate();
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.playTrack('ocean');
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const ambientSound = new AmbientSoundEngine();
