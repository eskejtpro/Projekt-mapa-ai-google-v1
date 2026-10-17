// Generator łagodnego tła dźwiękowego przy użyciu natywnego Web Audio API
// Bez konieczności pobierania plików MP3 z sieci - 100% offline

class AmbientSoundEngine {
  private audioCtx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private gainNode: GainNode | null = null;
  private timer: number | null = null;

  public startOceanAmbient() {
    if (this.isPlaying) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      
      const masterGain = this.audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      masterGain.connect(this.audioCtx.destination);
      this.gainNode = masterGain;

      // Szum różowy/brązowy do symulacji fal oceanu
      const bufferSize = this.audioCtx.sampleRate * 3;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filtr dolnoprzepustowy imitujący fale
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, this.audioCtx.currentTime);

      // Oscylator LFO do modulacji odgłosu fal (fale przypływają i odpływają)
      const lfo = this.audioCtx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, this.audioCtx.currentTime); // cykl ~8 sekund
      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.setValueAtTime(180, this.audioCtx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      whiteNoise.connect(filter);
      filter.connect(masterGain);

      whiteNoise.start();
      lfo.start();

      this.isPlaying = true;
    } catch (e) {
      console.warn('Web Audio API niedostępne lub zablokowane:', e);
    }
  }

  public stop() {
    if (!this.isPlaying || !this.audioCtx) return;
    try {
      if (this.gainNode) {
        this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 1.5);
      }
      setTimeout(() => {
        this.audioCtx?.close();
        this.audioCtx = null;
        this.gainNode = null;
        this.isPlaying = false;
      }, 1600);
    } catch {
      this.audioCtx = null;
      this.isPlaying = false;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.startOceanAmbient();
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const ambientSound = new AmbientSoundEngine();
