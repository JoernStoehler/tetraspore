import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, Points as ThreePoints } from 'three';
import { PRESET_GALAXY } from '@/utils/galaxyGenerator';

export const StarField = () => {
  const pointsRef = useRef<ThreePoints>(null);
  
  // Create geometry from preset galaxy data
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const positions = new Float32Array(PRESET_GALAXY.length * 3);
    const colors = new Float32Array(PRESET_GALAXY.length * 3);
    const sizes = new Float32Array(PRESET_GALAXY.length);
    
    PRESET_GALAXY.forEach((star, i) => {
      const i3 = i * 3;
      positions[i3] = star.position[0];
      positions[i3 + 1] = star.position[1];
      positions[i3 + 2] = star.position[2];
      
      // White stars with slight blue tint
      colors[i3] = 0.9 + star.brightness * 0.1;
      colors[i3 + 1] = 0.9 + star.brightness * 0.1;
      colors[i3 + 2] = 1.0;
      
      sizes[i] = star.size * 0.1;
    });
    
    geo.setAttribute('position', new BufferAttribute(positions, 3));
    geo.setAttribute('color', new BufferAttribute(colors, 3));
    geo.setAttribute('size', new BufferAttribute(sizes, 1));
    
    return geo;
  }, []);
  
  // Animate star blinking
  useFrame((state) => {
    if (pointsRef.current) {
      const time = state.clock.elapsedTime;
      const sizes = geometry.attributes.size;
      
      for (let i = 0; i < sizes.count; i++) {
        const baseSize = PRESET_GALAXY[i].size * 0.1;
        // Unsynchronized blinking using different frequencies
        const blink = Math.sin(time * (1 + i * 0.01)) * 0.02;
        sizes.setX(i, baseSize + blink);
      }
      
      sizes.needsUpdate = true;
    }
  });
  
  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.1}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={0.8}
        depthWrite={false}
      />
    </points>
  );
};