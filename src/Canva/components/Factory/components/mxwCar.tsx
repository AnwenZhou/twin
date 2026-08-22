import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { useLoader } from '@react-three/fiber';
import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import { applyMetalLookToObject } from '../../../utils/metalMaterials';
import { staticUrl } from '../../../utils/staticUrl';
import Goods from './goods';
import VehicleLabel from './VehicleLabel';

interface IMxwCar {
  hasGoods?: boolean;
  position?: THREE.Vector3 | number[];
  radian?: number;
  label?: string;
}

const MxwCar = forwardRef<THREE.Group, IMxwCar>((props, ref) => {
  const { hasGoods, position, radian, label } = props;
  const fbx = useLoader(FBXLoader, staticUrl('static/models/maixiaowei-1.FBX'));
  const carModel = useMemo(() => {
    const model = fbx.clone();
    model.scale.set(0.05, 0.05, 0.05);
    applyMetalLookToObject(model, { metalness: 1, roughness: 0.2, envMapIntensity: 2.4 });
    return model;
  }, [fbx]);
  return (
    <group ref={ref} position={position} rotation-y={radian}>
      {label && <VehicleLabel text={label} offsetY={90} />}
      {hasGoods && <Goods groupProps={{ position: [0, 0, -10] }} />}
      {carModel && <primitive object={carModel} />}
    </group>
  );
});

export default MxwCar;
