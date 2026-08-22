// Surrounding plaza trees (replaces previous white pillars)
import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { staticUrl } from '../../../utils/staticUrl';

const TREE_COUNT = 60;

type TreePose = {
  position: [number, number, number];
  scale: number;
  rotationY: number;
};

function enableShadows(root: THREE.Object3D) {
  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

/**
 * glTF leaves use alphaMode:BLEND — no depth write, so AerialPerspective/clouds
 * composite over them and "eat" foliage when looking up at the sky.
 * Switch to alpha-test cutout so leaves write depth like opaque geometry.
 */
function fixLeafTransparency(root: THREE.Object3D) {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      if (!mat) continue;
      const name = (mat.name || '').toLowerCase();
      const isLeaf =
        name.includes('leaf') || name.includes('leaves') || mat.transparent;
      if (!isLeaf) continue;
      mat.transparent = false;
      mat.alphaTest = 0.45;
      mat.depthWrite = true;
      mat.side = THREE.DoubleSide;
      mat.needsUpdate = true;
    }
  });
}

const Buildings = () => {
  const gltf = useLoader(GLTFLoader, staticUrl('static/models/tree.glb'));

  const poses = useMemo<TreePose[]>(() => {
    const list: TreePose[] = [];
    for (let i = 0; i < TREE_COUNT; i++) {
      const sideX = Math.random() < 0.5 ? -1 : 1;
      const sideZ = Math.random() < 0.5 ? -1 : 1;
      list.push({
        // Keep trees in the four corner plaza blocks, outside the warehouse cross-roads
        position: [
          Math.random() * 7000 * sideX + sideX * 2500,
          0,
          Math.random() * 7000 * sideZ + sideZ * 2500,
        ],
        scale: 40 + Math.random() * 80,
        rotationY: Math.random() * Math.PI * 2,
      });
    }
    return list;
  }, []);

  const trees = useMemo(() => {
    fixLeafTransparency(gltf.scene);
    enableShadows(gltf.scene);
    return poses.map((pose) => {
      const clone = gltf.scene.clone(true);
      clone.position.set(...pose.position);
      clone.scale.setScalar(pose.scale);
      clone.rotation.y = pose.rotationY;
      return clone;
    });
  }, [gltf.scene, poses]);

  return (
    <group>
      {trees.map((tree, index) => (
        <primitive key={index} object={tree} />
      ))}
    </group>
  );
};

export default Buildings;
