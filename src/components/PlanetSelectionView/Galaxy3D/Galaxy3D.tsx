import { type FC, useRef, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { Group } from 'three';
import { StarField } from './StarField';
import { PlanetMarkers } from './PlanetMarkers';
import type { Planet } from '../types';

interface Galaxy3DProps {
  planets: Planet[];
  onPlanetClick: (planetId: string) => void;
  onPlanetHover?: (planetId: string | null) => void;
  hoveredPlanetId?: string | null;
  showMarkers?: boolean;
  autoRotate?: boolean;
}

interface GalaxyContentProps extends Galaxy3DProps {
  autoRotateSpeed?: number;
}

const GalaxyContent: FC<GalaxyContentProps> = ({
  planets,
  onPlanetClick,
  onPlanetHover,
  hoveredPlanetId,
  showMarkers = true,
  autoRotate = true,
  autoRotateSpeed = 0.05
}) => {
  const galaxyRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && galaxyRef.current) {
      galaxyRef.current.rotation.y += delta * autoRotateSpeed;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={60} />
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={15}
        maxPolarAngle={Math.PI * 0.75}
        minPolarAngle={Math.PI * 0.25}
      />
      
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 0]} intensity={0.5} />
      
      <group ref={galaxyRef}>
        <StarField />
        
        {showMarkers && (
          <PlanetMarkers
            planets={planets}
            onPlanetClick={onPlanetClick}
            onPlanetHover={onPlanetHover}
            hoveredPlanetId={hoveredPlanetId}
          />
        )}
      </group>
      
      {/* Fallback stars for background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
    </>
  );
};

export const Galaxy3D: FC<Galaxy3DProps> = (props) => {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
      }
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-xl mb-2">WebGL Not Available</h2>
          <p>This feature requires WebGL support.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-xl mb-2">3D View Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Canvas
        onCreated={({ gl }) => {
          // Additional WebGL checks
          if (!gl) {
            setError('WebGL context creation failed');
          }
        }}
        onError={(error) => {
          console.error('Canvas error:', error);
          setError('Failed to initialize 3D view');
        }}
      >
        <Suspense fallback={null}>
          <GalaxyContent {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
};