import * as THREE from 'three';

let cachedStarTexture: THREE.CanvasTexture | null = null;

// Procedurally generate a soft radial star point texture to eliminate square pixel box rendering
export function getStarPointTexture(): THREE.CanvasTexture {
  if (cachedStarTexture) return cachedStarTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.55, 'rgba(255, 255, 255, 0.25)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  cachedStarTexture = new THREE.CanvasTexture(canvas);
  cachedStarTexture.needsUpdate = true;
  return cachedStarTexture;
}
