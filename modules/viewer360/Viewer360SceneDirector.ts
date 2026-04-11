import * as THREE from "three";
import type {
  Viewer360IntroConfig,
  Viewer360Scene,
  Viewer360TargetView,
} from "./Viewer360.types";

export const VIEWER360_DEFAULT_INTRO: Viewer360IntroConfig = {
  durationMs: 1800,
  startFov: 150,
  endFov: 90,
  startPitch: -88,
  startYawOffset: 180,
};

export function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

export function easeInOutCubic(t: number) {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function easeOutQuint(t: number) {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 5);
}

export function shortestAngleDeltaDeg(from: number, to: number) {
  let delta = (to - from) % 360;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta;
}

export function normalizeDegrees(value: number) {
  let next = value % 360;
  if (next < 0) next += 360;
  return next;
}

export function targetFromYawPitch(yaw: number, pitch: number) {
  const yawRad = THREE.MathUtils.degToRad(yaw);
  const pitchRad = THREE.MathUtils.degToRad(pitch);

  return new THREE.Vector3(
    Math.cos(pitchRad) * Math.cos(yawRad),
    Math.sin(pitchRad),
    Math.cos(pitchRad) * Math.sin(yawRad)
  ).normalize();
}

export function buildIntroView(
  targetYaw: number,
  targetPitch: number,
  progress: number,
  config: Viewer360IntroConfig = VIEWER360_DEFAULT_INTRO
) {
  const t = clamp01(progress);
  const moveT = easeInOutCubic(t);

  const startYaw = normalizeDegrees(targetYaw + config.startYawOffset);
  const yawDelta = shortestAngleDeltaDeg(startYaw, targetYaw);
  const yaw = startYaw + yawDelta * moveT;

  const pitch = config.startPitch + (targetPitch - config.startPitch) * moveT;
  const fov = THREE.MathUtils.lerp(config.startFov, config.endFov, moveT);

  return {
    yaw,
    pitch,
    fov,
    opacity: t > 0.94 ? 1 - easeOutQuint((t - 0.94) / 0.06) : 1,
  };
}

export function resolveSceneTargetView(
  scene: Viewer360Scene | undefined,
  fallback: Viewer360TargetView = { yaw: 0, pitch: 0 }
): Viewer360TargetView {
  if (!scene) return fallback;

  return {
    yaw: typeof scene.initialYaw === "number" ? scene.initialYaw : fallback.yaw,
    pitch: typeof scene.initialPitch === "number" ? scene.initialPitch : fallback.pitch,
  };
}
