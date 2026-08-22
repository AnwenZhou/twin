import { Environment } from '@react-three/drei';
import { Canvas as FiberCanvas } from '@react-three/fiber';
import React, { Suspense } from 'react';
import { ACESFilmicToneMapping, PCFSoftShadowMap } from 'three';
import AtmosphereEnv from './components/AtmosphereEnv';
import BaseSence from './components/BaseSence';
import Factory from './components/Factory';
import Gizmo from './components/Help';
import { ThreeStoreProvider } from './store';
import { staticUrl } from './utils/staticUrl';

// 创建Canva组件
const Canva = (props) => {
  return (
    <ThreeStoreProvider>
      <FiberCanvas
        shadows
        gl={{
          logarithmicDepthBuffer: true,
          antialias: true,
          // Intent: ACES. EffectComposer temporarily sets NoToneMapping and
          // applies ACES_FILMIC in AtmosphereEnv's <ToneMapping /> pass instead.
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = PCFSoftShadowMap;
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
        }}
      >
        <AtmosphereEnv>
          {/* IBL for PBR metal roof / wall reflections (no background replace) */}
          {/* Stronger IBL for metal racks/robots; ground keeps envMapIntensity≈0.08 */}
          {/* Keep IBL modest — unshadowed env washes directional shadows */}
          <Environment
            files={staticUrl('static/quarry_01_1k.hdr')}
            background={false}
            environmentIntensity={0.45}
          />
          {/* Camera / lights / buildings first — don't block on heavy GLTF/FBX */}
          <BaseSence />
          <Suspense fallback={null}>
            <Factory />
          </Suspense>
          {props.children}
          <Gizmo />
        </AtmosphereEnv>
      </FiberCanvas>
    </ThreeStoreProvider>
  );
};
export default Canva;
