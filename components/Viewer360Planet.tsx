"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Viewer360PlanetProps = {
  image: string;
  durationMs?: number;
  onComplete?: () => void;
  targetYaw?: number;
  targetPitch?: number;
};

const SPHERE_RADIUS = 500;
const START_FOV = 150;
const END_FOV = 90;
const START_PITCH = -88;
const START_YAW_OFFSET = 180;

function clamp01(v: number) {
  return Math.min(Math.max(v, 0), 1);
}

function easeInOutCubic(t: number) {
  const x = clamp01(t);
  return x < 0.5
    ? 4 * x * x * x
    : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeOutQuint(t: number) {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 5);
}

function targetFromYawPitch(yaw: number, pitch: number) {
  const yawRad = THREE.MathUtils.degToRad(yaw);
  const pitchRad = THREE.MathUtils.degToRad(pitch);

  return new THREE.Vector3(
    Math.cos(pitchRad) * Math.cos(yawRad),
    Math.sin(pitchRad),
    Math.cos(pitchRad) * Math.sin(yawRad)
  ).normalize();
}

function shortestAngleDeltaDeg(from: number, to: number) {
  let delta = (to - from) % 360;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta;
}

export default function Viewer360Planet({
  image,
  durationMs = 3600,
  onComplete,
  targetYaw = 0,
  targetPitch = 0,
}: Viewer360PlanetProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !image) return;

    let disposed = false;
    let frameId = 0;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      START_FOV,
      Math.max(root.clientWidth || 1, 1) / Math.max(root.clientHeight || 1, 1),
      0.1,
      2000
    );
    camera.position.set(0, 0, 0.1);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(
      Math.max(root.clientWidth || 1, 1),
      Math.max(root.clientHeight || 1, 1)
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    root.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(SPHERE_RADIUS, 96, 64);
    geometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicMaterial();
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    let texture: THREE.Texture | null = null;

    const resize = () => {
      const width = Math.max(root.clientWidth || window.innerWidth, 1);
      const height = Math.max(root.clientHeight || window.innerHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(root);
    window.addEventListener("resize", resize);

    const startYaw = targetYaw + START_YAW_OFFSET;
    const yawDelta = shortestAngleDeltaDeg(startYaw, targetYaw);
    const startPitch = START_PITCH;
    const pitchDelta = targetPitch - startPitch;

    const start = performance.now();

    loader.load(
      image,
      (loadedTexture) => {
        if (disposed) {
          loadedTexture.dispose();
          return;
        }

        texture = loadedTexture;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        material.map = texture;
        material.needsUpdate = true;

        const animate = (now: number) => {
          if (disposed) return;

          const rawT = clamp01((now - start) / durationMs);
          const moveT = easeInOutCubic(rawT);
          const fadeT = rawT > 0.94 ? easeOutQuint((rawT - 0.94) / 0.06) : 0;

          const yaw = startYaw + yawDelta * moveT;
          const pitch = startPitch + pitchDelta * moveT;
          const fov = THREE.MathUtils.lerp(START_FOV, END_FOV, moveT);

          camera.fov = fov;
          camera.updateProjectionMatrix();

          const lookDir = targetFromYawPitch(yaw, pitch);
          camera.lookAt(camera.position.clone().add(lookDir));

          renderer.domElement.style.opacity = String(1 - fadeT);
          renderer.render(scene, camera);

          if (rawT < 1) {
            frameId = window.requestAnimationFrame(animate);
          } else {
            onComplete?.();
          }
        };

        frameId = window.requestAnimationFrame(animate);
      },
      undefined,
      (err) => {
        console.error("Error loading 360 planet texture:", err);
        onComplete?.();
      }
    );

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      ro.disconnect();

      texture?.dispose();
      material.dispose();
      geometry.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === root) {
        root.removeChild(renderer.domElement);
      }
    };
  }, [image, durationMs, onComplete, targetYaw, targetPitch]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[999] h-screen w-screen overflow-hidden pointer-events-none"
    />
  );
}
