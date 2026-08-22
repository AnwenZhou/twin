import * as THREE from 'three';
import { staticUrl } from './staticUrl';

export type MetalKind = 'blueSteel' | 'gold' | 'silver' | 'orangeSteel' | 'machine';

const SHELF_NORMAL_URL = staticUrl('static/floor/Asphalt031_1K-JPG_NormalGL.jpg');
let shelfNormalSource: THREE.Texture | null = null;

/** Shared asphalt normal for thin shelf rods — adds microdetail so specular reads at distance. */
export function getShelfNormalMap(repeat: [number, number] = [4, 4]) {
  if (!shelfNormalSource) {
    shelfNormalSource = new THREE.TextureLoader().load(SHELF_NORMAL_URL);
    shelfNormalSource.wrapS = THREE.RepeatWrapping;
    shelfNormalSource.wrapT = THREE.RepeatWrapping;
    shelfNormalSource.colorSpace = THREE.NoColorSpace;
  }
  const map = shelfNormalSource.clone();
  map.needsUpdate = true;
  map.repeat.set(repeat[0], repeat[1]);
  return map;
}

const PRESETS: Record<
  MetalKind,
  {
    color: THREE.ColorRepresentation;
    metalness: number;
    roughness: number;
    envMapIntensity: number;
    clearcoat: number;
    clearcoatRoughness: number;
  }
> = {
  blueSteel: {
    color: '#2f6fd1',
    metalness: 1,
    // Thin rods: 0.15–0.3 spreads specular into visible streaks at distance
    roughness: 0.22,
    envMapIntensity: 1.4,
    clearcoat: 0.35,
    clearcoatRoughness: 0.25,
  },
  gold: {
    color: '#d4a017',
    metalness: 1,
    roughness: 0.2,
    envMapIntensity: 1.5,
    clearcoat: 0.4,
    clearcoatRoughness: 0.22,
  },
  silver: {
    color: '#d7dbe3',
    metalness: 1,
    roughness: 0.22,
    envMapIntensity: 1.5,
    clearcoat: 0.25,
    clearcoatRoughness: 0.28,
  },
  orangeSteel: {
    color: '#e07820',
    metalness: 0.95,
    roughness: 0.25,
    envMapIntensity: 1.3,
    clearcoat: 0.3,
    clearcoatRoughness: 0.28,
  },
  machine: {
    color: '#a8b0ba',
    metalness: 1,
    roughness: 0.22,
    envMapIntensity: 1.4,
    clearcoat: 0.25,
    clearcoatRoughness: 0.25,
  },
};

/** PBR metal for procedural factory meshes (shelves, tracks, lifters). No roughness/metal maps. */
export function createMetalMaterial(
  kind: MetalKind,
  overrides?: Partial<THREE.MeshPhysicalMaterialParameters>
) {
  const preset = PRESETS[kind];
  return new THREE.MeshPhysicalMaterial({
    color: preset.color,
    map: null,
    roughnessMap: null,
    metalnessMap: null,
    normalMap: null,
    aoMap: null,
    metalness: preset.metalness,
    roughness: preset.roughness,
    envMapIntensity: preset.envMapIntensity,
    clearcoat: preset.clearcoat,
    clearcoatRoughness: preset.clearcoatRoughness,
    reflectivity: 1,
    ...overrides,
  });
}

type ApplyMetalOptions = {
  metalness?: number;
  roughness?: number;
  envMapIntensity?: number;
  /** Drop FBX diffuse maps (often matte rubber/paint) that kill metal look */
  ignoreMap?: boolean;
  /** Override albedo with a steel tint */
  forceColor?: THREE.ColorRepresentation;
};

/** Convert FBX Phong/Lambert mats to metallic Physical so HDR Environment reflects. */
export function applyMetalLookToObject(root: THREE.Object3D, options?: ApplyMetalOptions) {
  const metalness = options?.metalness ?? 1;
  const roughness = options?.roughness ?? 0.22;
  const envMapIntensity = options?.envMapIntensity ?? 1.4;
  const ignoreMap = options?.ignoreMap ?? false;
  const forceColor = options?.forceColor;

  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;

    const sourceMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const next = sourceMats.map((mat) => {
      const color = forceColor
        ? new THREE.Color(forceColor)
        : 'color' in mat && (mat as THREE.MeshPhongMaterial).color
          ? (mat as THREE.MeshPhongMaterial).color.clone()
          : new THREE.Color('#a8b0ba');
      const map =
        !ignoreMap && 'map' in mat ? (mat as THREE.MeshPhongMaterial).map : null;

      // Do not dispose `mat` — FBXLoader cache / clones often share materials.
      return new THREE.MeshPhysicalMaterial({
        color,
        map: map ?? undefined,
        metalness,
        roughness,
        envMapIntensity,
        clearcoat: 0.35,
        clearcoatRoughness: 0.2,
        reflectivity: 1,
        side: mat.side,
        transparent: mat.transparent,
        opacity: mat.opacity,
        name: mat.name,
      });
    });

    mesh.material = Array.isArray(mesh.material) ? next : next[0];
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });
}
