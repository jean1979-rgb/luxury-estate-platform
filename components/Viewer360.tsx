"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function Viewer360({ image }: { image: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !image) return;

    let animationId = 0;

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
    renderer.setSize(Math.max(container.clientWidth, 1), Math.max(container.clientHeight, 1));
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
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

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

    const target = new THREE.Vector3(1, 0, 0);
    controls.target.copy(target);
    controls.update();

    function onResize() {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
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
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("wheel", onWheel);

      controls.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [image]);

  return (
    <div
      ref={mountRef}
      className="h-full w-full overflow-hidden"
      style={{ touchAction: "none" }}
    />
  );
}
