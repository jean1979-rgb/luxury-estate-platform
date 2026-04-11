"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Viewer360Hotspot } from "./Viewer360.types";

type HotspotType =
  | "nav"
  | "stairs-up"
  | "stairs-down"
  | "terrace"
  | "room"
  | "amenity"
  | "kitchen";

type HotspotSize = "sm" | "md" | "lg";

type Viewer360CoreProps = {
  image: string;
  initialYaw?: number;
  initialPitch?: number;
  initialFov?: number;
  minFov?: number;
  maxFov?: number;
  hotspots?: Viewer360Hotspot[];
  interactive?: boolean;
  editable?: boolean;
  onViewChange?: (view: { yaw: number; pitch: number }) => void;
  onHotspotClick?: (targetSceneId?: string) => void;
  onSceneClick?: (coords: { yaw: number; pitch: number }) => void;
  introEnabled?: boolean;
};

type RuntimeState = {
  renderer: THREE.WebGLRenderer;
  orthoScene: THREE.Scene;
  orthoCamera: THREE.OrthographicCamera;
  perspectiveScene: THREE.Scene;
  perspectiveCamera: THREE.PerspectiveCamera;
  uniforms: {
    uTexture: { value: THREE.Texture | null };
    uResolution: { value: THREE.Vector2 };
    uZoom: { value: number };
    uYaw: { value: number };
    uTilt: { value: number };
    uOpacity: { value: number };
  };
  shaderMaterial: THREE.ShaderMaterial;
  quad: THREE.Mesh;
  sphereGeometry: THREE.SphereGeometry;
  sphereMaterial: THREE.MeshBasicMaterial;
  sphere: THREE.Mesh;
  hotspotMeshes: THREE.Sprite[];
  hotspotTextures: THREE.Texture[];
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;
  resizeObserver: ResizeObserver;
  loadedTexture: THREE.Texture | null;
  sphereTexture: THREE.Texture | null;
  frameId: number;
  disposed: boolean;
  mode: "loading" | "planet-hold" | "planet-move" | "viewer";
  interactionEnabled: boolean;
  viewerUnlockAt: number;
  holdStart: number;
  moveStart: number;
  isPointerDown: boolean;
  pointerMoved: boolean;
  activePointerId: number | null;
  pointerStartX: number;
  pointerStartY: number;
  dragStartYaw: number;
  dragStartPitch: number;
};

const DEFAULT_FOV = 90;
const MIN_FOV = 45;
const MAX_FOV = 95;
const WHEEL_ZOOM_STEP = 0.035;
const DRAG_SENSITIVITY = 0.12;
const DRAG_THRESHOLD_PX = 8;
const MAX_PITCH = 85;
const SPHERE_RADIUS = 500;
const HOTSPOT_RADIUS = 505;

const INTRO_HOLD_MS = 300;
const INTRO_MOVE_MS = 2600;
const INTRO_VIEWER_LOCK_THRESHOLD = 0.985;
const VIEWER_UNLOCK_DELAY_MS = 30;
const VIEW_CHANGE_THRESHOLD_DEG = 0.05;
const PLANET_YAW_OFFSET_DEG = -12;

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
  p.x *= -aspect;
  p *= uZoom;

  float r2 = dot(p, p);

  vec3 dir = normalize(vec3(
    2.0 * p.x,
    r2 - 1.0,
    2.0 * p.y
  ));

  dir = rotateY(uYaw) * rotateX(uTilt) * dir;

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

function angularDeltaDeg(a: number, b: number) {
  const diff = ((a - b + 540) % 360) - 180;
  return Math.abs(diff);
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

function targetFromYawPitch(yaw: number, pitch: number) {
  return viewToVector(yaw, pitch);
}

function hotspotToVector(yaw: number, pitch: number, radius = HOTSPOT_RADIUS) {
  return viewToVector(yaw, pitch).multiplyScalar(radius);
}

function vector3ToHotspot(point: THREE.Vector3) {
  const normalized = point.clone().normalize();
  const pitch = THREE.MathUtils.radToDeg(Math.asin(normalized.y));
  const yaw = THREE.MathUtils.radToDeg(Math.atan2(normalized.z, normalized.x));

  return {
    yaw: Number(normalizeYaw(yaw).toFixed(2)),
    pitch: Number(clamp(pitch, -MAX_PITCH, MAX_PITCH).toFixed(2)),
  };
}

function createHotspotTexture(
  label = "GO",
  editable = false,
  type: HotspotType = "nav"
) {
  const size = 320;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const presets: Record<HotspotType, { icon: string; accent: string }> = {
    nav: { icon: "➜", accent: "#D4AF37" },
    "stairs-up": { icon: "↑", accent: "#7DD3FC" },
    "stairs-down": { icon: "↓", accent: "#38BDF8" },
    terrace: { icon: "T", accent: "#34D399" },
    room: { icon: "R", accent: "#C084FC" },
    amenity: { icon: "★", accent: "#F472B6" },
    kitchen: { icon: "K", accent: "#FB923C" },
  };

  const preset = presets[type] || presets.nav;

  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = 128;
  const outerRadius = 108;
  const innerRadius = 82;

  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
  ctx.fillStyle = editable ? "rgba(160,160,160,0.58)" : "rgba(0,0,0,0.62)";
  ctx.fill();

  ctx.lineWidth = 12;
  ctx.strokeStyle = editable ? "rgba(255,255,255,0.78)" : preset.accent;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
  ctx.fillStyle = editable ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.08)";
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 72px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(preset.icon, cx, cy + 2);

  const safeLabel = String(label || "").trim().slice(0, 18);
  if (safeLabel) {
    const pillWidth = 244;
    const pillHeight = 52;
    const pillX = (size - pillWidth) / 2;
    const pillY = 232;

    ctx.fillStyle = "rgba(0,0,0,0.62)";
    ctx.fillRect(pillX, pillY, pillWidth, pillHeight);

    ctx.lineWidth = 2;
    ctx.strokeStyle = editable
      ? "rgba(255,255,255,0.38)"
      : "rgba(255,255,255,0.18)";
    ctx.strokeRect(pillX, pillY, pillWidth, pillHeight);

    ctx.fillStyle = "#ffffff";
    ctx.font = "600 24px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(safeLabel, cx, pillY + pillHeight / 2 + 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
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
  editable = false,
  onViewChange,
  onHotspotClick,
  onSceneClick,
  introEnabled = false,
}: Viewer360CoreProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<RuntimeState | null>(null);

  const onViewChangeRef = useRef(onViewChange);
  const onHotspotClickRef = useRef(onHotspotClick);
  const onSceneClickRef = useRef(onSceneClick);

  const targetViewRef = useRef({
    yaw: initialYaw,
    pitch: initialPitch,
    fov: initialFov,
  });

  const liveViewRef = useRef({
    yaw: initialYaw,
    pitch: initialPitch,
    fov: initialFov,
  });

  const interactiveRef = useRef(interactive);
  const editableRef = useRef(editable);
  const minFovRef = useRef(minFov);
  const maxFovRef = useRef(maxFov);

  const hotspotDataRef = useRef(hotspots);
  const lastEmittedViewRef = useRef<{ yaw: number; pitch: number } | null>(null);

  onViewChangeRef.current = onViewChange;
  onHotspotClickRef.current = onHotspotClick;
  onSceneClickRef.current = onSceneClick;

  targetViewRef.current = {
    yaw: initialYaw,
    pitch: initialPitch,
    fov: initialFov,
  };

  interactiveRef.current = interactive;
  editableRef.current = editable;
  minFovRef.current = minFov;
  maxFovRef.current = maxFov;
  hotspotDataRef.current = hotspots;

  function emitView(force = false) {
    const payload = {
      yaw: Number(normalizeYaw(liveViewRef.current.yaw).toFixed(2)),
      pitch: Number(
        clamp(liveViewRef.current.pitch, -MAX_PITCH, MAX_PITCH).toFixed(2)
      ),
    };

    if (!force && lastEmittedViewRef.current) {
      const last = lastEmittedViewRef.current;
      const yawDelta = angularDeltaDeg(payload.yaw, last.yaw);
      const pitchDelta = Math.abs(payload.pitch - last.pitch);

      if (
        yawDelta < VIEW_CHANGE_THRESHOLD_DEG &&
        pitchDelta < VIEW_CHANGE_THRESHOLD_DEG
      ) {
        return;
      }
    }

    lastEmittedViewRef.current = payload;
    onViewChangeRef.current?.(payload);
  }

  function renderViewer(
    runtime: RuntimeState,
    nextYaw = liveViewRef.current.yaw,
    nextPitch = liveViewRef.current.pitch,
    nextFov = liveViewRef.current.fov
  ) {
    runtime.perspectiveCamera.fov = clamp(
      nextFov,
      minFovRef.current,
      maxFovRef.current
    );
    runtime.perspectiveCamera.updateProjectionMatrix();

    const target = targetFromYawPitch(
      normalizeYaw(nextYaw),
      clamp(nextPitch, -MAX_PITCH, MAX_PITCH)
    );

    runtime.perspectiveCamera.lookAt(target);
    runtime.renderer.render(runtime.perspectiveScene, runtime.perspectiveCamera);
  }

  function animateViewerZoom(
    runtime: RuntimeState,
    yaw: number,
    pitch: number,
    endFov: number
  ) {
    runtime.interactionEnabled = false;

    const startFov = 98;
    const nearFov = 82;
    const settleFov = endFov;
    const durationMs = 700;
    const start = performance.now();

    liveViewRef.current = {
      yaw,
      pitch,
      fov: startFov,
    };

    const step = (now: number) => {
      const currentRuntime = runtimeRef.current;
      if (!currentRuntime || currentRuntime.disposed) return;

      const t = Math.min((now - start) / durationMs, 1);

      let fov: number;
      if (t < 0.62) {
        const a = t / 0.62;
        fov = startFov + (nearFov - startFov) * a;
      } else {
        const b = (t - 0.62) / 0.38;
        fov = nearFov + (settleFov - nearFov) * b;
      }

      liveViewRef.current = {
        yaw,
        pitch,
        fov,
      };

      renderViewer(currentRuntime, yaw, pitch, fov);

      if (t < 1) {
        currentRuntime.frameId = window.requestAnimationFrame(step);
      } else {
        liveViewRef.current = {
          yaw,
          pitch,
          fov: settleFov,
        };
        renderViewer(currentRuntime, yaw, pitch, settleFov);
        currentRuntime.interactionEnabled = !!interactiveRef.current;
      }
    };

    runtime.frameId = window.requestAnimationFrame(step);
  }

  function clearHotspots(runtime: RuntimeState) {
    runtime.hotspotMeshes.forEach((mesh) => {
      runtime.perspectiveScene.remove(mesh);
      if (mesh.material instanceof THREE.SpriteMaterial) {
        mesh.material.map?.dispose();
        mesh.material.dispose();
      }
    });
    runtime.hotspotMeshes.length = 0;

    runtime.hotspotTextures.forEach((texture) => texture.dispose());
    runtime.hotspotTextures.length = 0;
  }

  function syncHotspots() {
    const runtime = runtimeRef.current;
    if (!runtime) return;

    clearHotspots(runtime);

    hotspotDataRef.current.forEach((hotspot) => {
      const richHotspot = hotspot as Viewer360Hotspot & {
        type?: HotspotType;
        size?: HotspotSize;
        label?: string;
        targetSceneId?: string;
      };

      const hotspotTexture = createHotspotTexture(
        richHotspot.label || (editableRef.current ? "EDIT" : "GO"),
        editableRef.current,
        richHotspot.type || "nav"
      );

      if (!hotspotTexture) return;
      runtime.hotspotTextures.push(hotspotTexture);

      const spriteMaterial = new THREE.SpriteMaterial({
        map: hotspotTexture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });

      const sprite = new THREE.Sprite(spriteMaterial);

      const sizeMap: Record<HotspotSize, number> = {
        sm: 64,
        md: 90,
        lg: 120,
      };

      const spriteSize = sizeMap[richHotspot.size || "md"] || 90;

      sprite.position.copy(
        hotspotToVector(Number(hotspot.yaw || 0), Number(hotspot.pitch || 0))
      );
      sprite.scale.set(spriteSize, spriteSize, 1);
      sprite.userData = {
        hotspotId: hotspot.id,
        targetSceneId: richHotspot.targetSceneId,
        label: richHotspot.label,
      };

      runtime.perspectiveScene.add(sprite);
      runtime.hotspotMeshes.push(sprite);
    });
  }

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime || runtime.mode !== "viewer") return;

    liveViewRef.current = {
      yaw: initialYaw,
      pitch: initialPitch,
      fov: initialFov,
    };
    targetViewRef.current = {
      yaw: initialYaw,
      pitch: initialPitch,
      fov: initialFov,
    };

    emitView(true);
    renderViewer(runtime, initialYaw, initialPitch, initialFov);
  }, [initialYaw, initialPitch, initialFov]);

  useEffect(() => {
    syncHotspots();
  }, [hotspots, editable]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;

    runtime.interactionEnabled =
      runtime.mode === "viewer" ? !!interactiveRef.current : runtime.interactionEnabled;
  }, [interactive]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !image) return;

    let resizeHandler: (() => void) | null = null;
    let pointerMoveHandler: ((event: PointerEvent) => void) | null = null;
    let pointerUpHandler: ((event: PointerEvent) => void) | null = null;
    let pointerCancelHandler: (() => void) | null = null;
    let pointerDownHandler: ((event: PointerEvent) => void) | null = null;
    let wheelHandler: ((event: WheelEvent) => void) | null = null;

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
    renderer.domElement.style.overscrollBehavior = "contain";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.userSelect = "none";

    root.innerHTML = "";
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

    const resizeObserver = new ResizeObserver(() => {
      if (!runtimeRef.current) return;
      const width = Math.max(root.clientWidth || window.innerWidth, 1);
      const height = Math.max(root.clientHeight || window.innerHeight, 1);
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width, height);
      perspectiveCamera.aspect = width / height;
      perspectiveCamera.updateProjectionMatrix();
    });

    const runtime: RuntimeState = {
      renderer,
      orthoScene,
      orthoCamera,
      perspectiveScene,
      perspectiveCamera,
      uniforms,
      shaderMaterial,
      quad,
      sphereGeometry,
      sphereMaterial,
      sphere,
      hotspotMeshes: [],
      hotspotTextures: [],
      raycaster: new THREE.Raycaster(),
      pointer: new THREE.Vector2(),
      resizeObserver,
      loadedTexture: null,
      sphereTexture: null,
      frameId: 0,
      disposed: false,
      mode: introEnabled ? "loading" : "viewer",
      interactionEnabled: !introEnabled && !!interactiveRef.current,
      viewerUnlockAt: 0,
      holdStart: 0,
      moveStart: 0,
      isPointerDown: false,
      pointerMoved: false,
      activePointerId: null,
      pointerStartX: 0,
      pointerStartY: 0,
      dragStartYaw: initialYaw,
      dragStartPitch: initialPitch,
    };

    runtimeRef.current = runtime;

    const resize = () => {
      const width = Math.max(root.clientWidth || window.innerWidth, 1);
      const height = Math.max(root.clientHeight || window.innerHeight, 1);
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width, height);
      perspectiveCamera.aspect = width / height;
      perspectiveCamera.updateProjectionMatrix();
    };

    resize();
    resizeObserver.observe(root);
    window.addEventListener("resize", resize);
    resizeHandler = resize;

    const getPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      runtime.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      runtime.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const getHotspotIntersection = (event: PointerEvent) => {
      getPointer(event);
      runtime.raycaster.setFromCamera(runtime.pointer, perspectiveCamera);
      const intersections = runtime.raycaster.intersectObjects(runtime.hotspotMeshes, false);
      return intersections[0] ?? null;
    };

    const getSphereIntersection = (event: PointerEvent) => {
      getPointer(event);
      runtime.raycaster.setFromCamera(runtime.pointer, perspectiveCamera);
      const intersections = runtime.raycaster.intersectObject(sphere, false);
      return intersections[0] ?? null;
    };

    const updateCursor = (event?: PointerEvent) => {
      if (!runtime.interactionEnabled || !interactiveRef.current || runtime.mode !== "viewer") {
        renderer.domElement.style.cursor = editableRef.current ? "crosshair" : "default";
        return;
      }

      if (event && !runtime.isPointerDown) {
        const hit = getHotspotIntersection(event);
        if (hit) {
          renderer.domElement.style.cursor = "pointer";
          return;
        }
      }

      renderer.domElement.style.cursor = runtime.isPointerDown ? "grabbing" : "grab";
    };

    pointerDownHandler = (event: PointerEvent) => {
      if (!runtime.interactionEnabled || !interactiveRef.current || runtime.mode !== "viewer") {
        return;
      }

      runtime.isPointerDown = true;
      runtime.pointerMoved = false;
      runtime.activePointerId = event.pointerId;
      runtime.pointerStartX = event.clientX;
      runtime.pointerStartY = event.clientY;
      runtime.dragStartYaw = liveViewRef.current.yaw;
      runtime.dragStartPitch = liveViewRef.current.pitch;

      try {
        renderer.domElement.setPointerCapture(event.pointerId);
      } catch {}

      updateCursor(event);
    };

    pointerMoveHandler = (event: PointerEvent) => {
      if (!runtimeRef.current) return;

      if (!runtime.interactionEnabled || !interactiveRef.current || runtime.mode !== "viewer") {
        updateCursor(event);
        return;
      }

      if (!runtime.isPointerDown) {
        updateCursor(event);
        return;
      }

      if (runtime.activePointerId !== null && event.pointerId !== runtime.activePointerId) {
        return;
      }

      const dx = event.clientX - runtime.pointerStartX;
      const dy = event.clientY - runtime.pointerStartY;

      if (Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX) {
        runtime.pointerMoved = true;
      }

      liveViewRef.current.yaw = normalizeYaw(runtime.dragStartYaw - dx * DRAG_SENSITIVITY);
      liveViewRef.current.pitch = clamp(
        runtime.dragStartPitch + dy * DRAG_SENSITIVITY,
        -MAX_PITCH,
        MAX_PITCH
      );

      emitView();
      updateCursor(event);
    };

    pointerUpHandler = (event: PointerEvent) => {
      if (!runtimeRef.current) return;
      if (runtime.activePointerId !== null && event.pointerId !== runtime.activePointerId) {
        return;
      }

      const hadPointerDown = runtime.isPointerDown;
      const moved = runtime.pointerMoved;

      runtime.isPointerDown = false;
      runtime.pointerMoved = false;

      try {
        renderer.domElement.releasePointerCapture(event.pointerId);
      } catch {}

      runtime.activePointerId = null;

      if (!runtime.interactionEnabled || !interactiveRef.current || runtime.mode !== "viewer") {
        updateCursor(event);
        return;
      }

      if (hadPointerDown && !moved) {
        const hotspotHit = getHotspotIntersection(event);
        if (hotspotHit) {
          onHotspotClickRef.current?.(
            (hotspotHit.object.userData?.targetSceneId as string | undefined) ?? undefined
          );
          updateCursor(event);
          return;
        }

        if (editableRef.current || onSceneClickRef.current) {
          const sphereHit = getSphereIntersection(event);
          if (sphereHit?.point) {
            onSceneClickRef.current?.(vector3ToHotspot(sphereHit.point));
          }
        }
      }

      updateCursor(event);
    };

    pointerCancelHandler = () => {
      runtime.isPointerDown = false;
      runtime.pointerMoved = false;
      runtime.activePointerId = null;
      updateCursor();
    };

    wheelHandler = (event: WheelEvent) => {
      if (!runtime.interactionEnabled || !interactiveRef.current || runtime.mode !== "viewer") {
        return;
      }

      event.preventDefault();

      const nextFov =
        liveViewRef.current.fov +
        Math.sign(event.deltaY) * Math.abs(event.deltaY) * WHEEL_ZOOM_STEP;

      liveViewRef.current.fov = clamp(nextFov, minFovRef.current, maxFovRef.current);
    };

    window.addEventListener("pointermove", pointerMoveHandler);
    window.addEventListener("pointerup", pointerUpHandler);
    window.addEventListener("pointercancel", pointerCancelHandler);
    renderer.domElement.addEventListener("pointerdown", pointerDownHandler);
    renderer.domElement.addEventListener("pointermove", pointerMoveHandler);
    renderer.domElement.addEventListener("wheel", wheelHandler, { passive: false });

    syncHotspots();
    updateCursor();

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    const introTarget = {
      yaw: targetViewRef.current.yaw,
      pitch: targetViewRef.current.pitch,
      fov: targetViewRef.current.fov,
    };

    const END_YAW = -Math.PI / 2 - THREE.MathUtils.degToRad(introTarget.yaw + PLANET_YAW_OFFSET_DEG);
    const START_YAW = END_YAW + Math.PI;
    const START_ZOOM = 8.2;
    const END_ZOOM = 0.78;
    const START_TILT = THREE.MathUtils.degToRad(0.0);
    const END_TILT = THREE.MathUtils.degToRad(90 - introTarget.pitch);

    loader.load(
      image,
      (texture) => {
        const currentRuntime = runtimeRef.current;
        if (!currentRuntime || currentRuntime.disposed) {
          texture.dispose();
          return;
        }

        currentRuntime.loadedTexture = texture;
        currentRuntime.loadedTexture.colorSpace = THREE.SRGBColorSpace;
        currentRuntime.loadedTexture.minFilter = THREE.LinearFilter;
        currentRuntime.loadedTexture.magFilter = THREE.LinearFilter;
        currentRuntime.loadedTexture.generateMipmaps = false;
        currentRuntime.loadedTexture.flipY = false;
        currentRuntime.loadedTexture.needsUpdate = true;

        currentRuntime.sphereTexture = currentRuntime.loadedTexture.clone();
        currentRuntime.sphereTexture.colorSpace = THREE.SRGBColorSpace;
        currentRuntime.sphereTexture.minFilter = THREE.LinearFilter;
        currentRuntime.sphereTexture.magFilter = THREE.LinearFilter;
        currentRuntime.sphereTexture.generateMipmaps = false;
        currentRuntime.sphereTexture.flipY = true;
        currentRuntime.sphereTexture.needsUpdate = true;

        uniforms.uTexture.value = currentRuntime.loadedTexture;
        sphereMaterial.map = currentRuntime.sphereTexture;
        sphereMaterial.needsUpdate = true;

        if (introEnabled) {
          currentRuntime.holdStart = performance.now();
          currentRuntime.mode = "planet-hold";
          currentRuntime.interactionEnabled = !!interactiveRef.current;
        } else {
          const handoffRuntime = runtimeRef.current ?? currentRuntime;
              handoffRuntime.mode = "viewer";
              handoffRuntime.interactionEnabled = !!interactiveRef.current;
              liveViewRef.current = { yaw: introTarget.yaw, pitch: introTarget.pitch, fov: 95 };
              targetViewRef.current = { yaw: introTarget.yaw, pitch: introTarget.pitch, fov: 65 };
              uniforms.uOpacity.value = 0.0;
              emitView(true);


              // 🔥 ZOOM REAL DESPUÉS DEL HANDOFF
              if (introEnabled) {
                const runtimeNow = runtimeRef.current;
                if (!runtimeNow) return;

                runtimeNow.interactionEnabled = false;

                let startTime = performance.now();
                const DURATION = 1200;

                const START_FOV = 110;
                const MID_FOV = 55;
                const END_FOV = 70;

                liveViewRef.current.fov = START_FOV;

                const animate = (now: number) => {
                  const t = Math.min((now - startTime) / DURATION, 1);

                  // easing suave
                  const ease = t < 0.5
                    ? 4 * t * t * t
                    : 1 - Math.pow(-2 * t + 2, 3) / 2;

                  let fov;

                  if (t < 0.6) {
                    const tt = t / 0.6;
                    fov = START_FOV + (MID_FOV - START_FOV) * tt;
                  } else {
                    const tt = (t - 0.6) / 0.4;
                    fov = MID_FOV + (END_FOV - MID_FOV) * tt;
                  }

                  liveViewRef.current.fov = fov;

                  renderViewer(
                    runtimeNow,
                    introTarget.yaw,
                    introTarget.pitch,
                    fov
                  );

                  if (t < 1) {
                    requestAnimationFrame(animate);
                  } else {
                    runtimeNow.interactionEnabled = true;
                  }
                };

                requestAnimationFrame(animate);
              }

renderViewer(
                handoffRuntime,
                introTarget.yaw,
                introTarget.pitch,
                introTarget.fov
              );
              requestAnimationFrame(() => {
                const currentRuntime = runtimeRef.current;
                if (!currentRuntime || currentRuntime.disposed) return;
                currentRuntime.uniforms.uOpacity.value = 1.0;
                renderViewer(
                  currentRuntime,
                  introTarget.yaw,
                  introTarget.pitch,
                  introTarget.fov
                );
              });
              requestAnimationFrame(() => {
                const currentRuntime = runtimeRef.current;
                if (!currentRuntime || currentRuntime.disposed) return;
                currentRuntime.uniforms.uOpacity.value = 1.0;
                renderViewer(
                  currentRuntime,
                  introTarget.yaw,
                  introTarget.pitch,
                  introTarget.fov
                );
              });
          currentRuntime.interactionEnabled = !!interactiveRef.current;
          liveViewRef.current = {
            yaw: introTarget.yaw,
            pitch: introTarget.pitch,
            fov: introTarget.fov,
          };
          emitView(true);
          renderViewer(currentRuntime, introTarget.yaw, introTarget.pitch, introTarget.fov);
        }
      },
      undefined,
      (err) => {
        console.error("Error loading 360 texture:", err);
      }
    );

    const animate = (now: number) => {
      const currentRuntime = runtimeRef.current;
      if (!currentRuntime || currentRuntime.disposed) return;

      if (currentRuntime.mode === "loading") {
        currentRuntime.frameId = window.requestAnimationFrame(animate);
        return;
      }

      if (currentRuntime.mode === "planet-hold") {
        uniforms.uZoom.value = START_ZOOM;
        uniforms.uYaw.value = START_YAW;
        uniforms.uTilt.value = START_TILT;
        uniforms.uOpacity.value = 1.0;

        renderer.render(orthoScene, orthoCamera);

        if (now - currentRuntime.holdStart >= INTRO_HOLD_MS) {
          currentRuntime.moveStart = now;
          currentRuntime.mode = "planet-move";
        }

        currentRuntime.frameId = window.requestAnimationFrame(animate);
        return;
      }

      if (currentRuntime.mode === "planet-move") {
        const t = clamp01((now - currentRuntime.moveStart) / INTRO_MOVE_MS);
        const moveT = easeInOutCubic(t);

        if (t >= INTRO_VIEWER_LOCK_THRESHOLD) {
          liveViewRef.current = {
            yaw: introTarget.yaw,
            pitch: introTarget.pitch,
            fov: introTarget.fov,
          };
          targetViewRef.current = {
            yaw: introTarget.yaw,
            pitch: introTarget.pitch,
            fov: introTarget.fov,
          };
          currentRuntime.mode = "viewer";
          currentRuntime.interactionEnabled = !!interactiveRef.current;
          currentRuntime.viewerUnlockAt = now + 900;
          emitView(true);
          renderViewer(currentRuntime, introTarget.yaw, introTarget.pitch, introTarget.fov);
          currentRuntime.frameId = window.requestAnimationFrame(animate);
          return;
        }

        uniforms.uZoom.value = THREE.MathUtils.lerp(START_ZOOM, END_ZOOM, moveT);
        uniforms.uYaw.value = START_YAW;
        uniforms.uTilt.value = THREE.MathUtils.lerp(START_TILT, END_TILT, moveT);
        uniforms.uOpacity.value = 1.0;

        renderer.render(orthoScene, orthoCamera);

        currentRuntime.frameId = window.requestAnimationFrame(animate);
        return;
      }

      if (!currentRuntime.interactionEnabled && now >= currentRuntime.viewerUnlockAt) {
        currentRuntime.interactionEnabled = !!interactiveRef.current;
      }

      renderViewer(currentRuntime);
      currentRuntime.frameId = window.requestAnimationFrame(animate);
    };

    runtime.frameId = window.requestAnimationFrame(animate);

    return () => {
      const currentRuntime = runtimeRef.current;
      if (!currentRuntime) return;

      currentRuntime.disposed = true;
      window.cancelAnimationFrame(currentRuntime.frameId);

      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      if (pointerMoveHandler) window.removeEventListener("pointermove", pointerMoveHandler);
      if (pointerUpHandler) window.removeEventListener("pointerup", pointerUpHandler);
      if (pointerCancelHandler) window.removeEventListener("pointercancel", pointerCancelHandler);

      if (pointerDownHandler) {
        renderer.domElement.removeEventListener("pointerdown", pointerDownHandler);
      }
      if (pointerMoveHandler) {
        renderer.domElement.removeEventListener("pointermove", pointerMoveHandler);
      }
      if (wheelHandler) {
        renderer.domElement.removeEventListener("wheel", wheelHandler);
      }

      currentRuntime.resizeObserver.disconnect();

      clearHotspots(currentRuntime);

      currentRuntime.quad.geometry.dispose();
      currentRuntime.shaderMaterial.dispose();
      currentRuntime.sphereGeometry.dispose();

      if (currentRuntime.sphereMaterial.map) {
        currentRuntime.sphereMaterial.map.dispose();
      }
      currentRuntime.sphereMaterial.dispose();

      currentRuntime.loadedTexture?.dispose();
      currentRuntime.sphereTexture?.dispose();

      currentRuntime.renderer.dispose();

      if (currentRuntime.renderer.domElement.parentNode === root) {
        root.removeChild(currentRuntime.renderer.domElement);
      }

      runtimeRef.current = null;
    };
  }, [image, introEnabled]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div ref={rootRef} className="absolute inset-0" />
      {editable ? (
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="absolute left-1/2 top-1/2 h-8 w-px -translate-x-1/2 -translate-y-1/2 bg-amber-300/90 shadow-[0_0_10px_rgba(252,211,77,0.65)]" />
          <div className="absolute left-1/2 top-1/2 h-px w-8 -translate-x-1/2 -translate-y-1/2 bg-amber-300/90 shadow-[0_0_10px_rgba(252,211,77,0.65)]" />
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300/90 bg-amber-300/10 shadow-[0_0_12px_rgba(252,211,77,0.45)]" />
        </div>
      ) : null}
    </div>
  );
}
