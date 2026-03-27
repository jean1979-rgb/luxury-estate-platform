"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Viewer360({ image }: { image: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || !image) return;

    const container = mountRef.current;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      1,
      1100
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    const texture = new THREE.TextureLoader().load(image);
    const material = new THREE.MeshBasicMaterial({ map: texture });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let isUserInteracting = false;
    let lon = 0;
    let lat = 0;

    let onPointerDownLon = 0;
    let onPointerDownLat = 0;
    let onPointerDownX = 0;
    let onPointerDownY = 0;

    function onPointerDown(event: any) {
      isUserInteracting = true;
      onPointerDownX = event.clientX;
      onPointerDownY = event.clientY;
      onPointerDownLon = lon;
      onPointerDownLat = lat;
    }

    function onPointerMove(event: any) {
      if (isUserInteracting) {
        lon = (onPointerDownX - event.clientX) * 0.1 + onPointerDownLon;
        lat = (event.clientY - onPointerDownY) * 0.1 + onPointerDownLat;
      }
    }

    function onPointerUp() {
      isUserInteracting = false;
    }

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);

    function animate() {
      requestAnimationFrame(animate);

      lat = Math.max(-85, Math.min(85, lat));

      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);

      const x = 500 * Math.sin(phi) * Math.cos(theta);
      const y = 500 * Math.cos(phi);
      const z = 500 * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(new THREE.Vector3(x, y, z));

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      renderer.dispose();
    };
  }, [image]);

  return <div ref={mountRef} className="w-full h-full" />;
}
