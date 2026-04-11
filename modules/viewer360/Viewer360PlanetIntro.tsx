"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Viewer360PlanetIntroProps = {
  image: string;
  durationMs?: number;
  targetYaw?: number;
  targetPitch?: number;
  onRevealInteractive?: () => void;
  onDone?: () => void;
};

const VERTEX_SHADER = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uZoom;
uniform float uYaw;
uniform float uTilt;
uniform float uOpacity;

varying vec2 vUv;

const float PI = 3.1415926535897932384626433832795;

mat3 rotateY(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat3(
     c, 0.0, s,
    0.0, 1.0, 0.0,
    -s, 0.0, c
  );
}

mat3 rotateX(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat3(
    1.0, 0.0, 0.0,
    0.0, c, -s,
    0.0, s,  c
  );
}

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  p.x *= aspect;
  p *= uZoom;

  float r2 = dot(p, p);

  vec3 dir = normalize(vec3(
    2.0 * p.x,
    r2 - 1.0,
    2.0 * p.y
  ));

  dir = rotateX(-uTilt) * rotateY(uYaw) * dir;

  float lon = atan(dir.z, dir.x);
  float lat = asin(clamp(dir.y, -1.0, 1.0));

  vec2 uv = vec2(
    0.5 + lon / (2.0 * PI),
    0.5 - lat / PI
  );

  vec3 color = texture2D(
    uTexture,
    vec2(fract(uv.x), clamp(uv.y, 0.0, 1.0))
  ).rgb;

  float screenRadius = length(vUv * 2.0 - 1.0);
  float vignette = 1.0 - 0.045 * smoothstep(0.82, 1.35, screenRadius);

  gl_FragColor = vec4(color * vignette, uOpacity);
}
`;

function clamp01(v: number) {
  return Math.min(Math.max(v, 0), 1);
}

function smoothstep01(t: number) {
  const x = clamp01(t);
  return x * x * (3.0 - 2.0 * x);
}

function easeInOutCubic(t: number) {
  const x = clamp01(t);
  return x < 0.5
    ? 4.0 * x * x * x
    : 1.0 - Math.pow(-2.0 * x + 2.0, 3.0) / 2.0;
}

function easeOutQuint(t: number) {
  const x = clamp01(t);
  return 1.0 - Math.pow(1.0 - x, 5.0);
}

function windowProgress(t: number, start: number, end: number) {
  if (end <= start) return 0;
  return smoothstep01((t - start) / (end - start));
}

export default function Viewer360PlanetIntro({
  image,
  durationMs = 1800,
  targetYaw = 0,
  targetPitch = 0,
  onRevealInteractive,
  onDone,
}: Viewer360PlanetIntroProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !image) return;

    let disposed = false;
    let frameId = 0;
    let revealed = false;
    let finished = false;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.opacity = "1";
    root.appendChild(renderer.domElement);

    const uniforms = {
      uTexture: { value: null as THREE.Texture | null },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uZoom: { value: 7.4 },
      uYaw: { value: Math.PI },
      uTilt: { value: 0.0 },
      uOpacity: { value: 1.0 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    const resize = () => {
      const width = Math.max(root.clientWidth || window.innerWidth, 1);
      const height = Math.max(root.clientHeight || window.innerHeight, 1);
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width, height);
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(root);
    window.addEventListener("resize", resize);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    const texture = loader.load(
      image,
      () => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.flipY = false;
        texture.needsUpdate = true;
        uniforms.uTexture.value = texture;
      },
      undefined,
      (err) => {
  console.error("Error loading 360 texture:", err);

  if (!revealed) {
    revealed = true;
    onRevealInteractive?.();
  }

  if (!finished) {
    finished = true;
    onDone?.();
  }
}
    );

    const start = performance.now();

    const START_ZOOM = 7.4;
    const END_ZOOM = 0.58;

    const START_YAW = Math.PI;
    const END_YAW = Math.PI + THREE.MathUtils.degToRad(targetYaw);

    const START_TILT = 0.0;
    const END_TILT = THREE.MathUtils.degToRad(84 + targetPitch * 0.15);

    const animate = (now: number) => {
      if (disposed) return;

      const t = clamp01((now - start) / durationMs);

      const moveT = easeInOutCubic(windowProgress(t, 0.0, 0.94));
      const fadeT = easeOutQuint(windowProgress(t, 0.94, 1.0));

      uniforms.uZoom.value = THREE.MathUtils.lerp(START_ZOOM, END_ZOOM, moveT);
      uniforms.uYaw.value = THREE.MathUtils.lerp(START_YAW, END_YAW, moveT);
      uniforms.uTilt.value = THREE.MathUtils.lerp(START_TILT, END_TILT, moveT);
      uniforms.uOpacity.value = 1.0 - fadeT;

      if (t >= 0.84 && !revealed) {
        revealed = true;
        onRevealInteractive?.();
      }

      renderer.render(scene, camera);

      if (t < 1.0) {
        frameId = window.requestAnimationFrame(animate);
      } else if (!finished) {
        finished = true;
        onDone?.();
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      ro.disconnect();
      window.removeEventListener("resize", resize);

      quad.geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === root) {
        root.removeChild(renderer.domElement);
      }
    };
  }, [image, durationMs, targetYaw, targetPitch, onRevealInteractive, onDone]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
    />
  );
}
