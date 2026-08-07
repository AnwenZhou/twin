import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { useLoader } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import Goods from './goods';
import { staticUrl } from '../../../utils/staticUrl';

export interface ForkTruckRef {
  root: THREE.Group | null;
  liftArm: THREE.Group | null;
  forkArm: THREE.Group | null;
}

interface IFourWayCar {
  hasGoods?: boolean;
  position?: THREE.Vector3 | number[];
  radian?: number;
  liftArmHeight?: number;
  forkArmHeight?: number;
}

const ForkTruck = forwardRef<ForkTruckRef, IFourWayCar>((props, ref) => {
  const { hasGoods, position, liftArmHeight = 0, forkArmHeight = 0, radian = 0 } = props;
  const forkFbx = useLoader(FBXLoader, staticUrl('static/models/SE-1.FBX'));
  const liftFbx = useLoader(FBXLoader, staticUrl('static/models/SE-2.FBX'));
  const bodyFbx = useLoader(FBXLoader, staticUrl('static/models/SE-3.FBX'));
  const rootRef = useRef<THREE.Group>(null);
  const liftArmRef = useRef<THREE.Group>(null);
  const forkArmRef = useRef<THREE.Group>(null);

  useImperativeHandle(ref, () => ({
    root: rootRef.current,
    liftArm: liftArmRef.current,
    forkArm: forkArmRef.current,
  }));

  const model1 = useMemo(() => {
    const model = forkFbx.clone();
    model.scale.set(0.05, 0.05, 0.05);
    return model;
  }, [forkFbx]);
  const model2 = useMemo(() => {
    const model = liftFbx.clone();
    model.scale.set(0.05, 0.05, 0.05);
    return model;
  }, [liftFbx]);
  const model3 = useMemo(() => {
    const model = bodyFbx.clone();
    model.scale.set(0.05, 0.05, 0.05);
    return model;
  }, [bodyFbx]);
  return (
    <group ref={rootRef} position={position} rotation-y={radian}>
      {/* 叉臂 */}
      <group ref={liftArmRef} position-y={liftArmHeight}>
        <group ref={forkArmRef} position-y={forkArmHeight}>
          {hasGoods && <Goods groupProps={{ position: [0, 2, -77] }}></Goods>}
          <primitive object={model1} position={[0, 0, -30]} />
        </group>
        {/* 举升臂 */}
        <primitive object={model2} position={[0, 0, -28]} />
      </group>
      {/* 车体 */}
      <primitive object={model3} position={[0, 0, 0]} />
    </group>
  );
});

export default ForkTruck;
