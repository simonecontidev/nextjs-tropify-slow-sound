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
  analyser!: AnalyserNode;
  isReady = false;

  private scenes = new Map<SceneName, SceneNode>();

  constructor() {
    // mappa ogni scena al suo file locale in /public/audio
    this.scenes.set("evening-rain", {
      url: "/audio/evening-rain.mp3",
      loop: true,
    } as any);

    this.scenes.set("midnight-garden", {
      url: "/audio/midnight-garden.mp3",
      loop: true,
    } as any);

    this.scenes.set("morning-mix", {
      url: "/audio/morning-mix.mp3",
      loop: true,
    } as any);

    this.scenes.set("tropical-noon", {
      url: "/audio/tropical-noon.mp3",
      loop: true,
    } as any);
  }

  async init() {
    if (this.isReady) return;

    this.ctx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    // master → analyser → destination (così possiamo leggere l’energia audio)
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.0;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.85;

    this.master.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // prepara i nodi e carica i buffer per OGNI scena
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

  private async loadBuffer(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const arr = await res.arrayBuffer();
    // slice(0) evita problemi su Safari con ArrayBuffer detatched
    return await this.ctx.decodeAudioData(arr.slice(0));
  }

  private startScene(name: SceneName) {
    const scene = this.scenes.get(name)!;
    if (!scene.buffer) return;

    try { scene.source?.stop(); } catch {}
    scene.source?.disconnect();

    const src = this.ctx.createBufferSource();
    src.buffer = scene.buffer;
    src.loop = scene.loop;

    // piccolo offset random per evitare sempre lo stesso inizio
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

  async resume() {
    if (this.ctx.state !== "running") await this.ctx.resume();
  }

  async suspend() {
    if (this.ctx.state === "running") await this.ctx.suspend();
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

  /** Fade-out del master (lascia le scene pronte per riprendere) */
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
    try { this.master.disconnect(); } catch {}
    try { this.ctx.close(); } catch {}
    this.isReady = false;
  }
}