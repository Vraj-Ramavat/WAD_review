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
import { getGalaxyPointTexture, seededRandom } from '../../utils/textureUtils';

function generateGalaxySpiralDust(count = 6200) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const random = seededRandom(0x4d494c4b);
  const warmCore = new THREE.Color('#ffe2a7');
  const armWhite = new THREE.Color('#dce8f1');
  const armBlue = new THREE.Color('#86aeca');
  const dust = new THREE.Color('#8d7255');
  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const isBulge = i < count * 0.24;
    const arms = 4;
    const armIndex = i % arms;
    const distance = isBulge ? Math.pow(random(), 1.7) * 12 : 5 + Math.pow(random(), 0.78) * 43;
    const baseAngle = isBulge ? random() * Math.PI * 2 : distance * 0.17 + armIndex * (Math.PI * 2 / arms);
    const spread = isBulge ? 4.5 : 0.9 + distance * 0.075;
    const angle = baseAngle + (random() - 0.5) * (isBulge ? 1.4 : 0.22);
    const radialNoise = (random() - 0.5) * spread;
    const diskHeight = isBulge ? 5.5 * (1 - distance / 14) : 0.45 + (1 - distance / 50) * 1.7;
    const x = Math.cos(angle) * (distance + radialNoise);
    const y = (random() - 0.5) * diskHeight;
    const z = Math.sin(angle) * (distance + radialNoise);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    if (isBulge) color.lerpColors(warmCore, armWhite, distance / 14);
    else if (random() < 0.16) color.copy(dust);
    else color.lerpColors(armWhite, armBlue, Math.min(1, distance / 48) * (0.45 + random() * 0.4));
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  return { positions, colors };
}

function generateStarPositions(count = 500) {
  const positions: [number, number, number][] = [];
  const random = seededRandom(0x53544152);
  for (let i = 0; i < count; i++) {
    const x = (random() - 0.5) * 140;
    const y = (random() - 0.5) * 90;
    const z = (random() - 0.5) * 140 - 20;
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
  const spiralDustData = useMemo(() => generateGalaxySpiralDust(), []);
  const starTexture = useMemo(() => getGalaxyPointTexture(), []);
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
            size={0.48}
            map={starTexture}
            vertexColors
            transparent
            opacity={0.72}
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
