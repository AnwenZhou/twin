/**
 * @file index.tsx
 * @description 存放仓库模型
 */

import React, { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import ElectronicFence from './components/ElectronicFence';
import House from './components/house';
import WarehouseMap from './components/WarehouseMap';

function enableMeshShadows(root: THREE.Object3D) {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const canReceive = mats.some(
      (m) => m && !(m as THREE.MeshBasicMaterial).isMeshBasicMaterial
    );
    mesh.castShadow = true;
    mesh.receiveShadow = canReceive;
  });
}

const Factory = () => {
  const rootRef = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    if (!rootRef.current) return;
    enableMeshShadows(rootRef.current);
  });

  return (
    <group ref={rootRef}>
      <House />
      <WarehouseMap />
      <ElectronicFence />
    </group>
  );
};

export default Factory;
