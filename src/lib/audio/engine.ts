export type SceneName =
  | "evening-rain"
  | "midnight-garden"
  | "morning-mix"
  | "tropical-noon";

type SceneNode = {
  source?: AudioBufferSourceNode;
  buffer?: AudioBuffer;
  gain: GainNode;
  url: string;
  loop: boolean;
};

export class AudioEngine {
  ctx!: AudioContext;
  master!: GainNode;
  lowpass!: BiquadFilterNode;
  lowshelf!: BiquadFilterNode;
  analyser!: AnalyserNode;
  isReady = false;

  private scenes = new Map<SceneName, SceneNode>();

  constructor() {
    // mappa scena → file locale in /public/audio
    this.scenes.set("evening-rain", { url: "/audio/evening-rain.mp3", loop: true } as any);
    this.scenes.set("midnight-garden", { url: "/audio/midnight-garden.mp3", loop: true } as any);
    this.scenes.set("morning-mix", { url: "/audio/morning-mix.mp3", loop: true } as any);
    this.scenes.set("tropical-noon", { url: "/audio/tropical-noon.mp3", loop: true } as any);
  }

  async init() {
    if (this.isReady) return;

    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    // nodi principali
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.0;

    this.lowpass = this.ctx.createBiquadFilter();
    this.lowpass.type = "lowpass";
    this.lowpass.frequency.value = 16000;
    this.lowpass.Q.value = 0.0001;

    this.lowshelf = this.ctx.createBiquadFilter();
    this.lowshelf.type = "lowshelf";
    this.lowshelf.frequency.value = 280;
    this.lowshelf.gain.value = 0;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.85;

    // catena: master → lowpass → lowshelf → analyser → destination
    this.master.connect(this.lowpass);
    this.lowpass.connect(this.lowshelf);
    this.lowshelf.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // prepara gain e carica buffer per ogni scena
    for (const [name, scene] of this.scenes) {
      const g = this.ctx.createGain();
      g.gain.value = 0.0;
      g.connect(this.master);
      scene.gain = g;

      try {
        scene.buffer = await this.loadBuffer(scene.url);
      } catch (e) {
        console.warn(`[AudioEngine] Failed to load ${name} from ${scene.url}`, e);
        scene.buffer = undefined;
      }
    }

    this.isReady = true;
  }

  getAnalyser() {
    return this.analyser ?? null;
  }

  async resume() {
    if (this.ctx?.state !== "running") {
      await this.ctx.resume();
    }
  }

  async suspend() {
    if (this.ctx?.state === "running") {
      await this.ctx.suspend();
    }
  }

  /** Intensity 0..1 → master gain (fade morbido) */
  setIntensity(v: number) {
    const val = clamp01(v);
    this.fadeParam(this.master.gain, val, 0.25);
  }

  /** Calm 0..1 → lowpass 16k → ~800 Hz */
  setCalm(v: number) {
    const x = clamp01(v);
    const from = 16000;
    const to = 800;
    const cutoff = from + (to - from) * x;
    const t = this.ctx.currentTime;
    this.lowpass.frequency.cancelScheduledValues(t);
    this.lowpass.frequency.setTargetAtTime(cutoff, t, 0.03);
  }

  /** Nature 0..1 → low-shelf -2..+6 dB */
  setNature(v: number) {
    const x = clamp01(v);
    const db = -2 + 8 * x;
    const t = this.ctx.currentTime;
    this.lowshelf.gain.cancelScheduledValues(t);
    this.lowshelf.gain.setTargetAtTime(db, t, 0.05);
  }

  /** Crossfade: porta a 0 tutte le scene e fai fade-in di quella scelta; alza il master */
  playSlug(slug: SceneName, master = 0.85) {
    const targetSlug: SceneName = this.scenes.has(slug) ? slug : "evening-rain";

    (Array.from(this.scenes.keys()) as SceneName[]).forEach((n) => {
      const s = this.scenes.get(n)!;
      if (!s.source && s.buffer) this.startScene(n);
      this.fadeParam(s.gain.gain, 0.0, 1.0);
    });

    const target = this.scenes.get(targetSlug)!;
    this.fadeParam(target.gain.gain, 1.0, 1.0);
    this.fadeParam(this.master.gain, master, 1.2);
  }

  /** Fade-out del master (scene pronte a riprendere) */
  pauseAll() {
    this.fadeParam(this.master.gain, 0.0, 0.8);
  }

  dispose() {
    for (const [, scene] of this.scenes) {
      try { scene.source?.stop(); } catch {}
      try { scene.source?.disconnect(); } catch {}
      try { scene.gain.disconnect(); } catch {}
    }
    try { this.analyser.disconnect(); } catch {}
    try { this.lowshelf.disconnect(); } catch {}
    try { this.lowpass.disconnect(); } catch {}
    try { this.master.disconnect(); } catch {}
    try { this.ctx.close(); } catch {}
    this.isReady = false;
  }

  // ==== helpers ====

  private async loadBuffer(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const arr = await res.arrayBuffer();
    return await this.ctx.decodeAudioData(arr.slice(0));
  }

  private startScene(name: SceneName) {
    const scene = this.scenes.get(name)!;
    if (!scene.buffer) return;

    try { scene.source?.stop(); } catch {}
    scene.source?.disconnect();

    const src = this.ctx.createBufferSource();
    src.buffer = scene.buffer;
    src.loop = true;

    const offset = Math.max(0, Math.random() * (scene.buffer.duration - 0.25));
    src.connect(scene.gain);
    try { src.start(0, offset); } catch {}

    scene.source = src;
  }

  private fadeParam(param: AudioParam, to: number, dur = 0.8) {
    const t = this.ctx.currentTime;
    param.cancelScheduledValues(t);
    param.setTargetAtTime(to, t, Math.max(0.001, dur / 4));
  }
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}