// 基础场景

import React from 'react';
import Camera from './components/Camera';
import Lights from './components/Lights';
import SkyBox from './components/Sky';
import TreeGroup from './components/others/treeGroup';
import Buildings from './components/Buidings';
import { observer } from '../../store';
// 创建Canva组件

const BaseSence = () => {
  return (
    <group>
      <Lights />
      <Camera />
      <SkyBox />
      {/* 建筑 */}
      <Buildings />
      {/* 树 */}
      <TreeGroup />
    </group>
  );
};

export default observer(BaseSence);
