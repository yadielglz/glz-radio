export class RadioVisualizer {
  constructor(audioElement) {
    this.audio = audioElement;
    this.canvases = [];
    this.ctx = null;
    this.analyser = null;
    this.source = null;
    this.dataArray = null;
    this.rafId = null;
    this.playing = false;
    this.corsEnabled = false;
    this.phase = 0;
    this.barCount = 28;
    this.levels = new Float32Array(this.barCount);
  }

  attachCanvas(canvas) {
    if (canvas && !this.canvases.includes(canvas)) {
      this.canvases.push(canvas);
    }
  }

  tryConnectWebAudio(corsActive) {
    this.corsEnabled = Boolean(corsActive);
    if (!corsActive) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      if (!this.source) {
        this.source = this.ctx.createMediaElementSource(this.audio);
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 128;
        this.analyser.smoothingTimeConstant = 0.78;
        this.source.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      }
    } catch {
      this.corsEnabled = false;
    }
  }

  setPlaying(isPlaying) {
    this.playing = isPlaying;
    if (isPlaying && this.ctx?.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    if (!this.rafId) {
      this.loop();
    }
  }

  loop() {
    this.rafId = requestAnimationFrame(() => this.loop());
    this.phase += 0.085;

    let hasRealSignal = false;
    if (this.playing && this.corsEnabled && this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
      let sum = 0;
      for (let i = 0; i < this.dataArray.length; i += 1) sum += this.dataArray[i];
      hasRealSignal = sum > 12;
    }

    for (let i = 0; i < this.barCount; i += 1) {
      let target = 0.08;
      if (this.playing) {
        if (hasRealSignal) {
          const bin = Math.min(this.dataArray.length - 1, Math.floor((i / this.barCount) * (this.dataArray.length * 0.72)));
          target = Math.max(0.12, this.dataArray[bin] / 255);
        } else {
          // Smooth harmonic studio meter fallback for non-CORS broadcast streams
          const centerWeight = 1 - Math.abs((i / (this.barCount - 1)) * 2 - 1) * 0.55;
          const wave1 = Math.sin(this.phase * 1.4 + i * 0.55) * 0.32;
          const wave2 = Math.cos(this.phase * 2.3 - i * 0.35) * 0.24;
          const pulse = Math.sin(this.phase * 0.65 + i * 0.18) * 0.16;
          target = Math.min(0.95, Math.max(0.14, (0.48 + wave1 + wave2 + pulse) * centerWeight));
        }
      }
      this.levels[i] += (target - this.levels[i]) * (this.playing ? 0.24 : 0.12);
    }

    const styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue("--accent").trim() || "#f59e0b";
    const teal = styles.getPropertyValue("--teal").trim() || "#14b8a6";

    for (const canvas of this.canvases) {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.clearRect(0, 0, targetW, targetH);

      const gap = 3 * dpr;
      const barW = Math.max(2 * dpr, (targetW - gap * (this.barCount - 1)) / this.barCount);
      const grad = ctx.createLinearGradient(0, targetH, 0, 0);
      grad.addColorStop(0, teal);
      grad.addColorStop(1, accent);
      ctx.fillStyle = grad;

      for (let i = 0; i < this.barCount; i += 1) {
        const h = Math.max(4 * dpr, this.levels[i] * (targetH - 4 * dpr));
        const x = i * (barW + gap);
        const y = targetH - h;
        const r = Math.min(barW / 2, 3 * dpr);
        ctx.beginPath();
        ctx.roundRect(x, y, barW, h, r);
        ctx.fill();
      }
    }
  }
}
