// 基础场景

import React, { Suspense } from 'react';
import Camera from './components/Camera';
import Lights from './components/Lights';
import Buildings from './components/Buidings';
import { observer } from '../../store';

const BaseSence = () => {
  return (
    <group>
      <Lights />
      <Camera />
      {/* 广场树木 / 原白柱区域，模型较重独立 Suspense */}
      <Suspense fallback={null}>
        <Buildings />
      </Suspense>
    </group>
  );
};

export default observer(BaseSence);
