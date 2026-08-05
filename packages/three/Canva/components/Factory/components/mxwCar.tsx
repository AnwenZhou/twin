import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { useLoader } from '@react-three/fiber';
import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import Goods from './goods';

interface IMxwCar {
  hasGoods?: boolean;
  position?: THREE.Vector3 | number[];
  radian?: number;
}

const MxwCar = forwardRef<THREE.Group, IMxwCar>((props, ref) => {
  const { hasGoods, position, radian } = props;
  const fbx = useLoader(
    FBXLoader,
    process.env.NODE_ENV == 'development'
      ? '/static/models/maixiaowei-1.FBX'
      : `/degital-twin-3d/static/models/maixiaowei-1.FBX`
  );
  const carModel = useMemo(() => {
    const model = fbx.clone();
    model.scale.set(0.05, 0.05, 0.05);
    return model;
  }, [fbx]);
  return (
    <group ref={ref} position={position} rotation-y={radian}>
      {hasGoods && <Goods groupProps={{ position: [0, 0, -10] }} />}
      {carModel && <primitive object={carModel} />}
    </group>
  );
});

export default MxwCar;
