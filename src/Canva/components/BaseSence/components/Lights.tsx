// Atmosphere color lights + a dedicated shadow-casting directional light
import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { SkyLight, SunLight } from '@takram/three-atmosphere/r3f';

/** Warehouse / shelf cluster center (House group default position) */
const SCENE_CENTER = new THREE.Vector3(200, 0, 0);
/** Sun direction — light sits far along this ray for a valid shadow camera */
const MAIN_LIGHT_DIR = new THREE.Vector3(0.55, 1, 0.4).normalize();
const MAIN_LIGHT_DISTANCE = 18000;
const MAIN_LIGHT_POS = SCENE_CENTER.clone().addScaledVector(
  MAIN_LIGHT_DIR,
  MAIN_LIGHT_DISTANCE
);

/**
 * Tight frustum around the warehouse (not full ±13k plaza).
 * Large extents with 4k maps make each texel ~6m — shadows vanish visually.
 */
const SHADOW_EXTENT = 4000;
const SHADOW_MAP = 4096;
const SHADOW_NEAR = 1;
const SHADOW_FAR = 40000;

/**
 * Atmosphere SunLight/SkyLight color only — they don't produce reliable
 * local-twin shadow maps. A plain DirectionalLight casts site shadows.
 * Keep SkyLight/ambient low so unshadowed IBL doesn't wash the key light.
 */
const Lights = () => {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const shadowTarget = useMemo(() => {
    const t = new THREE.Object3D();
    t.position.copy(SCENE_CENTER);
    return t;
  }, []);

  useLayoutEffect(() => {
    const light = lightRef.current;
    if (!light) return;
    light.target = shadowTarget;
    light.target.updateMatrixWorld();
    light.shadow.camera.updateProjectionMatrix();
    light.shadow.needsUpdate = true;
  }, [shadowTarget]);

  return (
    <>
      <ambientLight intensity={0.02} />
      <SkyLight intensity={0.06} />
      <SunLight distance={28000} intensity={0.3} />

      <directionalLight
        ref={lightRef}
        castShadow
        color="#ffe7c4"
        intensity={5}
        position={[MAIN_LIGHT_POS.x, MAIN_LIGHT_POS.y, MAIN_LIGHT_POS.z]}
        target={shadowTarget}
        shadow-mapSize={[SHADOW_MAP, SHADOW_MAP]}
        shadow-bias={-0.0002}
        shadow-normalBias={1.5}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[
            -SHADOW_EXTENT,
            SHADOW_EXTENT,
            SHADOW_EXTENT,
            -SHADOW_EXTENT,
            SHADOW_NEAR,
            SHADOW_FAR,
          ]}
        />
      </directionalLight>
      <primitive object={shadowTarget} />
    </>
  );
};

export default Lights;
