import { Canvas as FiberCanvas } from '@react-three/fiber';
import React from 'react';
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
        }}
      >
        {/* 场景类 */}
        <BaseSence />
        {/* 工厂类 */}
        <Factory />
        {props.children}
        {/* 帮助类 */}
        <Gizmo />
      </FiberCanvas>
    </ThreeStoreProvider>
  );
};
export default Canva;
