"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type HotspotType =
  | "nav"
  | "stairs-up"
  | "stairs-down"
  | "terrace"
  | "room"
  | "amenity"
  | "kitchen";

type Hotspot360 = {
  id: string;
  pitch: number;
  yaw: number;
  label?: string;
  targetSceneId?: string;
  type?: HotspotType;
};

type Viewer360Props = {
  image: string;
  hotspots?: Hotspot360[];
  onHotspotClick?: (targetSceneId?: string) => void;
  editable?: boolean;
  onSceneClick?: (coords: { yaw: number; pitch: number }) => void;
  initialYaw?: number;
  initialPitch?: number;
  onViewChange?: (view: { yaw: number; pitch: number }) => void;
};

const VIEW_CHANGE_THRESHOLD_DEG = 0.05;
const DRAG_THRESHOLD_PX = 8;
const HOTSPOT_RADIUS = 440;
const SPHERE_RADIUS = 500;
const DEFAULT_FOV = 90;
const MIN_FOV = 45;
const MAX_FOV = 95;
const WHEEL_ZOOM_STEP = 0.035;

function hotspotToVector3(yaw: number, pitch: number, radius: number) {
  const yawRad = THREE.MathUtils.degToRad(yaw);
  const pitchRad = THREE.MathUtils.degToRad(pitch);

  const x = radius * Math.cos(pitchRad) * Math.cos(yawRad);
  const y = radius * Math.sin(pitchRad);
  const z = radius * Math.cos(pitchRad) * Math.sin(yawRad);

  return new THREE.Vector3(x, y, z);
}

function vector3ToHotspot(point: THREE.Vector3) {
  const normalized = point.clone().normalize();
  const pitch = THREE.MathUtils.radToDeg(Math.asin(normalized.y));
  const yaw = THREE.MathUtils.radToDeg(Math.atan2(normalized.z, normalized.x));

  return {
    yaw: Number(yaw.toFixed(2)),
    pitch: Number(pitch.toFixed(2)),
  };
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

    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 18);
    ctx.fillStyle = "rgba(0,0,0,0.62)";
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = editable
      ? "rgba(255,255,255,0.38)"
      : "rgba(255,255,255,0.18)";
    ctx.stroke();

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

export default function Viewer360({
  image,
  hotspots = [],
  onHotspotClick,
  editable = false,
  onSceneClick,
  initialYaw = 0,
  initialPitch = 0,
  onViewChange,
}: Viewer360Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const hotspotGroupRef = useRef<THREE.Group | null>(null);

  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const textureRef = useRef<THREE.Texture | null>(null);

  const hotspotTexturesRef = useRef<THREE.Texture[]>([]);
  const lastEmittedViewRef = useRef<{ yaw: number; pitch: number } | null>(null);
  const fovRef = useRef(DEFAULT_FOV);

  const onViewChangeRef = useRef(onViewChange);
  const onHotspotClickRef = useRef(onHotspotClick);
  const onSceneClickRef = useRef(onSceneClick);

  onViewChangeRef.current = onViewChange;
  onHotspotClickRef.current = onHotspotClick;
  onSceneClickRef.current = onSceneClick;

  function emitCurrentView(force = false) {
    const controls = controlsRef.current;
    const handleViewChange = onViewChangeRef.current;
    if (!controls || !handleViewChange) return;

    const camera = cameraRef.current;
    if (!camera) return;

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    const view = vector3ToHotspot(direction);

    if (!force && lastEmittedViewRef.current) {
      const last = lastEmittedViewRef.current;
      const yawDelta = Math.abs(view.yaw - last.yaw);
      const pitchDelta = Math.abs(view.pitch - last.pitch);

      if (
        yawDelta < VIEW_CHANGE_THRESHOLD_DEG &&
        pitchDelta < VIEW_CHANGE_THRESHOLD_DEG
      ) {
        return;
      }
    }

    lastEmittedViewRef.current = view;
    handleViewChange(view);
  }

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationId = 0;
    let isPointerDown = false;
    let pointerMoved = false;
    let pointerDownX = 0;
    let pointerDownY = 0;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      DEFAULT_FOV,
      Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1),
      0.1,
      2000
    );
    camera.position.set(0, 0, 0.1);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(
      Math.max(container.clientWidth, 1),
      Math.max(container.clientHeight, 1)
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.opacity = "0";
    renderer.domElement.style.transition = "opacity 220ms ease";

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(SPHERE_RADIUS, 96, 64);
    geometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicMaterial();
    materialRef.current = material;

    const sphereMesh = new THREE.Mesh(geometry, material);
    sphereMeshRef.current = sphereMesh;
    scene.add(sphereMesh);

    const hotspotGroup = new THREE.Group();
    hotspotGroupRef.current = hotspotGroup;
    scene.add(hotspotGroup);

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = -0.35;
    controls.zoomSpeed = 0.8;
    controls.enablePan = false;
    controls.minDistance = 0.1;
    controls.maxDistance = 2.5;
    controls.minPolarAngle = 0.15;
    controls.maxPolarAngle = Math.PI - 0.15;
    applyFov(DEFAULT_FOV);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function applyFov(nextFov: number) {
      const safeCamera = cameraRef.current;
      if (!safeCamera) return;

      const clamped = THREE.MathUtils.clamp(nextFov, MIN_FOV, MAX_FOV);
      fovRef.current = clamped;
      safeCamera.fov = clamped;
      safeCamera.updateProjectionMatrix();
    }

    function onWheel(event: WheelEvent) {
      event.preventDefault();
      const direction = Math.sign(event.deltaY);
      const nextFov = fovRef.current + direction * (Math.abs(event.deltaY) * WHEEL_ZOOM_STEP);
      applyFov(nextFov);
    }

    function onResize() {
      const safeContainer = mountRef.current;
      const safeCamera = cameraRef.current;
      const safeRenderer = rendererRef.current;

      if (!safeContainer || !safeCamera || !safeRenderer) return;

      const width = Math.max(safeContainer.clientWidth, 1);
      const height = Math.max(safeContainer.clientHeight, 1);

      safeCamera.aspect = width / height;
      safeCamera.updateProjectionMatrix();
      safeRenderer.setSize(width, height);
    }

    function setPointerFromEvent(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function onPointerDown(event: PointerEvent) {
      isPointerDown = true;
      pointerMoved = false;
      pointerDownX = event.clientX;
      pointerDownY = event.clientY;
    }

    function onPointerMove(event: PointerEvent) {
      if (!isPointerDown) return;

      const dx = event.clientX - pointerDownX;
      const dy = event.clientY - pointerDownY;

      if (Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX) {
        pointerMoved = true;
      }
    }

    function onPointerUp(event: PointerEvent) {
      if (!isPointerDown) return;
      isPointerDown = false;

      if (pointerMoved) return;

      setPointerFromEvent(event);
      raycaster.setFromCamera(pointer, camera);

      const hotspotGroupCurrent = hotspotGroupRef.current;
      if (hotspotGroupCurrent) {
        const hotspotHits = raycaster.intersectObjects(
          hotspotGroupCurrent.children,
          false
        );

        if (hotspotHits.length > 0) {
          const hit = hotspotHits[0]?.object as THREE.Sprite | undefined;
          const targetSceneId = hit?.userData?.targetSceneId as
            | string
            | undefined;
          onHotspotClickRef.current?.(targetSceneId);
          return;
        }
      }

      const sphereMeshCurrent = sphereMeshRef.current;
      if (!sphereMeshCurrent) return;

      const sphereHits = raycaster.intersectObject(sphereMeshCurrent, false);
      if (sphereHits.length === 0) return;

      const point = sphereHits[0]?.point;
      if (!point) return;

      onSceneClickRef.current?.(vector3ToHotspot(point));
    }

    const handleControlsChange = () => {
      emitCurrentView(false);
    };

    controls.addEventListener("change", handleControlsChange);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);

    function animate() {
      animationId = window.requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      window.cancelAnimationFrame(animationId);
      controls.removeEventListener("change", handleControlsChange);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("wheel", onWheel);

      hotspotTexturesRef.current.forEach((texture) => texture.dispose());
      hotspotTexturesRef.current = [];

      textureRef.current?.dispose();
      textureRef.current = null;

      material.dispose();
      geometry.dispose();
      controls.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
      sphereMeshRef.current = null;
      hotspotGroupRef.current = null;
      materialRef.current = null;
    };
  }, []);

  useEffect(() => {
    const material = materialRef.current;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;

    if (!material || !renderer || !scene || !camera || !image) return;

    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    loader.load(
      image,
      (newTexture) => {
        if (cancelled) {
          newTexture.dispose();
          return;
        }

        newTexture.colorSpace = THREE.SRGBColorSpace;
        newTexture.minFilter = THREE.LinearFilter;
        newTexture.magFilter = THREE.LinearFilter;

        const oldTexture = material.map as THREE.Texture | null;
        material.map = newTexture;
        material.needsUpdate = true;
        textureRef.current = newTexture;

        if (oldTexture && oldTexture !== newTexture) {
          oldTexture.dispose();
        }

        renderer.render(scene, camera);
        renderer.domElement.style.opacity = "1";
      },
      undefined,
      (err) => {
        console.error("Error loading 360 texture:", err);
        renderer.domElement.style.opacity = "1";
      }
    );

    return () => {
      cancelled = true;
    };
  }, [image]);

  useEffect(() => {
    const hotspotGroup = hotspotGroupRef.current;
    if (!hotspotGroup) return;

    hotspotGroup.clear();
    hotspotTexturesRef.current.forEach((texture) => texture.dispose());
    hotspotTexturesRef.current = [];

    const visibleHotspots = Array.isArray(hotspots) ? hotspots : [];

    for (const hotspot of visibleHotspots) {
      const hotspotTexture = createHotspotTexture(
        hotspot.label || (editable ? "EDIT" : "GO"),
        editable,
        hotspot.type || "nav"
      );

      if (!hotspotTexture) continue;

      hotspotTexturesRef.current.push(hotspotTexture);

      const spriteMaterial = new THREE.SpriteMaterial({
        map: hotspotTexture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });

      const sprite = new THREE.Sprite(spriteMaterial);
      const position = hotspotToVector3(
        Number(hotspot.yaw || 0),
        Number(hotspot.pitch || 0),
        HOTSPOT_RADIUS
      );

      sprite.position.copy(position);
      sprite.scale.set(168, 168, 1);
      sprite.userData = {
        hotspotId: hotspot.id,
        targetSceneId: hotspot.targetSceneId,
        label: hotspot.label,
      };

      hotspotGroup.add(sprite);
    }
  }, [hotspots, editable]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const target = targetFromYawPitch(initialYaw, initialPitch);
    controls.target.copy(target);
    controls.update();
    emitCurrentView(true);
  }, [initialYaw, initialPitch]);

  return <div ref={mountRef} className="h-full w-full" />;
}
