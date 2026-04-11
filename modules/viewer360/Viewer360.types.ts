export type Viewer360Hotspot = {
  id: string;
  yaw: number;
  pitch: number;
  label?: string;
  targetSceneId?: string;
};

export type Viewer360Scene = {
  id: string;
  title?: string;
  image: string;
  thumbnail?: string;
  initialYaw?: number;
  initialPitch?: number;
  hotspots?: Viewer360Hotspot[];
};

export type Viewer360TargetView = {
  yaw: number;
  pitch: number;
};

export type Viewer360StageMode =
  | "inline"
  | "expanding"
  | "planet-intro"
  | "interactive"
  | "switching"
  | "closing";

export type Viewer360IntroConfig = {
  durationMs: number;
  startFov: number;
  endFov: number;
  startPitch: number;
  startYawOffset: number;
};

export type Viewer360SceneChangePlan = {
  scene: Viewer360Scene;
  targetYaw: number;
  targetPitch: number;
};

export type Viewer360FullscreenState = {
  width: number;
  height: number;
};

export type Viewer360Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};
