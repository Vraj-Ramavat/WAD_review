import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { getGalaxyPointTexture, seededRandom } from '../../utils/textureUtils';

interface AmbientBackgroundProps {
  dim?: boolean;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ dim = false }) => {
  const groupRef = useRef<THREE.Group>(null);
  const rareStars = useMemo(() => {
    const count = 420;
    const random = seededRandom(0x4241434b);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const temperatures = [new THREE.Color('#dcecff'), new THREE.Color('#fff0d2'), new THREE.Color('#b8d3ff')];
    for (let index = 0; index < count; index += 1) {
      const radius = 55 + random() * 90;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index * 3 + 1] = radius * Math.cos(phi);
      positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      const color = temperatures[Math.floor(random() * temperatures.length)];
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    }
    return { positions, colors };
  }, []);
  const pointTexture = useMemo(() => getGalaxyPointTexture(), []);

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
        count={6200}
        factor={4.2}
        saturation={0.35}
        fade
        speed={0.18}
      />

      {/* Secondary Nearer Particles for Parallax Depth */}
      <Stars
        radius={60}
        depth={40}
        count={1300}
        factor={2.2}
        saturation={0.55}
        fade
        speed={0.3}
      />

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={rareStars.positions.length / 3} array={rareStars.positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={rareStars.colors.length / 3} array={rareStars.colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.72}
          map={pointTexture}
          vertexColors
          transparent
          opacity={dim ? 0.4 : 0.62}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

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
