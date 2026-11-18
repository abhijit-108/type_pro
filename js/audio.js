/**
 * Typing Boss - Sound Synthesizer (Web Audio API)
 * Synthesizes realistic mechanical keyboard clicks, typewriter sounds,
 * and error/completion audio without requiring any external MP3 files.
 */

class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.volume = 0.35;
    this.soundTheme = 'mechanical'; // 'mechanical' | 'typewriter' | 'soft' | 'off'
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playKeypress(isSpace = false) {
    if (this.muted || this.soundTheme === 'off') return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Randomize pitch slightly to simulate tactile variety
    const pitchJitter = 0.92 + Math.random() * 0.16;

    if (this.soundTheme === 'typewriter') {
      // Crisp metallic typewriter impact
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isSpace ? 600 * pitchJitter : 1400 * pitchJitter, t);
      filter.Q.setValueAtTime(4.0, t);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isSpace ? 220 * pitchJitter : 480 * pitchJitter, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.04);

      gain.gain.setValueAtTime(this.volume * 0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    } else if (this.soundTheme === 'soft') {
      // Soft laptop chiclet thud
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800 * pitchJitter, t);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isSpace ? 150 : 260 * pitchJitter, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.035);

      gain.gain.setValueAtTime(this.volume * 0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    } else {
      // Mechanical blue/brown switch click
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1200 * pitchJitter, t);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(isSpace ? 350 * pitchJitter : 750 * pitchJitter, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.025);

      gain.gain.setValueAtTime(this.volume * 0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  playError() {
    if (this.muted || this.soundTheme === 'off') return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.12);

    gain.gain.setValueAtTime(this.volume * 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const t = this.ctx.currentTime;

    chords.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0, t);
      gain.gain.setValueAtTime(this.volume * 0.5, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.4);
    });
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

export const sound = new SoundController();
