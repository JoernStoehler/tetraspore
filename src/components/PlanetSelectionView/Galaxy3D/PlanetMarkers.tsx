import { type FC, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Billboard } from '@react-three/drei';
import { Mesh } from 'three';
import type { Planet } from '../types';

interface PlanetMarkersProps {
  planets: Planet[];
  onPlanetClick: (planetId: string) => void;
  onPlanetHover?: (planetId: string | null) => void;
  hoveredPlanetId?: string | null;
}

interface PlanetMarkerProps {
  planet: Planet;
  isHovered: boolean;
  onClick: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}

const PlanetMarker: FC<PlanetMarkerProps> = ({
  planet,
  isHovered,
  onClick,
  onPointerOver,
  onPointerOut
}) => {
  const meshRef = useRef<Mesh>(null);
  const baseScale = isHovered ? 1.5 : 1;
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle pulsing animation
      const time = state.clock.elapsedTime;
      const pulse = Math.sin(time * 2) * 0.05 + 1;
      meshRef.current.scale.setScalar(baseScale * pulse);
    }
  });
  
  // Different colors for played vs unplayed planets
  const color = planet.isPlayed ? '#FFD700' : '#87CEEB';
  const emissiveIntensity = isHovered ? 0.5 : 0.2;
  
  return (
    <group position={planet.position}>
      <Sphere
        ref={meshRef}
        args={[0.1, 16, 16]}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        data-planet-id={planet.id}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          transparent={true}
          opacity={0.9}
        />
      </Sphere>
      
      {/* Glow effect for played planets */}
      {planet.isPlayed && (
        <Sphere args={[0.15, 16, 16]}>
          <meshBasicMaterial
            color={color}
            transparent={true}
            opacity={0.3}
            depthWrite={false}
          />
        </Sphere>
      )}
      
      {/* Show name on hover */}
      {isHovered && (
        <Billboard position={[0, 0.3, 0]}>
          <mesh>
            <planeGeometry args={[2, 0.3]} />
            <meshBasicMaterial color="black" opacity={0.8} transparent />
          </mesh>
        </Billboard>
      )}
    </group>
  );
};

export const PlanetMarkers: FC<PlanetMarkersProps> = ({
  planets,
  onPlanetClick,
  onPlanetHover,
  hoveredPlanetId
}) => {
  return (
    <>
      {planets.map((planet) => (
        <PlanetMarker
          key={planet.id}
          planet={planet}
          isHovered={hoveredPlanetId === planet.id}
          onClick={() => onPlanetClick(planet.id)}
          onPointerOver={() => onPlanetHover?.(planet.id)}
          onPointerOut={() => onPlanetHover?.(null)}
        />
      ))}
    </>
  );
};