import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { useLoader } from '@react-three/fiber';
import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import { applyMetalLookToObject } from '../../../utils/metalMaterials';
import { staticUrl } from '../../../utils/staticUrl';
import Goods from './goods';
import VehicleLabel from './VehicleLabel';

interface IFourWayCar {
  hasGoods?: boolean;
  position: THREE.Vector3 | number[];
  label?: string;
}

const FourWayCar = forwardRef<THREE.Group, IFourWayCar>((props, ref) => {
  const { hasGoods, position, label } = props;
  const fbx = useLoader(FBXLoader, staticUrl('static/models/SXC-JXB.FBX'));
  const model = useMemo(() => {
    const car = fbx.clone();
    car.scale.set(0.05, 0.06, 0.04);
    applyMetalLookToObject(car, { metalness: 1, roughness: 0.2, envMapIntensity: 2.4 });
    return car;
  }, [fbx]);
  return (
    <group ref={ref} position={position}>
      {label && <VehicleLabel text={label} offsetY={50} />}
      {hasGoods && <Goods groupProps={{ position: [0, 5, 0] }}></Goods>}
      <primitive object={model} />
    </group>
  );
});

export default FourWayCar;
