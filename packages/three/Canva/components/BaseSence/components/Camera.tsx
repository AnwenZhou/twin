// 添加场景相机
import {
  PerspectiveCamera,
  CameraControls,
  FirstPersonControls,
  MapControls,
} from '@react-three/drei';

import React from 'react';
import { observer, useThreeStore } from '../../../store';

const Camera = (props: any) => {
  const threeStore = useThreeStore();
  const flyCtrl = () => {
    return (
      <group>
        <FirstPersonControls
          far={100000}
          movementSpeed={100}
          activeLook={false}
          lookVertical={true}
        ></FirstPersonControls>
        {/* <OrbitControls /> */}
        <MapControls zoomSpeed={0.1} />
      </group>
    );
  };

  const ctrl = () => {
    return (
      <group>
        {/* 相机控制器 */}
        {/* <PresentationControls /> */}
        <CameraControls />
        {/* <PointerCtrl /> */}
      </group>
    );
  };
  return (
    <>
      {threeStore.cameraCtrls.choiceCtrls === '1' ? ctrl() : flyCtrl()}
      <PerspectiveCamera
        makeDefault
        position={[-100, 200, 1000]}
        fov={48}
        near={1}
        far={100000}
        maxDistance={10}
        {...props}
      />
    </>
  );
};
export default observer(Camera);
