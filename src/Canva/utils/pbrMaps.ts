import * as THREE from 'three';
import { staticUrl } from './staticUrl';

export type PbrMaps = {
  map: THREE.Texture;
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
  metalnessMap?: THREE.Texture;
  aoMap?: THREE.Texture;
};

type LoadPbrOptions = {
  /** Polyhaven-style basename without suffix, e.g. static/pbr/road/asphalt_04 */
  basePath: string;
  repeat?: [number, number];
  rotation?: number;
  hasMetal?: boolean;
  hasAo?: boolean;
};

function configureMap(tex: THREE.Texture, srgb: boolean, repeat: [number, number], rotation?: number) {
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  if (rotation) tex.rotation = rotation;
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Load a Polyhaven 1K JPG PBR set (diff / nor_gl / rough [/ metal] [/ ao]). */
export function loadPbrSet(loader: THREE.TextureLoader, options: LoadPbrOptions): PbrMaps {
  const { basePath, repeat = [1, 1], rotation, hasMetal = false, hasAo = true } = options;
  const root = staticUrl(basePath);

  const maps: PbrMaps = {
    map: configureMap(loader.load(`${root}_diff_1k.jpg`), true, repeat, rotation),
    normalMap: configureMap(loader.load(`${root}_nor_gl_1k.jpg`), false, repeat, rotation),
    roughnessMap: configureMap(loader.load(`${root}_rough_1k.jpg`), false, repeat, rotation),
  };

  if (hasMetal) {
    maps.metalnessMap = configureMap(loader.load(`${root}_metal_1k.jpg`), false, repeat, rotation);
  }
  if (hasAo) {
    maps.aoMap = configureMap(loader.load(`${root}_ao_1k.jpg`), false, repeat, rotation);
  }

  return maps;
}

/** Tileable dashed lane markings (transparent background) for asphalt roads. */
export function createRoadMarkingTexture(repeat: [number, number] = [12, 1]): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Edge lines
  ctx.fillStyle = '#f2f2f2';
  ctx.fillRect(0, 10, canvas.width, 5);
  ctx.fillRect(0, canvas.height - 15, canvas.width, 5);

  // Center dashed yellow lane divider
  ctx.fillStyle = '#f0c84a';
  for (let x = 0; x < canvas.width; x += 72) {
    ctx.fillRect(x, canvas.height / 2 - 5, 40, 10);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
