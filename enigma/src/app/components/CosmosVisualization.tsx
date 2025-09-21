"use client"
// Sample star data generator
function generateSampleStarData(): StarData[] {
  // Add some famous stars with real data
  const famousStars = [
    { name: "Sirius", ra: 6.75, dec: -16.72, mag: -1.46, bv: 0.00, spectralClass: "A1V" },
    { name: "Canopus", ra: 6.4, dec: -52.7, mag: -0.74, bv: 0.15, spectralClass: "A9II" },
    { name: "Arcturus", ra: 14.26, dec: 19.18, mag: -0.05, bv: 1.23, spectralClass: "K1.5III" },
    { name: "Vega", ra: 18.62, dec: 38.78, mag: 0.03, bv: 0.00, spectralClass: "A0V" },
    { name: "Capella", ra: 5.28, dec: 45.99, mag: 0.08, bv: 0.80, spectralClass: "G5III" },
    { name: "Rigel", ra: 5.24, dec: -8.20, mag: 0.13, bv: -0.03, spectralClass: "B8Iae" },
    { name: "Procyon", ra: 7.65, dec: 5.23, mag: 0.34, bv: 0.42, spectralClass: "F5IV-V" },
    { name: "Betelgeuse", ra: 5.92, dec: 7.41, mag: 0.50, bv: 1.85, spectralClass: "M1-2Ia-Iab" },
    { name: "Achernar", ra: 1.63, dec: -57.24, mag: 0.46, bv: -0.19, spectralClass: "B6Vep" },
    { name: "Altair", ra: 19.85, dec: 8.87, mag: 0.77, bv: 0.22, spectralClass: "A7V" }
  ];
  // Generate additional random stars
  const sampleStars: StarData[] = [...famousStars];
  for (let i = 0; i < 100; i++) {
    sampleStars.push({
      id: i + famousStars.length,
      name: `Star-${i}`,
      ra: Math.random() * 24,
      dec: (Math.random() - 0.5) * 180,
      mag: Math.random() * 8 - 1,
      bv: (Math.random() - 0.3) * 2,
      spectralClass: ['O', 'B', 'A', 'F', 'G', 'K', 'M'][Math.floor(Math.random() * 7)]
    });
  }
  return sampleStars;
}

// Stub for Three.js visualization logic
function createStarVisualization(data: StarData[]) {
  // Find the mount node
  const mount = document.querySelector('#cosmos-mount') as HTMLDivElement | null;
  if (!mount) return;

  // Clean up any previous renderers
  while (mount.firstChild) mount.removeChild(mount.firstChild);

  // Scene
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

  // Star geometry
  const starsGeometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  for (const star of data) {
    // Convert RA/Dec to Cartesian (simple sphere, not accurate)
    const raRad = (star.ra ?? 0) * 15 * (Math.PI / 180);
    const decRad = (star.dec ?? 0) * (Math.PI / 180);
    const r = 400 + Math.random() * 100;
    const x = r * Math.cos(decRad) * Math.cos(raRad);
    const y = r * Math.sin(decRad);
    const z = r * Math.cos(decRad) * Math.sin(raRad);
    positions.push(x, y, z);
    // Color by spectral class (simple)
    let color = new THREE.Color(1, 1, 1);
    if (star.spectralClass) {
      const type = star.spectralClass[0].toUpperCase();
      if (type === 'O' || type === 'B') color = new THREE.Color(0.6, 0.8, 1.0);
      else if (type === 'A' || type === 'F') color = new THREE.Color(1.0, 1.0, 1.0);
      else if (type === 'G') color = new THREE.Color(1.0, 1.0, 0.7);
      else if (type === 'K') color = new THREE.Color(1.0, 0.7, 0.4);
      else if (type === 'M') color = new THREE.Color(1.0, 0.5, 0.3);
    }
    colors.push(color.r, color.g, color.b);
  }
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  // Star material
  const starMaterial = new THREE.PointsMaterial({
    size: 3,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true
  });

  // Points
  const starPoints = new THREE.Points(starsGeometry, starMaterial);
  scene.add(starPoints);

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    starPoints.rotation.y += 0.0007;
    renderer.render(scene, camera);
  }
  animate();
}
import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

interface StarData {
  id?: string | number;
  name?: string;
  ra?: number;        // Right ascension (hours)
  dec?: number;       // Declination (degrees)
  mag?: number;       // Magnitude (brightness)
  bv?: number;        // B-V color index
  distance?: number;  // Distance in parsecs
  x?: number;         // Direct cartesian coordinates
  y?: number;
  z?: number;
  spectralClass?: string;
}



const CosmosVisualization: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  // Three.js refs (scene, renderer, camera, etc.)
  const sceneRef = useRef<THREE.Scene | undefined>(undefined);
  const rendererRef = useRef<THREE.WebGLRenderer | undefined>(undefined);
  const cameraRef = useRef<THREE.PerspectiveCamera | undefined>(undefined);
  const frameRef = useRef<number | undefined>(undefined);
  const controlsRef = useRef<{
    mouseDown: boolean;
    mouseX: number;
    mouseY: number;
    targetRotationX: number;
    targetRotationY: number;
    currentRotationX: number;
    currentRotationY: number;
    zoom: number;
    targetZoom: number;
    velocity: THREE.Vector3;
    acceleration: THREE.Vector3;
    baseSpeed: number;
    acceleratedSpeed: number;
    isAccelerating: boolean;
    keys: { [key: string]: boolean };
  }>({
    mouseDown: false,
    mouseX: 0,
    mouseY: 0,
    targetRotationX: 0,
    targetRotationY: 0,
    currentRotationX: 0,
    currentRotationY: 0,
    zoom: 500,
    targetZoom: 500,
    velocity: new THREE.Vector3(0, 0, 0),
    acceleration: new THREE.Vector3(0, 0, 0),
    baseSpeed: 5,
    acceleratedSpeed: 50,
    isAccelerating: false,
    keys: {}
  });

  // State for star data and UI
  const [stars, setStars] = useState<StarData[]>([]);
  const [starCount, setStarCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [movementSpeed, setMovementSpeed] = useState(5);
  const [isFlying, setIsFlying] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<StarData | null>(null);
  // Three.js object refs
  const starsGroupRef = useRef<THREE.Group | undefined>(undefined);
  const raycasterRef = useRef<THREE.Raycaster | undefined>(undefined);
  const mouseRef = useRef<THREE.Vector2 | undefined>(undefined);

  // Load star data and initialize visualization
  useEffect(() => {
    // 1. Load star data
    const data = generateSampleStarData();
    setStars(data);
    setLoading(false);

    // 2. Initialize Three.js visualization
    if (mountRef.current) {
      createStarVisualization(data);
    }
  }, []);


  // Mouse event handlers
  const handleMouseDown = (event: React.MouseEvent) => {
    const controls = controlsRef.current;
    controls.mouseDown = true;
    controls.mouseX = event.clientX;
    controls.mouseY = event.clientY;
  };

  const handleMouseUp = () => {
    controlsRef.current.mouseDown = false;
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    const controls = controlsRef.current;
    if (!mountRef.current || !mouseRef.current || !raycasterRef.current || !cameraRef.current) return;
    // Update mouse position for raycasting
    const rect = mountRef.current.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    // Handle orbit controls
    if (controls.mouseDown) {
      const deltaX = event.clientX - controls.mouseX;
      const deltaY = event.clientY - controls.mouseY;
      controls.targetRotationY += deltaX * 0.01;
      controls.targetRotationX += deltaY * 0.01;
      // Limit vertical rotation
      controls.targetRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, controls.targetRotationX));
      controls.mouseX = event.clientX;
      controls.mouseY = event.clientY;
    }
    // Raycasting for star hover
    if (starsGroupRef.current) {
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(starsGroupRef.current.children);
      if (intersects.length > 0) {
        const starData = intersects[0].object.userData as StarData;
        setHoveredStar(starData);
      } else {
        setHoveredStar(null);
      }
    }
  };

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const controls = controlsRef.current;
    const zoomSpeed = controls.zoom * 0.1;
    controls.targetZoom += event.deltaY > 0 ? zoomSpeed : -zoomSpeed;
    controls.targetZoom = Math.max(10, Math.min(2000, controls.targetZoom));
  };

  // (The rest of the code is unchanged and already present in the original file)

  // ...

  // Insert the full return block from the original implementation here:
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Canvas */}
      <div 
        id="cosmos-mount"
        ref={mountRef} 
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
      />

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 text-white z-10">
        <h1 className="text-2xl font-bold mb-2">Cosmos Star Catalog</h1>
        <div className="bg-black bg-opacity-50 p-4 rounded-lg backdrop-blur-sm">
          {loading && <p className="text-blue-300">Loading star data...</p>}
          {error && <p className="text-red-300 text-sm">{error}</p>}
          <p className="text-sm text-gray-300">Stars: {starCount.toLocaleString()}</p>
          {/* Movement Status */}
          <div className="mt-2 text-xs">
            <div className={`flex items-center ${isFlying ? 'text-green-300' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${isFlying ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span>{isFlying ? 'FLYING' : 'ORBIT'}</span>
            </div>
            <p className="text-gray-300 mt-1">Speed: {movementSpeed.toFixed(1)} units/s</p>
          </div>
          <div className="mt-3 text-xs text-gray-400">
            <p><strong>Flight Controls:</strong></p>
            <p>• WASD / Arrow Keys: Move</p>
            <p>• Q/Space: Up • E/Ctrl: Down</p>
            <p>• Hold Shift: Accelerate (10x speed)</p>
            <p>• Mouse: Look around</p>
            <p>• Scroll: Zoom (orbit mode)</p>
          </div>
        </div>
      </div>
      {/* Star Information Panel */}
      {hoveredStar && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 p-4 rounded-lg backdrop-blur-sm text-white z-10 max-w-xs">
          <h3 className="font-bold text-lg mb-2">{hoveredStar.name || `Star ${hoveredStar.id}`}</h3>
          {hoveredStar.ra !== undefined && (
            <p className="text-sm"><span className="text-blue-300">RA:</span> {hoveredStar.ra.toFixed(2)}h</p>
          )}
          {hoveredStar.dec !== undefined && (
            <p className="text-sm"><span className="text-blue-300">Dec:</span> {hoveredStar.dec.toFixed(2)}°</p>
          )}
          {hoveredStar.mag !== undefined && (
            <p className="text-sm"><span className="text-blue-300">Magnitude:</span> {hoveredStar.mag.toFixed(2)}</p>
          )}
          {hoveredStar.bv !== undefined && (
            <p className="text-sm"><span className="text-blue-300">B-V Index:</span> {hoveredStar.bv.toFixed(2)}</p>
          )}
          {hoveredStar.spectralClass && (
            <p className="text-sm"><span className="text-blue-300">Spectral Class:</span> {hoveredStar.spectralClass}</p>
          )}
          {hoveredStar.distance && (
            <p className="text-sm"><span className="text-blue-300">Distance:</span> {hoveredStar.distance.toFixed(1)} pc</p>
          )}
        </div>
      )}
      {/* Speed Indicator */}
      {isFlying && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 p-3 rounded-lg backdrop-blur-sm text-white z-10">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-mono">FLIGHT MODE</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-300">Speed: </span>
              <span className={`font-mono ${controlsRef.current?.isAccelerating ? 'text-red-300' : 'text-green-300'}`}>{movementSpeed.toFixed(1)}</span>
            </div>
            {controlsRef.current?.isAccelerating && (
              <div className="text-xs text-red-300 animate-pulse">⚡ BOOST</div>
            )}
          </div>
        </div>
      )}
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 p-4 rounded-lg backdrop-blur-sm text-white z-10">
        <h4 className="font-bold mb-2">Star Colors</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-300 mr-2"></div>
            <span>O/B - Hot Blue Stars</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-white mr-2"></div>
            <span>A/F - White Stars</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-300 mr-2"></div>
            <span>G - Yellow Stars (Sun-like)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-400 mr-2"></div>
            <span>K - Orange Stars</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
            <span>M - Red Stars</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CosmosVisualization;