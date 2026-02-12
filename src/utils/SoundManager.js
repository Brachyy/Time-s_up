class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.initialized = false;
  }

  init() {
    if (!this.initialized) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    }
  }

  playTone(freq, type, duration, vol = 0.1) {
    if (!this.initialized) this.init();
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  playSuccess() {
    // High pitch "Ding"
    this.playTone(880, 'sine', 0.5, 0.2); // A5
    setTimeout(() => this.playTone(1760, 'sine', 0.8, 0.1), 100); // A6
  }

  playTaboo() {
    // Low pitch "Buzz"
    this.playTone(150, 'sawtooth', 0.4, 0.2);
    setTimeout(() => this.playTone(100, 'sawtooth', 0.4, 0.2), 100);
  }

  playPass() {
    // Sliding "Whoosh" (simulated with frequency ramp)
    if (!this.initialized) this.init();
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.3);
  }

  playTick() {
    // Short "Click"
    this.playTone(800, 'square', 0.05, 0.05);
  }

  playTimeUp() {
    // Alarm sequence
    const now = this.audioCtx.currentTime;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this.playTone(600, 'square', 0.2, 0.2), i * 300);
    }
  }
}

export const soundManager = new SoundManager();
