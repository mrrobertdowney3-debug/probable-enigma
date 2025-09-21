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

  const [starCount, setStarCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [movementSpeed, setMovementSpeed] = useState(5);
  const [isFlying, setIsFlying] = useState(false);
  
  const starsGroupRef = useRef<THREE.Group | undefined>(undefined);
  const raycasterRef = useRef<THREE.Raycaster | undefined>(undefined);
  const mouseRef = useRef<THREE.Vector2 | undefined>(undefined);
  const [hoveredStar, setHoveredStar] = useState<StarData | null>(null);


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