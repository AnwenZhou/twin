// 基础场景

import React, { Suspense } from 'react';
import Camera from './components/Camera';
import Lights from './components/Lights';
import TreeGroup from './components/others/treeGroup';
import Buildings from './components/Buidings';
import { observer } from '../../store';

const BaseSence = () => {
  return (
    <group>
      <Lights />
      <Camera />
      {/* 建筑 */}
      <Buildings />
      {/* 树模型较重，独立 Suspense，避免卡住首屏 */}
      <Suspense fallback={null}>
        <TreeGroup />
      </Suspense>
    </group>
  );
};

export default observer(BaseSence);
