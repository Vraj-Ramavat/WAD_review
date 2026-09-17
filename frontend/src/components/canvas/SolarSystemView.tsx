import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Trail } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useRepoStore } from '../../store/useRepoStore';
import { useViewStore } from '../../store/useViewStore';
import { FolderPlanet, FileItem } from '../../types';
import { AmbientBackground } from './AmbientBackground';

export const SolarSystemView: React.FC = () => {
  const currentRepo = useRepoStore((state) => state.currentRepo);
  const viewMode = useViewStore((state) => state.viewMode);
  const selectedPlanetId = useViewStore((state) => state.selectedPlanetId);
  const selectedFileId = useViewStore((state) => state.selectedFileId);
  const setSelectedPlanetId = useViewStore((state) => state.setSelectedPlanetId);
  const setSelectedFileId = useViewStore((state) => state.setSelectedFileId);
  const timelinePosition = useViewStore((state) => state.timelinePosition);

  const controlsRef = useRef<any>(null);
  const sunMeshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  if (!currentRepo) return null;

  // Camera focus animation on planet or moon click
  const focusOnObject = (targetPos: THREE.Vector3) => {
    if (!controlsRef.current) return;
    gsap.to(controlsRef.current.target, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.2,
      ease: 'power2.inOut',
    });
    gsap.to(camera.position, {
      x: targetPos.x + 8,
      y: targetPos.y + 6,
      z: targetPos.z + 12,
      duration: 1.2,
      ease: 'power2.inOut',
    });
  };

  // Map for storing moon world positions for Dependency Web
  const fileWorldPositions = new Map<string, THREE.Vector3>();

  return (
    <>
      {/* Requirement 3: Background Starfield so space is never empty black */}
      <AmbientBackground dim />

      {/* Requirement 8: OrbitControls with subtle autoRotate camera drift */}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={0.35}
        minDistance={5}
        maxDistance={90}
        makeDefault
      />

      {/* Requirement 2: Real Point Lighting at Sun's center with realistic decay & low ambient */}
      <ambientLight intensity={0.25} color="#0B0F1A" />
      <pointLight
        position={[0, 0, 0]}
        intensity={12}
        distance={120}
        decay={1.8}
        color="#E8A33D"
      />

      {/* SUN: Central Repository Core with Multi-Layered Corona */}
      <group position={[0, 0, 0]}>
        {/* Requirement 2: Emissive MeshStandardMaterial Core */}
        <mesh ref={sunMeshRef} scale={2.8}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color="#E8A33D"
            emissive="#E8A33D"
            emissiveIntensity={3.5}
            roughness={0.1}
            metalness={0.2}
          />
        </mesh>

        {/* Requirement 7: Multi-Layered Sun Corona Shells */}
        <mesh scale={3.8}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color="#E8A33D"
            emissive="#E8A33D"
            emissiveIntensity={1.8}
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>

        <mesh scale={5.2}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color="#E8A33D"
            emissive="#E8A33D"
            emissiveIntensity={0.8}
            transparent
            opacity={0.12}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Sun Title Label */}
        <Html position={[0, 4.2, 0]} center distanceFactor={30}>
          <div className="px-3 py-1 rounded instrument-panel border-amber/50 font-mono text-xs text-amber font-bold shadow-2xl">
            ☉ {currentRepo.name} (Sun)
          </div>
        </Html>
      </group>

      {/* FOLDER PLANETS & FILE MOONS */}
      {currentRepo.folders.map((folder, folderIdx) => {
        return (
          <FolderPlanetGroup
            key={folder.id}
            folder={folder}
            folderIdx={folderIdx}
            viewMode={viewMode}
            selectedPlanetId={selectedPlanetId}
            selectedFileId={selectedFileId}
            onSelectPlanet={(f, pos) => {
              setSelectedPlanetId(f.id);
              setSelectedFileId(null);
              focusOnObject(pos);
            }}
            onSelectFile={(file, pos) => {
              setSelectedFileId(file.id);
              setSelectedPlanetId(folder.id);
              focusOnObject(pos);
            }}
            onRegisterFilePos={(fileId, pos) => {
              fileWorldPositions.set(fileId, pos);
            }}
            timelinePosition={timelinePosition}
          />
        );
      })}

      {/* DEPENDENCY WEB CONNECTIVE THREADS */}
      {viewMode === 'dependency' && (
        <DependencyWebLines
          folders={currentRepo.folders}
          fileWorldPositions={fileWorldPositions}
        />
      )}
    </>
  );
};

// Component representing one Folder Planet orbiting the Sun + its orbiting File Moons
interface FolderPlanetProps {
  folder: FolderPlanet;
  folderIdx: number;
  viewMode: 'default' | 'dependency' | 'ownership';
  selectedPlanetId: string | null;
  selectedFileId: string | null;
  onSelectPlanet: (folder: FolderPlanet, pos: THREE.Vector3) => void;
  onSelectFile: (file: FileItem, pos: THREE.Vector3) => void;
  onRegisterFilePos: (fileId: string, pos: THREE.Vector3) => void;
  timelinePosition: number;
}

const FolderPlanetGroup: React.FC<FolderPlanetProps> = ({
  folder,
  folderIdx,
  viewMode,
  selectedPlanetId,
  selectedFileId,
  onSelectPlanet,
  onSelectFile,
  onRegisterFilePos,
  timelinePosition,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);

  const isSelected = selectedPlanetId === folder.id;
  const radius = folder.orbitalRadius || (folderIdx + 1) * 11;
  const speed = folder.orbitalSpeed || 0.12;
  const planetScale = Math.max(1.1, Math.log10(folder.totalLoc || 1000) * 0.45);

  // Color mapping from amber (low risk) to copper (high risk)
  const planetColor = new THREE.Color().lerpColors(
    new THREE.Color('#E8A33D'),
    new THREE.Color('#C4573B'),
    folder.aggregateRisk
  );

  // Orbit rotation
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * speed * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Requirement 5: Genuine 3D Torus Orbital Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.04, 16, 128]} />
        <meshStandardMaterial
          color="#B08D57"
          roughness={0.4}
          metalness={0.8}
          emissive="#B08D57"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* PLANET MESH */}
      <group position={[radius, 0, 0]}>
        {/* Requirement 2: MeshStandardMaterial picking up directional light & dark shadow terminator */}
        <mesh
          ref={planetMeshRef}
          scale={isSelected ? planetScale * 1.3 : planetScale}
          onClick={(e) => {
            e.stopPropagation();
            const worldPos = new THREE.Vector3();
            if (planetMeshRef.current) planetMeshRef.current.getWorldPosition(worldPos);
            onSelectPlanet(folder, worldPos);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color={planetColor}
            emissive={planetColor}
            emissiveIntensity={isSelected ? 1.4 : 0.4}
            roughness={0.35}
            metalness={0.2}
          />
        </mesh>

        {/* Label */}
        <Html position={[0, planetScale + 1.2, 0]} center distanceFactor={25}>
          <div className="px-2 py-0.5 rounded instrument-panel border-brass/30 font-mono text-[10px] text-starwhite shadow-lg whitespace-nowrap">
            🪐 {folder.name}
          </div>
        </Html>

        {/* Requirement 6: FILE MOONS prominently rendered around parent planet */}
        {folder.files.map((file, fileIdx) => {
          return (
            <FileMoonGroup
              key={file.id}
              file={file}
              fileIdx={fileIdx}
              totalFiles={folder.files.length}
              parentScale={planetScale}
              viewMode={viewMode}
              selectedFileId={selectedFileId}
              onSelectFile={onSelectFile}
              onRegisterFilePos={onRegisterFilePos}
              timelinePosition={timelinePosition}
            />
          );
        })}
      </group>
    </group>
  );
};

// Component representing an individual File Moon orbiting its parent Folder Planet
interface FileMoonProps {
  file: FileItem;
  fileIdx: number;
  totalFiles: number;
  parentScale: number;
  viewMode: 'default' | 'dependency' | 'ownership';
  selectedFileId: string | null;
  onSelectFile: (file: FileItem, pos: THREE.Vector3) => void;
  onRegisterFilePos: (fileId: string, pos: THREE.Vector3) => void;
  timelinePosition: number;
}

const FileMoonGroup: React.FC<FileMoonProps> = ({
  file,
  fileIdx,
  totalFiles,
  parentScale,
  viewMode,
  selectedFileId,
  onSelectFile,
  onRegisterFilePos,
  timelinePosition,
}) => {
  const moonGroupRef = useRef<THREE.Group>(null);
  const moonMeshRef = useRef<THREE.Mesh>(null);

  const isSelected = selectedFileId === file.id;
  // Requirement 6: Generous spacing and scale so moons are clearly visible at default camera distance
  const moonRadius = parentScale + 2.2 + fileIdx * 1.5;
  const moonSpeed = 0.6 + fileIdx * 0.25;
  const moonScale = Math.max(0.45, Math.log10(file.loc || 500) * 0.22);

  // Color mapping
  let moonColor = new THREE.Color().lerpColors(
    new THREE.Color('#E8A33D'),
    new THREE.Color('#C4573B'),
    file.risk_score
  );

  if (viewMode === 'ownership') {
    if (file.top_contributor.includes('Dan') || file.top_contributor.includes('Tim')) {
      moonColor = new THREE.Color('#4C7A9E');
    } else if (file.top_contributor.includes('Andrew') || file.top_contributor.includes('Alex')) {
      moonColor = new THREE.Color('#E8A33D');
    } else {
      moonColor = new THREE.Color('#B08D57');
    }
  }

  useFrame((_, delta) => {
    if (moonGroupRef.current) {
      moonGroupRef.current.rotation.y += delta * moonSpeed;
    }
    if (moonMeshRef.current) {
      const worldPos = new THREE.Vector3();
      moonMeshRef.current.getWorldPosition(worldPos);
      onRegisterFilePos(file.id, worldPos);
    }
  });

  return (
    <group ref={moonGroupRef}>
      {/* 3D Moon Orbital Ring around parent planet */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[moonRadius, 0.02, 12, 64]} />
        <meshStandardMaterial color="#B08D57" roughness={0.5} emissive="#B08D57" emissiveIntensity={0.2} transparent opacity={0.4} />
      </mesh>

      <group position={[moonRadius, 0, 0]}>
        {/* Requirement 2 & 6: MeshStandardMaterial file moon sphere */}
        <Trail width={1.4} length={6} color="#E8A33D" attenuation={(t) => t * t}>
          <mesh
            ref={moonMeshRef}
            scale={isSelected ? moonScale * 1.5 : moonScale}
            onClick={(e) => {
              e.stopPropagation();
              const worldPos = new THREE.Vector3();
              if (moonMeshRef.current) moonMeshRef.current.getWorldPosition(worldPos);
              onSelectFile(file, worldPos);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            <sphereGeometry args={[1, 24, 24]} />
            <meshStandardMaterial
              color={moonColor}
              emissive={moonColor}
              emissiveIntensity={isSelected ? 2.0 : 0.8}
              roughness={0.3}
            />
          </mesh>
        </Trail>
      </group>
    </group>
  );
};

// Component drawing databhlue lines between files referencing each other in Dependency Web mode
interface DependencyWebLinesProps {
  folders: FolderPlanet[];
  fileWorldPositions: Map<string, THREE.Vector3>;
}

const DependencyWebLines: React.FC<DependencyWebLinesProps> = ({ folders, fileWorldPositions }) => {
  const linePairs: [THREE.Vector3, THREE.Vector3][] = [];

  folders.forEach((folder) => {
    folder.files.forEach((file) => {
      const startPos = fileWorldPositions.get(file.id);
      if (startPos && file.dependencies) {
        file.dependencies.forEach((targetId) => {
          const endPos = fileWorldPositions.get(targetId);
          if (endPos) {
            linePairs.push([startPos, endPos]);
          }
        });
      }
    });
  });

  return (
    <group>
      {linePairs.map(([start, end], idx) => {
        const points = [start, end];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <primitive key={idx} object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#4C7A9E', linewidth: 2, transparent: true, opacity: 0.85 }))} />
        );
      })}
    </group>
  );
};
