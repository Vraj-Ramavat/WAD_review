import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

interface AmbientBackgroundProps {
  dim?: boolean;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ dim = false }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.012;
      groupRef.current.rotation.x += delta * 0.003;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Primary Deep Starfield */}
      <Stars
        radius={140}
        depth={90}
        count={7000}
        factor={7}
        saturation={0.5}
        fade
        speed={0.8}
      />

      {/* Secondary Nearer Particles for Parallax Depth */}
      <Stars
        radius={60}
        depth={40}
        count={2000}
        factor={4}
        saturation={0.8}
        fade
        speed={1.5}
      />

      {/* Deep space background aura sphere */}
      <mesh scale={120}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#0B0F1A"
          side={THREE.BackSide}
          transparent
          opacity={dim ? 0.85 : 0.6}
        />
      </mesh>
    </group>
  );
};
