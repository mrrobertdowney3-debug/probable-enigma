"use client";
import { useRef, useEffect } from "react";
import * as THREE from "three";
// @ts-expect-error: OrbitControls has no types
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Star data type definition
interface StarData {
  id?: number;
  name?: string;
  ra: number;
  dec: number;
  mag: number;
  bv: number;
  spectralClass?: string;
  distance?: number;
}

function generateSampleStarData(): StarData[] {
  const famousStars = [
    { name: "Sirius", ra: 6.75, dec: -16.72, mag: -1.46, bv: 0.0, spectralClass: "A1V" },
    { name: "Canopus", ra: 6.4, dec: -52.7, mag: -0.74, bv: 0.15, spectralClass: "A9II" },
    { name: "Arcturus", ra: 14.26, dec: 19.18, mag: -0.05, bv: 1.23, spectralClass: "K1.5III" },
    { name: "Vega", ra: 18.62, dec: 38.78, mag: 0.03, bv: 0.0, spectralClass: "A0V" },
    { name: "Capella", ra: 5.28, dec: 45.99, mag: 0.08, bv: 0.8, spectralClass: "G5III" },
    { name: "Rigel", ra: 5.24, dec: -8.2, mag: 0.13, bv: -0.03, spectralClass: "B8Iae" },
    { name: "Procyon", ra: 7.65, dec: 5.23, mag: 0.34, bv: 0.42, spectralClass: "F5IV-V" },
    { name: "Betelgeuse", ra: 5.92, dec: 7.41, mag: 0.5, bv: 1.85, spectralClass: "M1-2Ia-Iab" },
    { name: "Achernar", ra: 1.63, dec: -57.24, mag: 0.46, bv: -0.19, spectralClass: "B6Vep" },
    { name: "Altair", ra: 19.85, dec: 8.87, mag: 0.77, bv: 0.22, spectralClass: "A7V" },
  ];
  const sampleStars: StarData[] = [...famousStars];
  for (let i = 0; i < 100; i++) {
    sampleStars.push({
      id: i + famousStars.length,
      name: `Star-${i}`,
      ra: Math.random() * 24,
      dec: (Math.random() - 0.5) * 180,
      mag: Math.random() * 8 - 1,
      bv: (Math.random() - 0.3) * 2,
      spectralClass: ["O", "B", "A", "F", "G", "K", "M"][Math.floor(Math.random() * 7)],
    });
  }
  return sampleStars;
}

const CosmosVisualization = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      10000
    );
    camera.position.set(0, 0, 500);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.minDistance = 100;
    controls.maxDistance = 2000;
    controls.enableRotate = true;
    controls.screenSpacePanning = false;
    controls.target.set(0, 0, 0);
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };

    // Star geometry
    const data = generateSampleStarData();
    const starsGeometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    for (const star of data) {
      const raRad = (star.ra ?? 0) * 15 * (Math.PI / 180);
      const decRad = (star.dec ?? 0) * (Math.PI / 180);
      const r = 400 + Math.random() * 100;
      const x = r * Math.cos(decRad) * Math.cos(raRad);
      const y = r * Math.sin(decRad);
      const z = r * Math.cos(decRad) * Math.sin(raRad);
      positions.push(x, y, z);
      let color = new THREE.Color(1, 1, 1);
      if (star.spectralClass) {
        const type = star.spectralClass[0].toUpperCase();
        if (type === "O" || type === "B") color = new THREE.Color(0.6, 0.8, 1.0);
        else if (type === "A" || type === "F") color = new THREE.Color(1.0, 1.0, 1.0);
        else if (type === "G") color = new THREE.Color(1.0, 1.0, 0.7);
        else if (type === "K") color = new THREE.Color(1.0, 0.7, 0.4);
        else if (type === "M") color = new THREE.Color(1.0, 0.5, 0.3);
      }
      colors.push(color.r, color.g, color.b);
    }
    starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    starsGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    // Star material
    const starMaterial = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    });

    // Points
    const starPoints = new THREE.Points(starsGeometry, starMaterial);
    scene.add(starPoints);

    // Animation loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={mountRef} className="w-full h-full min-h-screen min-w-full bg-black overflow-hidden touch-none select-none" />
  );
};

export default CosmosVisualization;