import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { FeaturedRepo } from '../../types';
import { getStarPointTexture } from '../../utils/textureUtils';

interface RepoGalaxyMarkerProps {
  repo: FeaturedRepo;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (repo: FeaturedRepo) => void;
}

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function generateMiniSpiralGalaxy(repoId: string, count = 240) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const hash = hashString(repoId);
  const arms = 2;

  const coreColor = repoId.includes('searched') || hash % 3 === 0
    ? new THREE.Color('#E8A33D')
    : new THREE.Color('#4C7A9E');

  const armEdgeColor = new THREE.Color('#B08D57');
  const outerEdgeColor = new THREE.Color('#8A93A6');

  for (let i = 0; i < count; i++) {
    const armIndex = i % arms;
    const norm = i / count;
    const distance = 0.4 + norm * 2.8;
    const angle = distance * 2.2 + (armIndex * Math.PI);

    const spreadX = (Math.random() - 0.5) * (distance * 0.25);
    const spreadY = (Math.random() - 0.5) * 0.3;
    const spreadZ = (Math.random() - 0.5) * (distance * 0.25);

    const x = Math.cos(angle) * distance + spreadX;
    const y = spreadY;
    const z = Math.sin(angle) * distance + spreadZ;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const vertexColor = new THREE.Color();
    if (norm < 0.3) {
      vertexColor.copy(coreColor);
    } else if (norm < 0.7) {
      vertexColor.lerpColors(coreColor, armEdgeColor, (norm - 0.3) / 0.4);
    } else {
      vertexColor.lerpColors(armEdgeColor, outerEdgeColor, (norm - 0.7) / 0.3);
    }

    colors[i * 3] = vertexColor.r;
    colors[i * 3 + 1] = vertexColor.g;
    colors[i * 3 + 2] = vertexColor.b;
  }

  return { positions, colors };
}

export const RepoGalaxyMarker: React.FC<RepoGalaxyMarkerProps> = ({
  repo,
  isHovered,
  onHover,
  onClick,
}) => {
  const markerGroupRef = useRef<THREE.Group>(null);
  const spiralArmRef = useRef<THREE.Points>(null);

  const isSearched = repo.isSearched;
  const starColor = isSearched ? '#E8A33D' : '#4C7A9E';
  const markerScale = Math.max(0.7, Math.log10(repo.stars) * 0.32);

  const spiralData = useMemo(() => generateMiniSpiralGalaxy(repo.id, 240), [repo.id]);
  const starTexture = useMemo(() => getStarPointTexture(), []);

  const rotationSpeed = useMemo(() => {
    const seed = hashString(repo.id);
    return 0.25 + (seed % 15) * 0.04;
  }, [repo.id]);

  useFrame((_, delta) => {
    if (spiralArmRef.current) {
      spiralArmRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group position={repo.position}>
      <group
        ref={markerGroupRef}
        scale={isHovered ? markerScale * 1.3 : markerScale}
        onClick={(e) => {
          e.stopPropagation();
          onClick(repo);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(repo.id);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Central Emissive Core Sphere */}
        <mesh scale={0.55}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial
            color={starColor}
            emissive={starColor}
            emissiveIntensity={isHovered || isSearched ? 3.5 : 2.2}
            roughness={0.2}
            metalness={0.4}
          />
        </mesh>

        {/* Inner Core Halo Shell */}
        <mesh scale={0.95}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color={starColor}
            emissive={starColor}
            emissiveIntensity={1.4}
            transparent
            opacity={isHovered ? 0.4 : 0.2}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Mini Procedural Spiral Galaxy Arms with Soft Radial Star Texture */}
        <points ref={spiralArmRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={spiralData.positions.length / 3}
              array={spiralData.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={spiralData.colors.length / 3}
              array={spiralData.colors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.4}
            map={starTexture}
            vertexColors
            transparent
            opacity={isHovered ? 0.95 : 0.8}
            blending={THREE.AdditiveBlending}
            sizeAttenuation
            depthWrite={false}
          />
        </points>
      </group>

      {/* Hover Tooltip HTML Chip */}
      {isHovered && (
        <Html distanceFactor={25} position={[0, markerScale * 2.2 + 0.8, 0]} center>
          <div className="px-3 py-1.5 rounded instrument-panel border-brass/50 text-xs font-mono text-starwhite shadow-2xl pointer-events-none whitespace-nowrap flex flex-col items-center">
            <span className="font-bold text-amber">🌌 {repo.name}</span>
            <div className="flex items-center gap-2 text-[10px] text-slate mt-0.5">
              <span>★ {repo.stars.toLocaleString()}</span>
              <span>•</span>
              <span className="text-brass">Health {repo.healthScore}%</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
