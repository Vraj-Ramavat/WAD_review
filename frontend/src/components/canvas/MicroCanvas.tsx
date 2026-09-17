import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MicroSceneProps {
  type: 'planet' | 'meteor' | 'threads';
}

const MicroScene: React.FC<MicroSceneProps> = ({ type }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.8;
      meshRef.current.rotation.x += delta * 0.3;
    }
  });

  return (
    <group ref={meshRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#E8A33D" />

      {type === 'planet' && (
        <group>
          <mesh scale={1.2}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#C4573B" emissive="#C4573B" emissiveIntensity={0.6} />
          </mesh>
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <ringGeometry args={[1.6, 1.8, 32]} />
            <meshBasicMaterial color="#B08D57" side={THREE.DoubleSide} transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {type === 'meteor' && (
        <group>
          <mesh scale={0.8} position={[-1, 0, 0]}>
            <sphereGeometry args={[0.6, 12, 12]} />
            <meshStandardMaterial color="#E8A33D" emissive="#E8A33D" emissiveIntensity={1.5} />
          </mesh>
          <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.4, 2.5, 12]} />
            <meshBasicMaterial color="#C4573B" transparent opacity={0.7} />
          </mesh>
        </group>
      )}

      {type === 'threads' && (
        <group>
          <mesh position={[-1.2, 0, 0]} scale={0.5}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshBasicMaterial color="#4C7A9E" />
          </mesh>
          <mesh position={[1.2, 0.5, 0]} scale={0.5}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshBasicMaterial color="#E8A33D" />
          </mesh>
          <mesh position={[0, -1, 0]} scale={0.4}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshBasicMaterial color="#B08D57" />
          </mesh>
        </group>
      )}
    </group>
  );
};

export const MicroCanvas: React.FC<MicroSceneProps> = ({ type }) => {
  return (
    <div className="w-full h-36 rounded border border-brass/30 overflow-hidden bg-deepspace/80">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <MicroScene type={type} />
      </Canvas>
    </div>
  );
};
