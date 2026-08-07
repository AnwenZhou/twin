import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { useLoader } from '@react-three/fiber';
import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import Goods from './goods';
import { staticUrl } from '../../../utils/staticUrl';

interface IFourWayCar {
  hasGoods?: boolean;
  position: THREE.Vector3 | number[];
}

const FourWayCar = forwardRef<THREE.Group, IFourWayCar>((props, ref) => {
  const { hasGoods, position } = props;
  const fbx = useLoader(FBXLoader, staticUrl('static/models/SXC-JXB.FBX'));
  const model = useMemo(() => {
    const car = fbx.clone();
    car.scale.set(0.05, 0.06, 0.04);
    return car;
  }, [fbx]);
  return (
    <group ref={ref} position={position}>
      {hasGoods && <Goods groupProps={{ position: [0, 5, 0] }}></Goods>}
      <primitive object={model} />
    </group>
  );
});

export default FourWayCar;
