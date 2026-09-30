import React, { useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import * as THREE from 'three';
import { useViewStore } from '../../store/useViewStore';
import { AmbientBackground } from './AmbientBackground';
import { MilkyWayHub } from './MilkyWayHub';
import { SolarSystemView } from './SolarSystemView';

// Requirement 1: Post-Processing UnrealBloomPass component
const PostProcessingBloom: React.FC = () => {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);

  useEffect(() => {
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.72,
      0.32,
      0.72
    );

    const composer = new EffectComposer(gl);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    composerRef.current = composer;

    return () => {
      composer.dispose();
    };
  }, [gl, scene, camera, size]);

  useFrame(() => {
    if (composerRef.current) {
      composerRef.current.render();
    }
  }, 1);

  return null;
};

export const GalaxyCanvas: React.FC = () => {
  const canvasMode = useViewStore((state) => state.canvasMode);

  const handlePointerMissed = () => {
    const state = useViewStore.getState();
    if (state.canvasMode !== 'solarsystem') return;
    state.setSelectedPlanetId(null);
    state.setSelectedFileId(null);
  };

  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [0, 10, 34], fov: 50 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onPointerMissed={handlePointerMissed}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        style={{ background: '#05070D' }}
      >
        {/* Render scene based on active canvas mode */}
        {canvasMode === 'ambient' && <AmbientBackground />}
        {canvasMode === 'milkyway' && <MilkyWayHub />}
        {canvasMode === 'solarsystem' && <SolarSystemView />}

        {/* Pure Three.js Post-Processing Bloom Pass */}
        <PostProcessingBloom />
      </Canvas>
    </div>
  );
};
