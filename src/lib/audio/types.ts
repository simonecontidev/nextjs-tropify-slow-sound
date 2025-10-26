export type SceneParams = {
  intensity: number; // 0..1
  calm: number;      // 0..1
  nature: number;    // 0..1
};

export type SceneRef = {
  slug: string;
  params: SceneParams;
};

export type AudioStatus = "idle" | "ready" | "playing" | "paused";

export type AudioContextState = {
  status: AudioStatus;
  current?: SceneRef;
  // mood params (controlli UI)
  intensity?: number; // 0..1
  calm?: number;      // 0..1
  nature?: number;    // 0..1
};

export type AudioActions = {
  init: () => Promise<void> | void;
  play: (scene?: SceneRef) => Promise<void> | void;
  pause: () => void;
  setScene: (scene: SceneRef) => void;

  // nuovi controlli
  setIntensity: (v: number) => void;
  setCalm: (v: number) => void;
  setNature: (v: number) => void;
};

export type AudioContextValue = AudioContextState & AudioActions & {
  getAnalyser: () => AnalyserNode | null;
};