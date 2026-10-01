import React, { useMemo, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FeaturedRepo } from '../../types';
import { getGalaxyPointTexture, hashString, seededRandom } from '../../utils/textureUtils';

interface RepoGalaxyMarkerProps {
  repo: FeaturedRepo;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (repo: FeaturedRepo) => void;
}

function generateMiniSpiralGalaxy(repoId: string, count = 460) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const hash = hashString(repoId);
  const random = seededRandom(hash);
  const arms = 2 + (hash % 3);
  const coreColor = new THREE.Color(repoId.includes('searched') || hash % 3 === 0 ? '#f0bd6b' : '#a8cbe0');
  const armColor = new THREE.Color('#d8e1e5');
  const edgeColor = new THREE.Color('#7898ad');
  const vertexColor = new THREE.Color();

  for (let index = 0; index < count; index += 1) {
    const isCore = index < count * 0.22;
    const armIndex = index % arms;
    const normalizedRadius = isCore ? random() * 0.22 : 0.18 + Math.pow(random(), 0.76) * 0.82;
    const distance = 0.18 + normalizedRadius * 3.1;
    const angle = isCore
      ? random() * Math.PI * 2
      : distance * 2.05 + armIndex * (Math.PI * 2 / arms) + (random() - 0.5) * 0.28;
    const scatter = isCore ? 0.6 : distance * 0.2;
    positions[index * 3] = Math.cos(angle) * distance + (random() - 0.5) * scatter;
    positions[index * 3 + 1] = (random() - 0.5) * (isCore ? 0.5 : 0.22);
    positions[index * 3 + 2] = Math.sin(angle) * distance + (random() - 0.5) * scatter;

    if (normalizedRadius < 0.28) vertexColor.lerpColors(coreColor, armColor, normalizedRadius / 0.28);
    else vertexColor.lerpColors(armColor, edgeColor, (normalizedRadius - 0.28) / 0.72);
    colors[index * 3] = vertexColor.r;
    colors[index * 3 + 1] = vertexColor.g;
    colors[index * 3 + 2] = vertexColor.b;
  }

  return { positions, colors };
}

export const RepoGalaxyMarker: React.FC<RepoGalaxyMarkerProps> = ({ repo, isHovered, onHover, onClick }) => {
  const markerGroupRef = useRef<THREE.Group>(null);
  const spiralArmRef = useRef<THREE.Points>(null);
  const isSearched = repo.isSearched;
  const starColor = isSearched ? '#e8a33d' : '#709ab8';
  const markerScale = Math.max(0.7, Math.log10(Math.max(repo.stars, 10)) * 0.32);
  const spiralData = useMemo(() => generateMiniSpiralGalaxy(repo.id), [repo.id]);
  const starTexture = useMemo(() => getGalaxyPointTexture(), []);
  const rotationSpeed = useMemo(() => 0.18 + (hashString(repo.id) % 12) * 0.025, [repo.id]);

  useFrame((_, delta) => {
    if (spiralArmRef.current) spiralArmRef.current.rotation.y += delta * rotationSpeed;
    if (markerGroupRef.current) {
      const target = isHovered ? markerScale * 1.16 : markerScale;
      const next = THREE.MathUtils.lerp(markerGroupRef.current.scale.x, target, 0.1);
      markerGroupRef.current.scale.setScalar(next);
    }
  });

  return (
    <group position={repo.position}>
      <group
        ref={markerGroupRef}
        scale={markerScale}
        onClick={(event) => {
          event.stopPropagation();
          onClick(repo);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          onHover(repo.id);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh visible={false} scale={2.5}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <mesh scale={0.3}>
          <sphereGeometry args={[1, 20, 16]} />
          <meshStandardMaterial
            color={starColor}
            emissive={starColor}
            emissiveIntensity={isHovered || isSearched ? 2.1 : 1.45}
            roughness={0.72}
            metalness={0}
          />
        </mesh>
        <mesh scale={0.62}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshBasicMaterial
            color={starColor}
            transparent
            opacity={isHovered ? 0.2 : 0.1}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <points ref={spiralArmRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={spiralData.positions.length / 3} array={spiralData.positions} itemSize={3} />
            <bufferAttribute attach="attributes-color" count={spiralData.colors.length / 3} array={spiralData.colors} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial
            size={0.27}
            map={starTexture}
            vertexColors
            transparent
            opacity={isHovered ? 0.98 : 0.82}
            blending={THREE.AdditiveBlending}
            sizeAttenuation
            depthWrite={false}
          />
        </points>
      </group>

      {isHovered && (
        <Html distanceFactor={25} position={[0, markerScale * 2.2 + 0.8, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="px-3 py-1.5 rounded instrument-panel border-brass/50 text-xs font-mono text-starwhite shadow-2xl whitespace-nowrap flex flex-col items-center">
            <span className="font-bold text-amber">{repo.name}</span>
            <div className="flex items-center gap-2 text-[10px] text-slate mt-0.5">
              <span>{repo.stars.toLocaleString()} stars</span>
              <span>·</span>
              <span className="text-brass">Health {repo.healthScore}%</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
