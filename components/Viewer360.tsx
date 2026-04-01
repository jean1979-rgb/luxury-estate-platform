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
};

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
  const outerRadius = 92;
  const innerRadius = 70;

  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
  ctx.fillStyle = editable ? "rgba(160,160,160,0.58)" : "rgba(0,0,0,0.62)";
  ctx.fill();

  ctx.lineWidth = 10;
  ctx.strokeStyle = editable ? "rgba(255,255,255,0.78)" : preset.accent;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
  ctx.fillStyle = editable ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.08)";
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 64px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(preset.icon, cx, cy + 2);

  const safeLabel = String(label || "").trim().slice(0, 18);
  if (safeLabel) {
    const pillWidth = 220;
    const pillHeight = 46;
    const pillX = (size - pillWidth) / 2;
    const pillY = 236;

    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 18);
    ctx.fillStyle = "rgba(0,0,0,0.62)";
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = editable ? "rgba(255,255,255,0.38)" : "rgba(255,255,255,0.18)";
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "600 22px Arial, sans-serif";
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
}: Viewer360Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !image) return;

    let animationId = 0;
    let isPointerDown = false;
    let pointerMoved = false;

    const hotspotSprites: THREE.Sprite[] = [];
    const hotspotTextures: THREE.Texture[] = [];

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      90,
      Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1),
      0.1,
      2000
    );
    camera.position.set(0, 0, 0.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(
      Math.max(container.clientWidth, 1),
      Math.max(container.clientHeight, 1)
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(500, 96, 64);
    geometry.scale(-1, 1, 1);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");

    const texture = textureLoader.load(image);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphereMesh = new THREE.Mesh(geometry, material);
    scene.add(sphereMesh);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = -0.35;
    controls.zoomSpeed = 0.8;
    controls.enablePan = false;
    controls.minDistance = 0.1;
    controls.maxDistance = 0.1;
    controls.minPolarAngle = 0.15;
    controls.maxPolarAngle = Math.PI - 0.15;

    const yawRad = THREE.MathUtils.degToRad(initialYaw);
    const pitchRad = THREE.MathUtils.degToRad(initialPitch);

    const target = new THREE.Vector3(
      Math.cos(pitchRad) * Math.cos(yawRad),
      Math.sin(pitchRad),
      Math.cos(pitchRad) * Math.sin(yawRad)
    );

    controls.target.copy(target);
    controls.update();

    const hotspotGroup = new THREE.Group();
    scene.add(hotspotGroup);

    const visibleHotspots = Array.isArray(hotspots) ? hotspots : [];

    for (const hotspot of visibleHotspots) {
      const hotspotTexture = createHotspotTexture(
        hotspot.label || (editable ? "EDIT" : "GO"),
        editable,
        hotspot.type || "nav"
      );
      if (!hotspotTexture) continue;

      hotspotTextures.push(hotspotTexture);

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
        440
      );

      sprite.position.copy(position);
      sprite.scale.set(126, 126, 1);
      sprite.userData = {
        hotspotId: hotspot.id,
        targetSceneId: hotspot.targetSceneId,
        label: hotspot.label,
      };

      hotspotGroup.add(sprite);
      hotspotSprites.push(sprite);
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function onResize() {
      const safeContainer = mountRef.current;
      if (!safeContainer) return;

      const width = Math.max(safeContainer.clientWidth, 1);
      const height = Math.max(safeContainer.clientHeight, 1);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            onResize();
          })
        : null;

    if (resizeObserver) {
      resizeObserver.observe(container);
    }

    function onWheel(event: WheelEvent) {
      event.preventDefault();

      const nextFov = THREE.MathUtils.clamp(
        camera.fov + (event.deltaY > 0 ? 4 : -4),
        45,
        100
      );

      if (nextFov !== camera.fov) {
        camera.fov = nextFov;
        camera.updateProjectionMatrix();
      }
    }

    function getPointer(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function updateHover(event: PointerEvent) {
      getPointer(event);
      raycaster.setFromCamera(pointer, camera);
      const intersections = raycaster.intersectObjects(hotspotSprites);

      if (intersections.length > 0) {
        renderer.domElement.style.cursor = "pointer";
        return;
      }

      renderer.domElement.style.cursor = editable ? "crosshair" : "grab";
    }

    function onPointerDown() {
      isPointerDown = true;
      pointerMoved = false;
      renderer.domElement.style.cursor = editable ? "crosshair" : "grabbing";
    }

    function onPointerMove(event: PointerEvent) {
      if (isPointerDown) {
        pointerMoved = true;
      }
      updateHover(event);
    }

    function onPointerUp(event: PointerEvent) {
      const wasDragging = pointerMoved;
      isPointerDown = false;

      updateHover(event);

      if (wasDragging) return;

      getPointer(event);
      raycaster.setFromCamera(pointer, camera);

      const hotspotIntersections = raycaster.intersectObjects(hotspotSprites);
      if (hotspotIntersections.length > 0) {
        const first = hotspotIntersections[0]?.object;
        const targetSceneId = first?.userData?.targetSceneId;

        if (targetSceneId) {
          onHotspotClick?.(targetSceneId);
        }
        return;
      }

      if (!editable || !onSceneClick) return;

      const sphereIntersections = raycaster.intersectObject(sphereMesh);
      if (sphereIntersections.length === 0) return;

      const point = sphereIntersections[0].point;
      const coords = vector3ToHotspot(point);
      onSceneClick(coords);
    }

    function onPointerLeave() {
      isPointerDown = false;
      pointerMoved = false;
      renderer.domElement.style.cursor = editable ? "crosshair" : "grab";
    }

    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);

    window.addEventListener("resize", onResize);

    function animate() {
      animationId = window.requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    renderer.domElement.style.cursor = editable ? "crosshair" : "grab";
    onResize();
    animate();

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      resizeObserver?.disconnect();

      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);

      controls.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();

      hotspotSprites.forEach((sprite) => {
        const spriteMaterial = sprite.material;
        if (spriteMaterial instanceof THREE.SpriteMaterial) {
          spriteMaterial.dispose();
        }
      });

      hotspotTextures.forEach((item) => item.dispose());

      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [image, hotspots, onHotspotClick, editable, onSceneClick, initialYaw, initialPitch]);

  return (
    <div
      ref={mountRef}
      className="h-full w-full overflow-hidden"
      style={{ touchAction: "none" }}
    />
  );
}
