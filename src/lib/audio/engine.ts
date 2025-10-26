export type LayerName = "rain" | "waves" | "leaves";

type LayerNodes = {
  source?: AudioBufferSourceNode;
  buffer?: AudioBuffer;
  gain: GainNode;
  pan: StereoPannerNode;
  url: string;
  loop: boolean;
  loopStart?: number;
  loopEnd?: number;
};

export class AudioEngine {
  ctx!: AudioContext;
  master!: GainNode;
  isReady = false;

  private layers = new Map<LayerName, LayerNodes>();

  constructor() {

    this.layers.set("rain",   { url: "/public/audio/evening-rain.mp3",   loop: true } as any);
    this.layers.set("waves",  { url: "//public/audio/morning-mix.mp3",  loop: true } as any);
    this.layers.set("leaves", { url: "/public/audio/morning-mix.mp3", loop: true } as any);
  }

  async init() {
    if (this.isReady) return;

    // AudioContext (creato al primo gesto utente)
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Master gain
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.0; // parte in silenzio
    this.master.connect(this.ctx.destination);

    // Prepara nodi + carica buffer per ogni layer
    for (const [name, meta] of this.layers) {
      const gain = this.ctx.createGain();
      gain.gain.value = 0.0;

      const pan = this.ctx.createStereoPanner();
      pan.pan.value = 0;

      pan.connect(gain);
      gain.connect(this.master);

      meta.gain = gain;
      meta.pan = pan;

      try {
        meta.buffer = await this.loadBuffer(meta.url);
      } catch (e) {
        console.warn(`[AudioEngine] Failed to load ${name} from ${meta.url}`, e);
        meta.buffer = undefined; // il layer rimarrà muto
      }
    }

    this.isReady = true;
  }

  private async loadBuffer(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const arr = await res.arrayBuffer();
    // Safari fix: usare slice(0) per avere un ArrayBuffer “detached”-safe
    return await this.ctx.decodeAudioData(arr.slice(0));
  }

  private startLayer(name: LayerName) {
    const meta = this.layers.get(name)!;
    if (!meta.buffer) return; // niente da suonare

    // Stoppa eventuale source precedente
    try { meta.source?.stop(); } catch {}
    meta.source?.disconnect();

    // Crea un nuovo BufferSource
    const src = this.ctx.createBufferSource();
    src.buffer = meta.buffer;
    src.loop = meta.loop;
    if (meta.loopStart != null) src.loopStart = meta.loopStart;
    if (meta.loopEnd != null) src.loopEnd = meta.loopEnd;

    // Suggerimento: partire con un offset casuale per evitare pattern identici ad ogni play
    const offset = Math.random() * (meta.buffer.duration - 0.25);

    src.connect(meta.pan);
    try { src.start(0, offset); } catch {}

    meta.source = src;
  }

  private fadeParam(param: AudioParam, to: number, dur = 0.8) {
    const t = this.ctx.currentTime;
    param.cancelScheduledValues(t);
    // setTargetAtTime produce una curva esponenziale morbida
    param.setTargetAtTime(to, t, dur / 4);
  }

  async resume() {
    if (this.ctx.state !== "running") await this.ctx.resume();
  }

  async suspend() {
    if (this.ctx.state === "running") await this.ctx.suspend();
  }

  /** Imposta i livelli dei layer (0..1) e il master, con fade morbidi */
  playScene(levels: Partial<Record<LayerName, number>> = {}, master = 0.8) {
    (["rain", "waves", "leaves"] as LayerName[]).forEach((n) => {
      const meta = this.layers.get(n)!;
      // Avvia il layer se non c'è un source attivo
      if (!meta.source && meta.buffer) this.startLayer(n);
      const target = levels[n] ?? 0.0;
      this.fadeParam(meta.gain.gain, target, 1.0);
    });

    this.fadeParam(this.master.gain, master, 1.2);
  }

  /** Fade-out del master; i layer restano pronti per riprendere */
  pauseScene() {
    this.fadeParam(this.master.gain, 0.0, 0.8);
  }

  setLayerPan(name: LayerName, pan: number) {
    const meta = this.layers.get(name)!;
    this.fadeParam(meta.pan.pan, Math.max(-1, Math.min(1, pan)), 0.5);
  }

  dispose() {
    for (const [, meta] of this.layers) {
      try { meta.source?.stop(); } catch {}
      try { meta.source?.disconnect(); } catch {}
      try { meta.gain.disconnect(); } catch {}
      try { meta.pan.disconnect(); } catch {}
    }
    try { this.master.disconnect(); } catch {}
    try { this.ctx.close(); } catch {}
    this.isReady = false;
  }
}