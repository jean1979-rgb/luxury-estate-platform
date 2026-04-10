"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Viewer360Hotspot } from "./Viewer360.types";

type Viewer360CoreProps = {
  image: string;
  initialYaw?: number;
  initialPitch?: number;
  initialFov?: number;
  minFov?: number;
  maxFov?: number;
  hotspots?: Viewer360Hotspot[];
  interactive?: boolean;
  onViewChange?: (view: { yaw: number; pitch: number }) => void;
  onHotspotClick?: (targetSceneId?: string) => void;
  introEnabled?: boolean;
};

const DEFAULT_FOV = 90;
const MIN_FOV = 45;
const MAX_FOV = 95;
const WHEEL_ZOOM_STEP = 0.035;
const DRAG_SENSITIVITY = 0.12;
const MAX_PITCH = 85;
const SPHERE_RADIUS = 500;
const HOTSPOT_RADIUS = 505;

const INTRO_HOLD_MS = 300;
const INTRO_MOVE_MS = 2200;

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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clamp01(v: number) {
  return clamp(v, 0, 1);
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

function degToRad(value: number) {
  return THREE.MathUtils.degToRad(value);
}

function normalizeYaw(value: number) {
  let next = value % 360;
  if (next > 180) next -= 360;
  if (next < -180) next += 360;
  return next;
}

function viewToVector(yaw: number, pitch: number) {
  const yawRad = degToRad(yaw);
  const pitchRad = degToRad(pitch);

  return new THREE.Vector3(
    Math.cos(pitchRad) * Math.cos(yawRad),
    Math.sin(pitchRad),
    Math.cos(pitchRad) * Math.sin(yawRad)
  ).normalize();
}

function hotspotToVector(yaw: number, pitch: number, radius = HOTSPOT_RADIUS) {
  return viewToVector(yaw, pitch).multiplyScalar(radius);
}

export default function Viewer360Core({
  image,
  initialYaw = 0,
  initialPitch = 0,
  initialFov = DEFAULT_FOV,
  minFov = MIN_FOV,
  maxFov = MAX_FOV,
  hotspots = [],
  interactive = true,
  onViewChange,
  onHotspotClick,
  introEnabled = false,
}: Viewer360CoreProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !image) return;

    let disposed = false;
    let frameId = 0;
    let interactionEnabled = !introEnabled;
    let mode: "loading" | "planet-hold" | "planet-move" | "viewer" =
      introEnabled ? "loading" : "viewer";

    const yawRef = { current: initialYaw };
    const pitchRef = { current: initialPitch };
    const fovRef = { current: initialFov };

    let isPointerDown = false;
    let pointerMoved = false;
    let activePointerId: number | null = null;
    const pointerStart = { x: 0, y: 0 };
    const dragStartView = { yaw: initialYaw, pitch: initialPitch };
    const lastEmittedViewRef: { current: { yaw: number; pitch: number } | null } = {
      current: null,
    };

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.userSelect = "none";
    root.appendChild(renderer.domElement);

    const orthoScene = new THREE.Scene();
    const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const perspectiveScene = new THREE.Scene();
    const perspectiveCamera = new THREE.PerspectiveCamera(
      initialFov,
      Math.max(root.clientWidth || 1, 1) / Math.max(root.clientHeight || 1, 1),
      0.1,
      2000
    );
    perspectiveCamera.position.set(0, 0, 0.1);

    const uniforms = {
      uTexture: { value: null as THREE.Texture | null },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uZoom: { value: 10.0 },
      uYaw: { value: Math.PI },
      uTilt: { value: 0.0 },
      uOpacity: { value: 1.0 },
    };

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: false,
      depthWrite: false,
      depthTest: false,
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial);
    orthoScene.add(quad);

    const sphereGeometry = new THREE.SphereGeometry(SPHERE_RADIUS, 96, 64);
    sphereGeometry.scale(-1, 1, 1);

    const sphereMaterial = new THREE.MeshBasicMaterial();
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    perspectiveScene.add(sphere);

    const hotspotMeshes: THREE.Sprite[] = [];

    function buildHotspotSprite(label?: string) {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.arc(64, 64, 28, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(64, 64, 10, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.82)";
      ctx.fill();

      if (label) {
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.fillText(label.slice(0, 18), 64, 116);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;

      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });

      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(18, 18, 1);
      return sprite;
    }

    function syncHotspots() {
      hotspotMeshes.forEach((mesh) => {
        perspectiveScene.remove(mesh);
        if (mesh.material instanceof THREE.SpriteMaterial) {
          mesh.material.map?.dispose();
          mesh.material.dispose();
        }
      });
      hotspotMeshes.length = 0;

      hotspots.forEach((hotspot) => {
        const sprite = buildHotspotSprite(hotspot.label);
        if (!sprite) return;
        sprite.position.copy(hotspotToVector(hotspot.yaw, hotspot.pitch));
        sprite.userData = {
          hotspotId: hotspot.id,
          targetSceneId: hotspot.targetSceneId,
          label: hotspot.label,
        };
        perspectiveScene.add(sprite);
        hotspotMeshes.push(sprite);
      });
    }

    syncHotspots();

    const resize = () => {
      const width = Math.max(root.clientWidth || window.innerWidth, 1);
      const height = Math.max(root.clientHeight || window.innerHeight, 1);
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width, height);
      perspectiveCamera.aspect = width / height;
      perspectiveCamera.updateProjectionMatrix();
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(root);
    window.addEventListener("resize", resize);

    const emitView = () => {
      const payload = {
        yaw: Number(normalizeYaw(yawRef.current).toFixed(2)),
        pitch: Number(clamp(pitchRef.current, -MAX_PITCH, MAX_PITCH).toFixed(2)),
      };

      const last = lastEmittedViewRef.current;
      const EPS = 0.05;

      if (
        last &&
        Math.abs(last.yaw - payload.yaw) < EPS &&
        Math.abs(last.pitch - payload.pitch) < EPS
      ) {
        return;
      }

      lastEmittedViewRef.current = payload;
      onViewChange?.(payload);
    };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const getPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const getHotspotIntersection = (event: PointerEvent) => {
      getPointer(event);
      raycaster.setFromCamera(pointer, perspectiveCamera);
      const intersections = raycaster.intersectObjects(hotspotMeshes);
      return intersections[0] ?? null;
    };

    const updateCursor = (event?: PointerEvent) => {
      if (!interactionEnabled || !interactive) {
        renderer.domElement.style.cursor = "default";
        return;
      }

      if (event) {
        const hit = getHotspotIntersection(event);
        if (hit && !isPointerDown) {
          renderer.domElement.style.cursor = "pointer";
          return;
        }
      }

      renderer.domElement.style.cursor = isPointerDown ? "grabbing" : "grab";
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!interactionEnabled || !interactive || mode !== "viewer") return;

      isPointerDown = true;
      pointerMoved = false;
      activePointerId = event.pointerId;
      pointerStart.x = event.clientX;
      pointerStart.y = event.clientY;
      dragStartView.yaw = yawRef.current;
      dragStartView.pitch = pitchRef.current;

      try {
        renderer.domElement.setPointerCapture(event.pointerId);
      } catch {}

      updateCursor();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!interactionEnabled || !interactive || mode !== "viewer") {
        updateCursor(event);
        return;
      }

      if (!isPointerDown) {
        updateCursor(event);
        return;
      }

      if (activePointerId !== null && event.pointerId !== activePointerId) return;

      const dx = event.clientX - pointerStart.x;
      const dy = event.clientY - pointerStart.y;

      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        pointerMoved = true;
      }

      yawRef.current = normalizeYaw(dragStartView.yaw - dx * DRAG_SENSITIVITY);
      pitchRef.current = clamp(
        dragStartView.pitch + dy * DRAG_SENSITIVITY,
        -MAX_PITCH,
        MAX_PITCH
      );

      emitView();
      updateCursor(event);
    };

    const onPointerUp = (event: PointerEvent) => {
      const hadPointerDown = isPointerDown;
      const moved = pointerMoved;

      if (activePointerId !== null && event.pointerId !== activePointerId) return;

      isPointerDown = false;
      pointerMoved = false;

      try {
        renderer.domElement.releasePointerCapture(event.pointerId);
      } catch {}

      activePointerId = null;

      if (!interactionEnabled || !interactive || mode !== "viewer") {
        updateCursor(event);
        return;
      }

      const hit = getHotspotIntersection(event);
      if (hadPointerDown && !moved && hit) {
        onHotspotClick?.(
          (hit.object.userData?.targetSceneId as string | undefined) ?? undefined
        );
      }

      updateCursor(event);
    };

    const onPointerCancel = () => {
      isPointerDown = false;
      pointerMoved = false;
      activePointerId = null;
      updateCursor();
    };

    const onWheel = (event: WheelEvent) => {
      if (!interactionEnabled || !interactive || mode !== "viewer") return;
      event.preventDefault();
      const nextFov =
        fovRef.current +
        Math.sign(event.deltaY) * Math.abs(event.deltaY) * WHEEL_ZOOM_STEP;
      fovRef.current = clamp(nextFov, minFov, maxFov);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    let loadedTexture: THREE.Texture | null = null;
    let holdStart = 0;
    let moveStart = 0;

    const END_YAW = Math.PI + THREE.MathUtils.degToRad(initialYaw);
    const START_YAW = END_YAW;

    const START_ZOOM = 11.5;
    const END_ZOOM = 0.58;

    const START_TILT = THREE.MathUtils.degToRad(0.0);
    const END_TILT = THREE.MathUtils.degToRad(84 + initialPitch * 0.15);

    loader.load(
      image,
      (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }

        loadedTexture = texture;
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.minFilter = THREE.LinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;
        loadedTexture.generateMipmaps = false;
        loadedTexture.flipY = false;
        loadedTexture.needsUpdate = true;

        const sphereTexture = loadedTexture.clone();
        sphereTexture.colorSpace = THREE.SRGBColorSpace;
        sphereTexture.minFilter = THREE.LinearFilter;
        sphereTexture.magFilter = THREE.LinearFilter;
        sphereTexture.generateMipmaps = false;
        sphereTexture.flipY = true;
        sphereTexture.needsUpdate = true;

        uniforms.uTexture.value = loadedTexture;
        sphereMaterial.map = sphereTexture;
        sphereMaterial.needsUpdate = true;

        if (introEnabled) {
          holdStart = performance.now();
          mode = "planet-hold";
        } else {
          mode = "viewer";
          interactionEnabled = !!interactive;
          yawRef.current = initialYaw;
          pitchRef.current = initialPitch;
          fovRef.current = initialFov;
          emitView();
        }
      },
      undefined,
      (err) => {
        console.error("Error loading 360 texture:", err);
      }
    );

    const renderViewer = () => {
      perspectiveCamera.fov = clamp(fovRef.current, minFov, maxFov);
      perspectiveCamera.updateProjectionMatrix();

      const target = viewToVector(
        normalizeYaw(yawRef.current),
        clamp(pitchRef.current, -MAX_PITCH, MAX_PITCH)
      );

      perspectiveCamera.lookAt(target);
      renderer.render(perspectiveScene, perspectiveCamera);
    };

    const animate = (now: number) => {
      if (disposed) return;

      if (mode === "loading") {
        frameId = window.requestAnimationFrame(animate);
        return;
      }

      if (mode === "planet-hold") {
        uniforms.uZoom.value = START_ZOOM;
        uniforms.uYaw.value = START_YAW;
        uniforms.uTilt.value = START_TILT;
        uniforms.uOpacity.value = 1.0;

        renderer.render(orthoScene, orthoCamera);

        if (now - holdStart >= INTRO_HOLD_MS) {
          moveStart = now;
          mode = "planet-move";
        }

        frameId = window.requestAnimationFrame(animate);
        return;
      }

      if (mode === "planet-move") {
        const t = clamp01((now - moveStart) / INTRO_MOVE_MS);
        const moveT = easeInOutCubic(t);

        uniforms.uZoom.value = THREE.MathUtils.lerp(START_ZOOM, END_ZOOM, moveT);
        uniforms.uYaw.value = START_YAW;
        uniforms.uTilt.value = THREE.MathUtils.lerp(START_TILT, END_TILT, moveT);
        uniforms.uOpacity.value = 1.0;

        renderer.render(orthoScene, orthoCamera);

        if (t >= 1.0) {
          mode = "viewer";
          interactionEnabled = !!interactive;
          yawRef.current = initialYaw;
          pitchRef.current = initialPitch;
          fovRef.current = DEFAULT_FOV;
          emitView();
        }

        frameId = window.requestAnimationFrame(animate);
        return;
      }

      renderViewer();
      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("wheel", onWheel);

      hotspotMeshes.forEach((mesh) => {
        perspectiveScene.remove(mesh);
        if (mesh.material instanceof THREE.SpriteMaterial) {
          mesh.material.map?.dispose();
          mesh.material.dispose();
        }
      });

      quad.geometry.dispose();
      shaderMaterial.dispose();
      sphereGeometry.dispose();
      if (sphereMaterial.map) {
        sphereMaterial.map.dispose();
      }
      sphereMaterial.dispose();
      loadedTexture?.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === root) {
        root.removeChild(renderer.domElement);
      }
    };
  }, [
    image,
    hotspots,
    initialYaw,
    initialPitch,
    initialFov,
    minFov,
    maxFov,
    interactive,
    onViewChange,
    onHotspotClick,
    introEnabled,
  ]);

  return <div ref={rootRef} className="absolute inset-0 overflow-hidden bg-black" />;
}
