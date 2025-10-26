export type SceneParams = {
  intensity: number; // 0..1
  calm: number;      // 0..1
  nature: number;    // 0..1
};

export type SceneRef = {
  slug: string; // es: 'evening-rain'
  params: SceneParams;
};

export type AudioStatus = "idle" | "ready" | "playing" | "paused";

export type AudioContextState = {
  status: AudioStatus;
  current?: SceneRef;
};

export type AudioActions = {
  init: () => Promise<void> | void;
  play: (scene?: SceneRef) => Promise<void> | void;
  pause: () => void;
  setScene: (scene: SceneRef) => void;
};

export type AudioContextValue = AudioContextState & AudioActions;