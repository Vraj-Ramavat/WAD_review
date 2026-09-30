import * as THREE from 'three';

export type PlanetKind = 'rocky' | 'desert' | 'volcanic' | 'oceanic' | 'icy' | 'gas';

export interface PlanetProfile {
  kind: PlanetKind;
  atmosphere: string | null;
  roughness: number;
  hasRings: boolean;
}

const textureCache = new Map<string, THREE.CanvasTexture>();

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let result = state;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function makeTexture(key: string, draw: (context: CanvasRenderingContext2D, random: () => number) => void, size = [256, 128], color = true) {
  const existing = textureCache.get(key);
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  canvas.width = size[0];
  canvas.height = size[1];
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D textures are not supported in this browser.');

  draw(context, seededRandom(hashString(key)));
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.needsUpdate = true;
  textureCache.set(key, texture);
  return texture;
}

function colorToRgb(color: string): [number, number, number] {
  const parsed = new THREE.Color(color);
  return [parsed.r * 255, parsed.g * 255, parsed.b * 255];
}

function paintNoiseSurface(
  context: CanvasRenderingContext2D,
  random: () => number,
  palette: string[],
  bands = 0,
  risk = 0,
) {
  const { width, height } = context.canvas;
  const image = context.createImageData(width, height);
  const colors = palette.map(colorToRgb);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const wave = Math.sin(x * 0.075 + Math.sin(y * 0.12) * 2) * 0.16;
      const band = bands ? Math.sin(y * bands * 0.08 + Math.sin(x * 0.025)) * 0.3 : 0;
      const noise = random() * 0.52 + wave + band + risk * 0.08;
      const index = Math.max(0, Math.min(colors.length - 1, Math.floor(noise * colors.length)));
      const source = colors[index];
      const offset = (y * width + x) * 4;
      const grain = 0.82 + random() * 0.26;
      image.data[offset] = Math.min(255, source[0] * grain);
      image.data[offset + 1] = Math.min(255, source[1] * grain);
      image.data[offset + 2] = Math.min(255, source[2] * grain);
      image.data[offset + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);

  if (risk > 0.48) {
    context.globalCompositeOperation = 'screen';
    context.strokeStyle = `rgba(197,87,59,${0.08 + risk * 0.12})`;
    context.lineWidth = 1;
    for (let i = 0; i < 9 + risk * 9; i += 1) {
      let x = random() * width;
      let y = random() * height;
      context.beginPath();
      context.moveTo(x, y);
      for (let step = 0; step < 5; step += 1) {
        x += (random() - 0.5) * 22;
        y += (random() - 0.5) * 12;
        context.lineTo(x, y);
      }
      context.stroke();
    }
    context.globalCompositeOperation = 'source-over';
  }
}

const PLANET_PALETTES: Record<PlanetKind, string[]> = {
  rocky: ['#252727', '#47443f', '#696359', '#8a8173'],
  desert: ['#5c3f29', '#916541', '#c18c56', '#dfb878'],
  volcanic: ['#171616', '#39302d', '#6b3527', '#b25031'],
  oceanic: ['#071b2b', '#123a55', '#1f6480', '#7297a0'],
  icy: ['#263b47', '#66818d', '#a9c1c7', '#d9e5e4'],
  gas: ['#483a35', '#836c5b', '#b59a76', '#d5c2a0'],
};

export function getPlanetProfile(id: string, totalLoc = 0): PlanetProfile {
  const seed = hashString(id);
  const kinds: PlanetKind[] = ['rocky', 'desert', 'volcanic', 'oceanic', 'icy', 'gas'];
  const kind = kinds[seed % kinds.length];
  const atmosphere = {
    rocky: null,
    desert: '#d8a45d',
    volcanic: '#bd5739',
    oceanic: '#54a6ce',
    icy: '#b7e4eb',
    gas: '#d5b98e',
  }[kind];
  const roughness = kind === 'icy' ? 0.58 : kind === 'gas' ? 0.7 : 0.86;
  return { kind, atmosphere, roughness, hasRings: totalLoc > 8000 && seed % 5 === 0 };
}

export function getPlanetTexture(id: string, risk = 0): THREE.CanvasTexture {
  const profile = getPlanetProfile(id);
  const riskBucket = Math.round(risk * 10) / 10;
  return makeTexture(`planet-color-${id}-${riskBucket}`, (context, random) => {
    paintNoiseSurface(context, random, PLANET_PALETTES[profile.kind], profile.kind === 'gas' ? 5 : 0, riskBucket);
  });
}

export function getPlanetBumpTexture(id: string): THREE.CanvasTexture {
  return makeTexture(`planet-bump-${id}`, (context, random) => {
    paintNoiseSurface(context, random, ['#242424', '#535353', '#858585', '#b7b7b7'], 0, 0);
  }, [256, 128], false);
}

export function getMoonTexture(id: string): THREE.CanvasTexture {
  return makeTexture(`moon-color-${id}`, (context, random) => {
    const palettes = [
      ['#303239', '#565b63', '#8c9398', '#b3b5af'],
      ['#322d29', '#5d5147', '#887567', '#a59b8d'],
      ['#25333b', '#455b67', '#748996', '#aab8bd'],
    ];
    paintNoiseSurface(context, random, palettes[hashString(id) % palettes.length]);
    const { width, height } = context.canvas;
    for (let i = 0; i < 22; i += 1) {
      const radius = 1 + random() * 7;
      const gradient = context.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
      gradient.addColorStop(0, 'rgba(18,20,22,.38)');
      gradient.addColorStop(0.72, 'rgba(25,26,27,.2)');
      gradient.addColorStop(1, 'rgba(220,220,210,.08)');
      context.save();
      context.translate(random() * width, random() * height);
      context.scale(1, 0.55 + random() * 0.35);
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(0, 0, radius, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
  }, [128, 64]);
}

export function getSunTexture(id: string): THREE.CanvasTexture {
  return makeTexture(`sun-color-${id}`, (context, random) => {
    const { width, height } = context.canvas;
    const image = context.createImageData(width, height);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const cell = Math.sin(x * 0.24 + Math.sin(y * 0.18)) * 0.5 + Math.sin(y * 0.31) * 0.25;
        const heat = Math.max(0, Math.min(1, 0.58 + cell * 0.18 + (random() - 0.5) * 0.22));
        const offset = (y * width + x) * 4;
        image.data[offset] = 210 + heat * 45;
        image.data[offset + 1] = 82 + heat * 120;
        image.data[offset + 2] = 15 + heat * 45;
        image.data[offset + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
  }, [256, 128]);
}

let cachedStarTexture: THREE.CanvasTexture | null = null;

export function getGalaxyPointTexture(): THREE.CanvasTexture {
  if (cachedStarTexture) return cachedStarTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D textures are not supported in this browser.');
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.18, 'rgba(255,250,232,.88)');
  gradient.addColorStop(0.5, 'rgba(210,226,255,.24)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  cachedStarTexture = new THREE.CanvasTexture(canvas);
  cachedStarTexture.colorSpace = THREE.SRGBColorSpace;
  cachedStarTexture.needsUpdate = true;
  return cachedStarTexture;
}

export const getStarPointTexture = getGalaxyPointTexture;
