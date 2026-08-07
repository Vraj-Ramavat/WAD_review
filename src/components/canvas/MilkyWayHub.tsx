import React, { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Instances, Instance, OrbitControls } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import gsap from 'gsap';
import { useGalaxyStore } from '../../store/useGalaxyStore';
import { useRepoStore } from '../../store/useRepoStore';
import { useViewStore } from '../../store/useViewStore';
import { FeaturedRepo } from '../../types';
import { AmbientBackground } from './AmbientBackground';
import { RepoGalaxyMarker } from './RepoGalaxyMarker';
import { getStarPointTexture } from '../../utils/textureUtils';

function generateGalaxySpiralDust(count = 2500) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const colorPalette = [
    new THREE.Color('#B08D57'), // brass
    new THREE.Color('#4C7A9E'), // databhlue
    new THREE.Color('#8A93A6'), // slate
  ];

  for (let i = 0; i < count; i++) {
    const arms = 2;
    const armIndex = i % arms;
    const distance = Math.random() * 45 + 5;
    const angle = distance * 0.15 + (armIndex * Math.PI);

    const spreadX = (Math.random() - 0.5) * (distance * 0.3);
    const spreadY = (Math.random() - 0.5) * 4;
    const spreadZ = (Math.random() - 0.5) * (distance * 0.3);

    const x = Math.cos(angle) * distance + spreadX;
    const y = spreadY;
    const z = Math.sin(angle) * distance + spreadZ;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  return { positions, colors };
}

function generateStarPositions(count = 500) {
  const positions: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 140;
    const y = (Math.random() - 0.5) * 90;
    const z = (Math.random() - 0.5) * 140 - 20;
    positions.push([x, y, z]);
  }
  return positions;
}

export const MilkyWayHub: React.FC = () => {
  const { camera } = useThree();
  const navigate = useNavigate();

  const featuredRepos = useGalaxyStore((state) => state.featuredRepos);
  const hoveredRepoId = useGalaxyStore((state) => state.hoveredRepoId);
  const setHoveredRepoId = useGalaxyStore((state) => state.setHoveredRepoId);
  const setCurrentRepo = useRepoStore((state) => state.setCurrentRepo);
  const setCanvasMode = useViewStore((state) => state.setCanvasMode);
  const setHasEnteredSystem = useViewStore((state) => state.setHasEnteredSystem);

  const backgroundStarPositions = useMemo(() => generateStarPositions(500), []);
  const spiralDustData = useMemo(() => generateGalaxySpiralDust(2500), []);
  const starTexture = useMemo(() => getStarPointTexture(), []);
  const [isZooming, setIsZooming] = useState(false);

  const hubGroupRef = useRef<THREE.Group>(null);
  const spiralRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (hubGroupRef.current && !isZooming) {
      hubGroupRef.current.rotation.y += delta * 0.015;
    }
    if (spiralRef.current && !isZooming) {
      spiralRef.current.rotation.y += delta * 0.012;
    }
  });

  const handleStarClick = (repo: FeaturedRepo) => {
    if (isZooming) return;
    setIsZooming(true);

    const targetPos = new THREE.Vector3(...repo.position);

    gsap.to(camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z + 4,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        camera.lookAt(targetPos);
      },
      onComplete: () => {
        setCurrentRepo(repo);
        setHasEnteredSystem(true);
        setCanvasMode('solarsystem');
        navigate(`/galaxy/${repo.id}`);
      }
    });
  };

  return (
    <group>
      <AmbientBackground />

      <OrbitControls
        enableZoom={true}
        enablePan={true}
        autoRotate={!isZooming}
        autoRotateSpeed={0.35}
        maxDistance={100}
        minDistance={10}
        makeDefault
      />

      <ambientLight intensity={0.3} color="#0B0F1A" />
      <pointLight position={[0, 20, 20]} intensity={2} color="#E8A33D" />

      <group ref={hubGroupRef}>
        {/* Nebulous Spiral Galaxy Dust Cloud with Soft Radial Star Texture */}
        <points ref={spiralRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={spiralDustData.positions.length / 3}
              array={spiralDustData.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={spiralDustData.colors.length / 3}
              array={spiralDustData.colors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.65}
            map={starTexture}
            vertexColors
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            sizeAttenuation
            depthWrite={false}
          />
        </points>

        {/* Instanced Starfield */}
        <Instances limit={600} range={500}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color="#8A93A6" roughness={0.3} emissive="#8A93A6" emissiveIntensity={0.5} />
          {backgroundStarPositions.map((pos, i) => (
            <Instance key={i} position={pos} />
          ))}
        </Instances>

        {/* Interactive Mini Spiral Galaxy Repositories */}
        {featuredRepos.map((repo) => (
          <RepoGalaxyMarker
            key={repo.id}
            repo={repo}
            isHovered={hoveredRepoId === repo.id}
            onHover={setHoveredRepoId}
            onClick={handleStarClick}
          />
        ))}
      </group>
    </group>
  );
};
