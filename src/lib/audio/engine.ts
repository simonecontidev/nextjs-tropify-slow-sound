export type SceneName =
  | "evening-rain"
  | "midnight-garden"
  | "morning-mix"
  | "tropical-noon";

type SceneNode = {
  source?: AudioBufferSourceNode;
  buffer?: AudioBuffer;
  gain: GainNode; // gain per la singola scena
  url: string;
  loop: boolean;
};

export class AudioEngine {
  ctx!: AudioContext;
  master!: GainNode;
  isReady = false;

  private scenes = new Map<SceneName, SceneNode>();

  constructor() {
    // Mappa ogni scena al suo file in /public/audio
    this.scenes.set("evening-rain", {
      url: "/audio/evening-rain.mp3",
      loop: true,
      // gain e buffer verranno creati in init()
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

    this.master = this.ctx.createGain();
    this.master.gain.value = 0.0; // parte in silenzio
    this.master.connect(this.ctx.destination);

    // prepara i nodi e carica i buffer per OGNI scena
    for (const [name, scene] of this.scenes) {
      const gain = this.ctx.createGain();
      gain.gain.value = 0.0;
      gain.connect(this.master);
      scene.gain = gain;

      try {
        scene.buffer = await this.loadBuffer(scene.url);
      } catch (e) {
        console.warn(`[AudioEngine] Failed to load ${name} from ${scene.url}`, e);
        scene.buffer = undefined;
      }
    }

    this.isReady = true;
  }

  private async loadBuffer(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const arr = await res.arrayBuffer();
    return await this.ctx.decodeAudioData(arr.slice(0));
  }

  private startScene(name: SceneName) {
    const scene = this.scenes.get(name)!;
    if (!scene.buffer) return; // nessun audio da suonare

    // ferma eventuale source precedente
    try { scene.source?.stop(); } catch {}
    scene.source?.disconnect();

    const src = this.ctx.createBufferSource();
    src.buffer = scene.buffer;
    src.loop = scene.loop;

    // piccola randomizzazione per evitare che inizi sempre allo stesso punto
    const offset = Math.random() * (scene.buffer.duration - 0.25);

    src.connect(scene.gain);
    try { src.start(0, offset); } catch {}

    scene.source = src;
  }

  private fadeParam(param: AudioParam, to: number, dur = 0.8) {
    const t = this.ctx.currentTime;
    param.cancelScheduledValues(t);
    param.setTargetAtTime(to, t, dur / 4);
  }

  async resume() {
    if (this.ctx.state !== "running") await this.ctx.resume();
  }

  async suspend() {
    if (this.ctx.state === "running") await this.ctx.suspend();
  }

  /** Riproduci una scena: fade-in della scena scelta e fade-out delle altre */
  playSlug(slug: SceneName, master = 0.85) {
    // assicura che tutte le scene abbiano un source attivo (per crossfade immediato)
    (Array.from(this.scenes.keys()) as SceneName[]).forEach((n) => {
      const s = this.scenes.get(n)!;
      if (!s.source && s.buffer) this.startScene(n);
      // fade out default
      this.fadeParam(s.gain.gain, 0.0, 1.0);
    });

    // fade in della scena selezionata
    const target = this.scenes.get(slug)!;
    this.fadeParam(target.gain.gain, 1.0, 1.0);

    // master su
    this.fadeParam(this.master.gain, master, 1.2);
  }

  /** Fade-out del master */
  pauseAll() {
    this.fadeParam(this.master.gain, 0.0, 0.8);
  }

  dispose() {
    for (const [, scene] of this.scenes) {
      try { scene.source?.stop(); } catch {}
      try { scene.source?.disconnect(); } catch {}
      try { scene.gain.disconnect(); } catch {}
    }
    try { this.master.disconnect(); } catch {}
    try { this.ctx.close(); } catch {}
    this.isReady = false;
  }
}