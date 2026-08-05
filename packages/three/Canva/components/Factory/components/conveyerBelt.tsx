import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { useLoader } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import Goods from './goods';

interface IConveyerBelt {
  hasGoods?: boolean;
  goodsPosition: number[];
  position: THREE.Vector3 | number[];
}
const width = 315;
const ConveyerBelt = forwardRef<THREE.Group, IConveyerBelt>((props, ref) => {
  const { hasGoods, position, goodsPosition } = props;
  const goodsRef = useRef<THREE.Group>(null);
  const fbx = useLoader(
    FBXLoader,
    process.env.NODE_ENV == 'development'
      ? '/static/models/GTX.FBX'
      : `/degital-twin-3d/static/models/GTX.FBX`
  );
  const model = useMemo(() => {
    const belt = fbx.clone();
    belt.scale.set(0.08, 0.05, 0.08);
    return belt;
  }, [fbx]);
  useImperativeHandle(ref, () => goodsRef.current);
  return (
    <group position={position}>
      {hasGoods && <Goods groupProps={{ ref: goodsRef, position: goodsPosition }}></Goods>}
      <primitive object={model} position={[-width, 0, 0]} />
      <primitive object={model.clone()} position={[0, 0, 0]} />
      <primitive object={model.clone()} position={[width, 0, 0]} />
    </group>
  );
});

export default ConveyerBelt;
