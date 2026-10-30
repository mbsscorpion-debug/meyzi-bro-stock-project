/**
 * Studio Audio Engine for MEYZI BRO STOCK PROJECT
 * Supports real audio playback (MP3, WAV, FLAC, AAC, M4A, OGG)
 * and high-definition Web Audio analysis (Spectrum, Waveform, Frequency Bands, Bass Detection)
 */

export interface AudioBands {
  bass: number;       // 20 - 250 Hz (0 to 1)
  mid: number;        // 250 - 4000 Hz (0 to 1)
  treble: number;     // 4000 - 20000 Hz (0 to 1)
  peak: number;       // Max peak (0 to 1)
  average: number;    // Overall energy (0 to 1)
}

class StudioAudioEngine {
  private ctx: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private analyser: AnalyserNode | null = null;
  private isSynthesizing = false;
  private synthInterval: number | null = null;
  private isPlaying = false;
  private volume = 0.8;
  private bpm = 140;
  private step = 0;
  private listeners: Set<() => void> = new Set();
  private currentTime = 0;
  private duration = 180;
  private timerInterval: number | null = null;
  private onTrackEndedCallback: (() => void) | null = null;
  private currentUrl: string = '';

  constructor() {
    // Lazy initialization
  }

  public initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.82;
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  public setOnTrackEnded(callback: () => void) {
    this.onTrackEndedCallback = callback;
  }

  public playTrack(url?: string, bpm = 140, durationSeconds = 192) {
    this.initContext();
    this.stop(false);

    this.bpm = bpm || 140;
    this.duration = durationSeconds;
    this.currentTime = 0;
    this.currentUrl = url || '';

    // Check if URL is a valid playable audio (blob, http/https, data url, or standard audio extension)
    const hasAudioUrl = Boolean(
      url &&
      (url.startsWith('blob:') ||
       url.startsWith('http') ||
       url.startsWith('data:') ||
       /\.(mp3|wav|flac|aac|m4a|ogg)($|\?)/i.test(url))
    );

    if (hasAudioUrl && url) {
      try {
        this.currentAudio = new Audio();
        this.currentAudio.src = url;
        this.currentAudio.volume = this.volume;
        this.currentAudio.crossOrigin = 'anonymous';

        if (this.ctx && this.analyser) {
          try {
            const source = this.ctx.createMediaElementSource(this.currentAudio);
            source.connect(this.analyser);
            this.analyser.connect(this.ctx.destination);
          } catch {
            // Already connected or browser policy restriction
          }
        }

        this.currentAudio.play().then(() => {
          this.isPlaying = true;
          this.isSynthesizing = false;
          this.notify();
        }).catch((err) => {
          console.warn('Audio play fallback to synth:', err);
          this.startProceduralSynth();
        });

        this.currentAudio.ontimeupdate = () => {
          if (this.currentAudio) {
            this.currentTime = this.currentAudio.currentTime;
            if (this.currentAudio.duration && !isNaN(this.currentAudio.duration)) {
              this.duration = this.currentAudio.duration;
            }
            this.notify();
          }
        };

        this.currentAudio.onended = () => {
          this.isPlaying = false;
          this.notify();
          if (this.onTrackEndedCallback) {
            this.onTrackEndedCallback();
          }
        };

        return;
      } catch {
        this.startProceduralSynth();
      }
    }

    // Default: Procedural studio beat synth
    this.startProceduralSynth();
  }

  private startProceduralSynth() {
    this.isSynthesizing = true;
    this.isPlaying = true;
    this.step = 0;

    const stepDurationMs = (60 / this.bpm / 4) * 1000;

    this.synthInterval = window.setInterval(() => {
      this.playSynthStep(this.step % 16);
      this.step++;
    }, stepDurationMs);

    this.timerInterval = window.setInterval(() => {
      this.currentTime += 0.5;
      if (this.currentTime >= this.duration) {
        this.stop(false);
        if (this.onTrackEndedCallback) {
          this.onTrackEndedCallback();
        }
      } else {
        this.notify();
      }
    }, 500);

    this.notify();
  }

  private playSynthStep(stepIndex: number) {
    if (!this.ctx || !this.isPlaying) return;

    const t = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.4, t);

    if (this.analyser) {
      masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    } else {
      masterGain.connect(this.ctx.destination);
    }

    // 1. Kick on steps 0, 7, 10
    if (stepIndex === 0 || stepIndex === 7 || stepIndex === 10) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.16);
      gain.gain.setValueAtTime(1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.25);
    }

    // 2. Snare on steps 4 and 12
    if (stepIndex === 4 || stepIndex === 12) {
      const bufferSize = this.ctx.sampleRate * 0.1;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1000;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      noise.start(t);
      noise.stop(t + 0.15);
    }

    // 3. Hi-Hat rolls
    if (stepIndex % 2 === 0 || stepIndex === 9 || stepIndex === 15) {
      const bufferSize = this.ctx.sampleRate * 0.04;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 7500;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      noise.start(t);
      noise.stop(t + 0.05);
    }

    // 4. Sub 808
    if (stepIndex === 0) {
      const bass = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(55, t);
      bass.frequency.exponentialRampToValueAtTime(45, t + 0.4);
      bassGain.gain.setValueAtTime(0.85, t);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      bass.connect(bassGain);
      bassGain.connect(masterGain);
      bass.start(t);
      bass.stop(t + 0.55);
    }
  }

  public pause() {
    if (this.currentAudio && !this.isSynthesizing) {
      this.currentAudio.pause();
    }
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isPlaying = false;
    this.notify();
  }

  public resume() {
    this.initContext();
    if (this.isSynthesizing) {
      this.startProceduralSynth();
    } else if (this.currentAudio) {
      this.currentAudio.play().then(() => {
        this.isPlaying = true;
        this.notify();
      }).catch(() => {
        this.startProceduralSynth();
      });
    }
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  public stop(resetTime = true) {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isPlaying = false;
    if (resetTime) {
      this.currentTime = 0;
    }
    this.notify();
  }

  public seek(seconds: number) {
    this.currentTime = Math.max(0, Math.min(seconds, this.duration));
    if (this.currentAudio && !this.isSynthesizing) {
      this.currentAudio.currentTime = this.currentTime;
    }
    this.notify();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume;
    }
    this.notify();
  }

  public getPlaybackState() {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
      volume: this.volume,
      isSynthesizing: this.isSynthesizing,
      currentUrl: this.currentUrl
    };
  }

  public getVisualizerData(arr: Uint8Array) {
    if (this.analyser && this.isPlaying) {
      this.analyser.getByteFrequencyData(arr as Uint8Array<ArrayBuffer>);
    } else {
      arr.fill(0);
    }
  }

  public getWaveformData(arr: Uint8Array) {
    if (this.analyser && this.isPlaying) {
      this.analyser.getByteTimeDomainData(arr as Uint8Array<ArrayBuffer>);
    } else {
      arr.fill(128); // 128 is center/flat wave
    }
  }

  public getBandsEnergy(): AudioBands {
    if (!this.analyser || !this.isPlaying) {
      return { bass: 0, mid: 0, treble: 0, peak: 0, average: 0 };
    }

    const buffer = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(buffer as Uint8Array<ArrayBuffer>);

    // Low bins (0 - 6): Bass 20 - 250 Hz
    let bassSum = 0;
    for (let i = 0; i < 7; i++) {
      bassSum += buffer[i];
    }
    const bass = bassSum / (7 * 255);

    // Mid bins (7 - 35): Mid 250 - 4000 Hz
    let midSum = 0;
    for (let i = 7; i < 36; i++) {
      midSum += buffer[i];
    }
    const mid = midSum / (29 * 255);

    // Treble bins (36 - 128): Treble 4000 - 20000 Hz
    let trebleSum = 0;
    for (let i = 36; i < buffer.length; i++) {
      trebleSum += buffer[i];
    }
    const treble = trebleSum / ((buffer.length - 36) * 255);

    let peak = 0;
    let totalSum = 0;
    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] > peak) peak = buffer[i];
      totalSum += buffer[i];
    }

    return {
      bass,
      mid,
      treble,
      peak: peak / 255,
      average: totalSum / (buffer.length * 255)
    };
  }
}

export const studioAudio = new StudioAudioEngine();
