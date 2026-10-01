import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Html, OrbitControls, Trail } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useRepoStore } from '../../store/useRepoStore';
import { useViewStore } from '../../store/useViewStore';
import { FileItem, FolderPlanet, ViewMode } from '../../types';
import {
  getMoonTexture,
  getPlanetBumpTexture,
  getPlanetProfile,
  getPlanetTexture,
  getSunTexture,
  hashString,
} from '../../utils/textureUtils';
import { AmbientBackground } from './AmbientBackground';

type ControlsInstance = React.ElementRef<typeof OrbitControls>;
type MoonRegistry = Map<string, THREE.Object3D>;

const DEFAULT_CAMERA = new THREE.Vector3(0, 10, 34);

export const SolarSystemView: React.FC = () => {
  const currentRepo = useRepoStore((state) => state.currentRepo);
  const viewMode = useViewStore((state) => state.viewMode);
  const selectedPlanetId = useViewStore((state) => state.selectedPlanetId);
  const selectedFileId = useViewStore((state) => state.selectedFileId);
  const setSelectedPlanetId = useViewStore((state) => state.setSelectedPlanetId);
  const setSelectedFileId = useViewStore((state) => state.setSelectedFileId);
  const timelinePosition = useViewStore((state) => state.timelinePosition);
  const cameraResetRequest = useViewStore((state) => state.cameraResetRequest);

  const controlsRef = useRef<ControlsInstance>(null);
  const moonObjectsRef = useRef<MoonRegistry>(new Map());
  const [isInteracting, setIsInteracting] = useState(false);
  const { camera } = useThree();

  const activeCommit = useMemo(() => {
    if (!currentRepo?.commits.length) return undefined;
    const index = Math.min(
      currentRepo.commits.length - 1,
      Math.floor(timelinePosition * currentRepo.commits.length),
    );
    return currentRepo.commits[index];
  }, [currentRepo, timelinePosition]);

  const affectedFiles = useMemo(
    () => new Set(activeCommit?.affectedFileIds ?? []),
    [activeCommit],
  );

  const affectedFolders = useMemo(() => {
    const ids = new Set<string>();
    currentRepo?.folders.forEach((folder) => {
      if (folder.files.some((file) => affectedFiles.has(file.id))) ids.add(folder.id);
    });
    return ids;
  }, [affectedFiles, currentRepo]);

  const registerMoon = useCallback((id: string, object: THREE.Object3D | null) => {
    if (object) moonObjectsRef.current.set(id, object);
    else moonObjectsRef.current.delete(id);
  }, []);

  const focusOnObject = useCallback((target: THREE.Vector3, visualRadius: number) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduceMotion ? 0 : 1.15;
    const distance = THREE.MathUtils.clamp(visualRadius * 5.5, 5.5, 17);
    const direction = camera.position.clone().sub(target).normalize();
    if (direction.lengthSq() < 0.01) direction.set(0.55, 0.4, 1);
    const destination = target.clone().add(direction.multiplyScalar(distance));
    destination.y += visualRadius * 0.8;

    gsap.to(controls.target, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => controls.update(),
    });
    gsap.to(camera.position, {
      x: destination.x,
      y: destination.y,
      z: destination.z,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => controls.update(),
    });
  }, [camera]);

  useEffect(() => {
    if (!cameraResetRequest || !controlsRef.current) return;
    const controls = controlsRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduceMotion ? 0 : 1.25;
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);
    gsap.to(controls.target, {
      x: 0,
      y: 0,
      z: 0,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => controls.update(),
    });
    gsap.to(camera.position, {
      x: DEFAULT_CAMERA.x,
      y: DEFAULT_CAMERA.y,
      z: DEFAULT_CAMERA.z,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => controls.update(),
    });
  }, [camera, cameraResetRequest]);

  useEffect(() => () => {
    gsap.killTweensOf(camera.position);
    if (controlsRef.current) gsap.killTweensOf(controlsRef.current.target);
    document.body.style.cursor = 'auto';
  }, [camera]);

  if (!currentRepo) return null;

  return (
    <>
      <AmbientBackground dim />
      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        enableDamping
        dampingFactor={0.065}
        autoRotate={!isInteracting && !selectedPlanetId && !selectedFileId}
        autoRotateSpeed={0.22}
        minDistance={8}
        maxDistance={85}
        minPolarAngle={0.18}
        maxPolarAngle={Math.PI - 0.18}
        onStart={() => setIsInteracting(true)}
        onEnd={() => setIsInteracting(false)}
        makeDefault
      />

      <ambientLight intensity={0.08} color="#182033" />
      <pointLight position={[0, 0, 0]} intensity={175} distance={120} decay={2} color="#ffd39a" />

      <ProceduralSun repoId={currentRepo.id} label={currentRepo.name} />

      {currentRepo.folders.map((folder, folderIndex) => (
        <FolderPlanetGroup
          key={folder.id}
          folder={folder}
          folderIndex={folderIndex}
          viewMode={viewMode}
          selectedPlanetId={selectedPlanetId}
          selectedFileId={selectedFileId}
          isTimelineAffected={affectedFolders.has(folder.id)}
          affectedFiles={affectedFiles}
          onSelectPlanet={(selectedFolder, position, scale) => {
            setSelectedPlanetId(selectedFolder.id);
            setSelectedFileId(null);
            focusOnObject(position, scale);
          }}
          onSelectFile={(file, position, scale) => {
            setSelectedPlanetId(folder.id);
            setSelectedFileId(file.id);
            focusOnObject(position, scale);
          }}
          registerMoon={registerMoon}
        />
      ))}

      {viewMode === 'dependency' && (
        <DependencyWebLines folders={currentRepo.folders} objects={moonObjectsRef} />
      )}
    </>
  );
};

const ProceduralSun: React.FC<{ repoId: string; label: string }> = ({ repoId, label }) => {
  const sunRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => getSunTexture(repoId), [repoId]);

  useFrame((_, delta) => {
    if (sunRef.current) sunRef.current.rotation.y += delta * 0.035;
  });

  return (
    <group>
      <mesh ref={sunRef} scale={2.8}>
        <sphereGeometry args={[1, 48, 32]} />
        <meshStandardMaterial
          map={texture}
          color="#fff1d0"
          emissive="#e87926"
          emissiveMap={texture}
          emissiveIntensity={1.25}
          roughness={0.72}
          metalness={0}
        />
      </mesh>
      <mesh scale={3.15}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshBasicMaterial
          color="#f7a64a"
          transparent
          opacity={0.09}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={3.55}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshBasicMaterial
          color="#d96c24"
          transparent
          opacity={0.035}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <Html position={[0, 4, 0]} center distanceFactor={28} style={{ pointerEvents: 'none' }}>
        <div className="px-3 py-1 rounded instrument-panel border-amber/50 font-mono text-xs text-amber font-bold shadow-2xl whitespace-nowrap">
          {label} · repository star
        </div>
      </Html>
    </group>
  );
};

interface FolderPlanetProps {
  folder: FolderPlanet;
  folderIndex: number;
  viewMode: ViewMode;
  selectedPlanetId: string | null;
  selectedFileId: string | null;
  isTimelineAffected: boolean;
  affectedFiles: Set<string>;
  onSelectPlanet: (folder: FolderPlanet, position: THREE.Vector3, scale: number) => void;
  onSelectFile: (file: FileItem, position: THREE.Vector3, scale: number) => void;
  registerMoon: (id: string, object: THREE.Object3D | null) => void;
}

const FolderPlanetGroup: React.FC<FolderPlanetProps> = ({
  folder,
  folderIndex,
  viewMode,
  selectedPlanetId,
  selectedFileId,
  isTimelineAffected,
  affectedFiles,
  onSelectPlanet,
  onSelectFile,
  registerMoon,
}) => {
  const orbitGroupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const worldPosition = useMemo(() => new THREE.Vector3(), []);

  const isSelected = selectedPlanetId === folder.id;
  const radius = folder.orbitalRadius || (folderIndex + 1) * 11;
  const speed = folder.orbitalSpeed || 0.12;
  const planetScale = Math.max(1.05, Math.log10(folder.totalLoc || 1000) * 0.43);
  const profile = useMemo(() => getPlanetProfile(folder.id, folder.totalLoc), [folder.id, folder.totalLoc]);
  const colorTexture = useMemo(() => getPlanetTexture(folder.id, folder.aggregateRisk), [folder.aggregateRisk, folder.id]);
  const bumpTexture = useMemo(() => getPlanetBumpTexture(folder.id), [folder.id]);
  const warmHighlight = folder.aggregateRisk > 0.62 ? '#8f291d' : '#392313';

  useFrame((state, delta) => {
    if (orbitGroupRef.current) orbitGroupRef.current.rotation.y += delta * speed * 0.32;
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.045;
      const pulse = isTimelineAffected ? 1 + Math.sin(state.clock.elapsedTime * 3) * 0.025 : 1;
      const selectedScale = isSelected ? 1.12 : 1;
      planetRef.current.scale.setScalar(planetScale * selectedScale * pulse);
    }
  });

  return (
    <group ref={orbitGroupRef} rotation={[0, (hashString(folder.id) % 628) / 100, 0]}>
      <OrbitRing radius={radius} opacity={isSelected ? 0.3 : 0.11} />
      <group position={[radius, ((folderIndex % 3) - 1) * 0.55, 0]}>
        <mesh
          ref={planetRef}
          onClick={(event) => {
            event.stopPropagation();
            if (!planetRef.current) return;
            planetRef.current.getWorldPosition(worldPosition);
            onSelectPlanet(folder, worldPosition, planetScale);
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            setIsHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setIsHovered(false);
            document.body.style.cursor = 'auto';
          }}
        >
          <sphereGeometry args={[1, 40, 28]} />
          <meshStandardMaterial
            map={colorTexture}
            bumpMap={bumpTexture}
            bumpScale={profile.kind === 'gas' ? 0.035 : 0.12}
            color="#ffffff"
            emissive={isSelected ? '#d18b3d' : isTimelineAffected ? '#8f5b28' : warmHighlight}
            emissiveIntensity={isSelected ? 0.34 : isTimelineAffected ? 0.22 : folder.aggregateRisk * 0.08}
            roughness={profile.roughness}
            metalness={0.015}
          />
        </mesh>

        {profile.atmosphere && (
          <Atmosphere color={profile.atmosphere} scale={planetScale * 1.055} strength={isSelected ? 0.58 : 0.34} />
        )}
        {profile.hasRings && <PlanetRings id={folder.id} scale={planetScale} />}

        {(isHovered || isSelected) && (
          <Html
            position={[0, planetScale + 0.85, 0]}
            center
            distanceFactor={24}
            occlude
            style={{ pointerEvents: 'none' }}
          >
            <div className="px-2 py-0.5 rounded instrument-panel border-brass/30 font-mono text-[10px] text-starwhite shadow-lg whitespace-nowrap">
              {folder.name} · {folder.totalLoc.toLocaleString()} LOC
            </div>
          </Html>
        )}

        {folder.files.map((file, fileIndex) => (
          <FileMoonGroup
            key={file.id}
            file={file}
            fileIndex={fileIndex}
            parentScale={planetScale}
            viewMode={viewMode}
            isSelected={selectedFileId === file.id}
            isTimelineAffected={affectedFiles.has(file.id)}
            onSelectFile={onSelectFile}
            registerMoon={registerMoon}
          />
        ))}
      </group>
    </group>
  );
};

interface FileMoonProps {
  file: FileItem;
  fileIndex: number;
  parentScale: number;
  viewMode: ViewMode;
  isSelected: boolean;
  isTimelineAffected: boolean;
  onSelectFile: (file: FileItem, position: THREE.Vector3, scale: number) => void;
  registerMoon: (id: string, object: THREE.Object3D | null) => void;
}

const FileMoonGroup: React.FC<FileMoonProps> = ({
  file,
  fileIndex,
  parentScale,
  viewMode,
  isSelected,
  isTimelineAffected,
  onSelectFile,
  registerMoon,
}) => {
  const orbitRef = useRef<THREE.Group>(null);
  const moonRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const worldPosition = useMemo(() => new THREE.Vector3(), []);
  const texture = useMemo(() => getMoonTexture(file.id), [file.id]);
  const moonRadius = parentScale + 2 + fileIndex * 1.22;
  const moonSpeed = 0.28 + (hashString(file.id) % 32) / 100;
  const moonScale = Math.max(0.34, Math.log10(file.loc || 200) * 0.18);
  const inclination = ((hashString(`${file.id}-inclination`) % 23) - 11) * 0.012;
  const ownershipColor = useMemo(() => {
    const colors = ['#5b8eaa', '#c99a56', '#9b7bb5', '#6e9b87', '#b46f5a'];
    return colors[hashString(file.top_contributor) % colors.length];
  }, [file.top_contributor]);

  useEffect(() => {
    registerMoon(file.id, moonRef.current);
    return () => registerMoon(file.id, null);
  }, [file.id, registerMoon]);

  useFrame((state, delta) => {
    if (orbitRef.current) orbitRef.current.rotation.y += delta * moonSpeed;
    if (moonRef.current) {
      moonRef.current.rotation.y += delta * 0.1;
      const pulse = isTimelineAffected ? 1.15 + Math.sin(state.clock.elapsedTime * 4.2 + fileIndex) * 0.09 : 1;
      moonRef.current.scale.setScalar(moonScale * (isSelected ? 1.32 : pulse));
    }
  });

  const moon = (
    <mesh
      ref={moonRef}
      onClick={(event) => {
        event.stopPropagation();
        if (!moonRef.current) return;
        moonRef.current.getWorldPosition(worldPosition);
        onSelectFile(file, worldPosition, moonScale);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setIsHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setIsHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <sphereGeometry args={[1, 24, 18]} />
      <meshStandardMaterial
        map={texture}
        color={viewMode === 'ownership' ? ownershipColor : '#ffffff'}
        emissive={isSelected ? '#d59a55' : isTimelineAffected ? '#d78134' : '#11151b'}
        emissiveIntensity={isSelected ? 0.75 : isTimelineAffected ? 0.62 : 0.03}
        roughness={0.9}
        metalness={0}
      />
    </mesh>
  );

  return (
    <group ref={orbitRef} rotation={[inclination, (hashString(file.id) % 628) / 100, inclination * 0.5]}>
      <OrbitRing radius={moonRadius} opacity={isSelected ? 0.24 : 0.055} segments={64} />
      <group position={[moonRadius, 0, 0]}>
        {isTimelineAffected ? (
          <Trail width={0.55} length={3.5} color="#d98a3c" attenuation={(value) => value * value}>
            {moon}
          </Trail>
        ) : moon}
        {(isSelected || isTimelineAffected || viewMode === 'ownership') && (
          <mesh scale={moonScale * (isSelected ? 1.58 : 1.38)}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshBasicMaterial
              color={viewMode === 'ownership' ? ownershipColor : isTimelineAffected ? '#d98a3c' : '#e8a33d'}
              transparent
              opacity={isSelected ? 0.18 : 0.1}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}
        {(isHovered || isSelected) && (
          <Html
            position={[0, moonScale + 0.5, 0]}
            center
            distanceFactor={18}
            occlude
            style={{ pointerEvents: 'none' }}
          >
            <div className="px-2 py-0.5 rounded instrument-panel border-brass/30 font-mono text-[9px] text-starwhite whitespace-nowrap">
              {file.name} · {(file.risk_score * 100).toFixed(0)}% risk
            </div>
          </Html>
        )}
      </group>
    </group>
  );
};

const Atmosphere: React.FC<{ color: string; scale: number; strength: number }> = ({ color, scale, strength }) => {
  const uniforms = useMemo(() => ({
    glowColor: { value: new THREE.Color(color) },
    strength: { value: strength },
  }), [color, strength]);

  return (
    <mesh scale={scale}>
      <sphereGeometry args={[1, 28, 20]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vView = normalize(-mvPosition.xyz);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 glowColor;
          uniform float strength;
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            float rim = pow(1.0 - max(0.0, dot(vNormal, vView)), 2.4);
            gl_FragColor = vec4(glowColor, rim * strength);
          }
        `}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.FrontSide}
      />
    </mesh>
  );
};

const PlanetRings: React.FC<{ id: string; scale: number }> = ({ id, scale }) => {
  const tilt = ((hashString(`${id}-rings`) % 36) - 18) * (Math.PI / 180);
  return (
    <mesh rotation={[Math.PI / 2 + tilt, tilt * 0.4, 0]}>
      <ringGeometry args={[scale * 1.35, scale * 1.9, 80]} />
      <meshStandardMaterial
        color="#b9a181"
        transparent
        opacity={0.22}
        roughness={0.88}
        metalness={0}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

const OrbitRing: React.FC<{ radius: number; opacity: number; segments?: number }> = ({ radius, opacity, segments = 112 }) => {
  const geometry = useMemo(() => {
    const positions = new Float32Array(segments * 3);
    for (let index = 0; index < segments; index += 1) {
      const angle = (index / segments) * Math.PI * 2;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = 0;
      positions[index * 3 + 2] = Math.sin(angle) * radius;
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return result;
  }, [radius, segments]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineLoop geometry={geometry} rotation={[0, 0, 0]}>
      <lineBasicMaterial color="#a99272" transparent opacity={opacity} depthWrite={false} />
    </lineLoop>
  );
};

interface DependencyWebLinesProps {
  folders: FolderPlanet[];
  objects: React.MutableRefObject<MoonRegistry>;
}

const DependencyWebLines: React.FC<DependencyWebLinesProps> = ({ folders, objects }) => {
  const pairs = useMemo(() => {
    const knownIds = new Set(folders.flatMap((folder) => folder.files.map((file) => file.id)));
    return folders.flatMap((folder) => folder.files.flatMap((file) =>
      (file.dependencies ?? [])
        .filter((targetId) => knownIds.has(targetId))
        .map((targetId) => [file.id, targetId] as const),
    ));
  }, [folders]);

  const geometry = useMemo(() => {
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pairs.length * 6), 3));
    return result;
  }, [pairs.length]);
  const start = useMemo(() => new THREE.Vector3(), []);
  const end = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    const attribute = geometry.getAttribute('position') as THREE.BufferAttribute;
    const values = attribute.array as Float32Array;
    pairs.forEach(([fromId, toId], index) => {
      const from = objects.current.get(fromId);
      const to = objects.current.get(toId);
      if (from && to) {
        from.getWorldPosition(start);
        to.getWorldPosition(end);
        values.set([start.x, start.y, start.z, end.x, end.y, end.z], index * 6);
      }
    });
    attribute.needsUpdate = true;
  });

  if (!pairs.length) return null;
  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial color="#5e91b5" transparent opacity={0.48} depthWrite={false} />
    </lineSegments>
  );
};
