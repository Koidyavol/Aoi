/**
 * Procedural Web Audio Synth for Avatar Online Indonesia (AOI)
 * Pure Web Audio API: 100% offline, zero asset loading delay, nostalgic 8-bit/16-bit Java retro vibe.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private bgmOscs: OscillatorNode[] = [];
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isBgmPlaying = false;
  private bgmTimer: number | null = null;
  public bgmMuted = false;
  public sfxMuted = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.bgmGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.bgmGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      this.bgmGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public ensureAudio() {
    this.initContext();
    if (!this.isBgmPlaying && !this.bgmMuted) {
      this.startBgm();
    }
  }

  public toggleBgm(enabled?: boolean) {
    this.initContext();
    this.bgmMuted = enabled !== undefined ? !enabled : !this.bgmMuted;
    if (this.bgmMuted) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    return !this.bgmMuted;
  }

  public toggleSfx(enabled?: boolean) {
    this.sfxMuted = enabled !== undefined ? !enabled : !this.sfxMuted;
    return !this.sfxMuted;
  }

  // --- Retro Sound FX ---

  public playClick() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public playStep() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  public playCoin() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playHarvest() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.26);
    });
  }

  public playWater() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    // Filtered noise pop for water splash
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    whiteNoise.start();
  }

  public playFishAlert() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playFishSuccess() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  }

  public playDiceRoll() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Series of quick wooden clicks
    for (let i = 0; i < 6; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.06 + Math.random() * 0.02;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300 + Math.random() * 200, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.04);
    }
  }

  public playChatPop() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // --- Nostalgic AOI Procedural Chiptune BGM ---

  private startBgm() {
    if (this.isBgmPlaying || this.bgmMuted) return;
    this.initContext();
    if (!this.ctx || !this.bgmGain) return;

    this.isBgmPlaying = true;

    // Iconic cute peaceful Java world melody loop (pentatonic upbeat retro feel)
    const melody = [
      { note: 523.25, dur: 0.25 }, // C5
      { note: 659.25, dur: 0.25 }, // E5
      { note: 783.99, dur: 0.25 }, // G5
      { note: 880.00, dur: 0.25 }, // A5
      { note: 1046.50, dur: 0.50 }, // C6
      { note: 880.00, dur: 0.25 },  // A5
      { note: 783.99, dur: 0.50 },  // G5
      { note: 659.25, dur: 0.25 },  // E5
      { note: 587.33, dur: 0.25 },  // D5
      { note: 523.25, dur: 0.50 },  // C5
      { note: 659.25, dur: 0.25 },  // E5
      { note: 587.33, dur: 0.50 },  // D5
      { note: 440.00, dur: 0.25 },  // A4
      { note: 523.25, dur: 0.75 },  // C5
    ];

    const bass = [
      { note: 261.63, dur: 1.0 }, // C4
      { note: 220.00, dur: 1.0 }, // A3
      { note: 174.61, dur: 1.0 }, // F3
      { note: 196.00, dur: 1.0 }, // G3
    ];

    let noteIdx = 0;
    let bassIdx = 0;
    let nextMelodyTime = this.ctx.currentTime + 0.1;
    let nextBassTime = this.ctx.currentTime + 0.1;

    const schedule = () => {
      if (!this.isBgmPlaying || !this.ctx || this.bgmMuted) return;

      const currentTime = this.ctx.currentTime;

      // Schedule melody slightly ahead
      while (nextMelodyTime < currentTime + 1.5) {
        const item = melody[noteIdx % melody.length];
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.note, nextMelodyTime);

        // Low pass filter for soft cozy Nokia feel
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, nextMelodyTime);

        noteGain.gain.setValueAtTime(0.08, nextMelodyTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, nextMelodyTime + item.dur * 0.9);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.bgmGain!);

        osc.start(nextMelodyTime);
        osc.stop(nextMelodyTime + item.dur);

        nextMelodyTime += item.dur;
        noteIdx++;
      }

      // Schedule bass
      while (nextBassTime < currentTime + 1.5) {
        const item = bass[bassIdx % bass.length];
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(item.note / 2, nextBassTime);

        noteGain.gain.setValueAtTime(0.12, nextBassTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, nextBassTime + item.dur * 0.95);

        osc.connect(noteGain);
        noteGain.connect(this.bgmGain!);

        osc.start(nextBassTime);
        osc.stop(nextBassTime + item.dur);

        nextBassTime += item.dur;
        bassIdx++;
      }

      this.bgmTimer = window.setTimeout(schedule, 500);
    };

    schedule();
  }

  private stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const soundEngine = new SoundEngine();
