import { Canvas as FiberCanvas } from '@react-three/fiber';
import React, { Suspense } from 'react';
import { NoToneMapping } from 'three';
import AtmosphereEnv from './components/AtmosphereEnv';
import BaseSence from './components/BaseSence';
import Factory from './components/Factory';
import Gizmo from './components/Help';
import { ThreeStoreProvider } from './store';

// 创建Canva组件
const Canva = (props) => {
  return (
    <ThreeStoreProvider>
      <FiberCanvas
        shadows
        gl={{
          logarithmicDepthBuffer: true,
          antialias: true,
          toneMapping: NoToneMapping,
          // AGX path expects moderate exposure; 10 was blowing out to white
          toneMappingExposure: 4.5,
        }}
      >
        <AtmosphereEnv>
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
