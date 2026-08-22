import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { observer } from '../../../store';
import Area from './area';
import ConveyerBelt from './conveyerBelt';
import ForkTruck, { ForkTruckRef } from './forkTruck';
import FourWayCar from './fourWayCar';
import Goods from './goods';
import Lifter from './lifter';
import MxwCar from './mxwCar';
import Shelf from './shelf';
import StereoscopicShelf from './stereoscopicShelf';
import StereoscopicTrack from './stereoscopicTrack';
import Tunnel from './tunnel';

import animationData from '../data/animation';
import areaData from '../data/area';
import goodsData from '../data/goods';
import shelfData from '../data/shelf';
import stereoscopicShelfData from '../data/stereoscopicShelf';
import tunnelData from '../data/tunnel';
import {
  A1_DROP,
  A1_PICK,
  A2_PICKUP_GOODS,
  A3_SLOT,
  A4_DROP,
  BELT_RIGHT_LOCAL,
  MANAGED_STATIC_GOODS,
} from '../data/waypoints';

const { Vector3 } = THREE;

type AnimatedElement = 'mxwCar' | 'forWayCar' | 'forkTruckCar' | 'forkTruckCar2' | 'conveyerBelt';
type GroundSpot = 'a2Source' | 'a3Slot' | 'a1Drop' | 'a1Pick' | 'a4Drop';
type CargoState = Record<AnimatedElement, boolean>;
type GroundState = Record<GroundSpot, boolean>;

const initialCargoState: CargoState = {
  mxwCar: false,
  forWayCar: false,
  forkTruckCar: false,
  forkTruckCar2: false,
  conveyerBelt: false,
};

const initialGroundState: GroundState = {
  a2Source: true,
  a3Slot: false,
  a1Drop: false,
  a1Pick: true,
  a4Drop: false,
};

const initialPose = {
  mxwCar: { position: [400, 0, 700], radian: 0 },
  fourWayCar: { position: [-125, 23, 32] },
  forkTruckCar: {
    position: [460, 0, 700],
    radian: 0,
    liftArmHeight: 0,
    forkArmHeight: 0,
  },
  forkTruckCar2: {
    position: [-780, 0, -300],
    radian: 0,
    liftArmHeight: 0,
    forkArmHeight: 0,
  },
  conveyerBelt: { goodsPosition: [...BELT_RIGHT_LOCAL] },
};

function samePos(a: number[], b: readonly number[]) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function setPosition(target: THREE.Object3D | null | undefined, position: number[]) {
  if (!target) return;
  target.position.set(position[0], position[1], position[2]);
}

function lerpPosition(target: THREE.Object3D | null | undefined, from: number[], to: number[], progress: number) {
  if (!target) return;
  target.position.set(
    lerp(from[0], to[0], progress),
    lerp(from[1], to[1], progress),
    lerp(from[2], to[2], progress)
  );
}

function setForkTruckPose(target: ForkTruckRef | null, pose: typeof initialPose.forkTruckCar) {
  setPosition(target?.root, pose.position);
  if (target?.root) target.root.rotation.y = pose.radian;
  if (target?.liftArm) target.liftArm.position.y = pose.liftArmHeight;
  if (target?.forkArm) target.forkArm.position.y = pose.forkArmHeight;
}

function applyInitialRadian(target: THREE.Object3D | null | undefined, radian: number | undefined) {
  if (!target || typeof radian !== 'number') return;
  if (Math.abs(target.rotation.y) < 0.0001) {
    target.rotation.y = radian;
  }
}

const WarehouseMap = observer(() => {
  const mxwCarRef = useRef<THREE.Group>(null);
  const fourWayCarRef = useRef<THREE.Group>(null);
  const forkTruckRef = useRef<ForkTruckRef>(null);
  const forkTruck2Ref = useRef<ForkTruckRef>(null);
  const conveyerGoodsRef = useRef<THREE.Group>(null);
  const stepIndexRef = useRef(0);
  const stepElapsedRef = useRef(0);
  const cargoStateRef = useRef<CargoState>(initialCargoState);
  const groundStateRef = useRef<GroundState>(initialGroundState);
  const a3SlotPosRef = useRef<number[]>([...A3_SLOT]);
  const sampleVec = useRef(new THREE.Vector3());
  const [cargoState, setCargoState] = useState<CargoState>(initialCargoState);
  const [groundState, setGroundState] = useState<GroundState>(initialGroundState);
  const [a3SlotPos, setA3SlotPos] = useState<number[]>([...A3_SLOT]);

  function commitCargoState(nextState: CargoState) {
    const current = cargoStateRef.current;
    const changed = (Object.keys(nextState) as AnimatedElement[]).some(
      (key) => current[key] !== nextState[key]
    );
    if (!changed) return;
    cargoStateRef.current = nextState;
    setCargoState(nextState);
  }

  function commitGroundState(nextState: GroundState) {
    const current = groundStateRef.current;
    const changed = (Object.keys(nextState) as GroundSpot[]).some(
      (key) => current[key] !== nextState[key]
    );
    if (!changed) return;
    groundStateRef.current = nextState;
    setGroundState(nextState);
  }

  /** Fork goods sit at local [0,2,-77] on forkArm — sample world pos so ground drop matches. */
  function sampleFork1GoodsWorld(): number[] | null {
    const forkArm = forkTruckRef.current?.forkArm;
    if (!forkArm) return null;
    forkArm.updateWorldMatrix(true, false);
    sampleVec.current.set(0, 2, -77).applyMatrix4(forkArm.matrixWorld);
    return sampleVec.current.toArray();
  }

  function syncCargoState(list: any[]) {
    const nextCargo = { ...cargoStateRef.current };
    const nextGround = { ...groundStateRef.current };
    list.forEach((item) => {
      if (typeof item.hasGoods === 'boolean' && item.el in nextCargo) {
        nextCargo[item.el as AnimatedElement] = item.hasGoods;
      }
      if (item.ground) {
        Object.assign(nextGround, item.ground);
      }
    });
    // Capture cargo world position at the moment it leaves the fork onto A3.
    if (nextGround.a3Slot && !groundStateRef.current.a3Slot) {
      const worldPos = sampleFork1GoodsWorld();
      if (worldPos) {
        a3SlotPosRef.current = worldPos;
        setA3SlotPos(worldPos);
      }
    }
    commitCargoState(nextCargo);
    commitGroundState(nextGround);
  }

  function resetAnimation() {
    setPosition(mxwCarRef.current, initialPose.mxwCar.position);
    if (mxwCarRef.current) mxwCarRef.current.rotation.y = initialPose.mxwCar.radian;
    setPosition(fourWayCarRef.current, initialPose.fourWayCar.position);
    setForkTruckPose(forkTruckRef.current, initialPose.forkTruckCar);
    setForkTruckPose(forkTruck2Ref.current, initialPose.forkTruckCar2);
    setPosition(conveyerGoodsRef.current, initialPose.conveyerBelt.goodsPosition);
    commitCargoState(initialCargoState);
    commitGroundState(initialGroundState);
    a3SlotPosRef.current = [...A3_SLOT];
    setA3SlotPos([...A3_SLOT]);
  }

  function applyAnimation(item: any, progress: number) {
    const target =
      item.el === 'mxwCar'
        ? mxwCarRef.current
        : item.el === 'forWayCar'
        ? fourWayCarRef.current
        : undefined;
    const forkTarget =
      item.el === 'forkTruckCar'
        ? forkTruckRef.current
        : item.el === 'forkTruckCar2'
        ? forkTruck2Ref.current
        : undefined;

    if (item.type === 'move') {
      if (item.el === 'conveyerBelt') {
        lerpPosition(conveyerGoodsRef.current, item.from, item.to, progress);
      } else if (forkTarget) {
        lerpPosition(forkTarget.root, item.from, item.to, progress);
        applyInitialRadian(forkTarget.root, item.radian);
      } else if (target) {
        lerpPosition(target, item.from, item.to, progress);
        applyInitialRadian(target, item.radian);
      }
      return;
    }

    if (item.type === 'rotate') {
      const rotation = item.radian + item.varyRadian * progress;
      if (forkTarget?.root) forkTarget.root.rotation.y = rotation;
      if (target) target.rotation.y = rotation;
      return;
    }

    if (item.type === 'liftArm' && forkTarget?.liftArm) {
      forkTarget.liftArm.position.y = lerp(item.formLiftH, item.toLiftH, progress);
      applyInitialRadian(forkTarget.root, item.radian);
      return;
    }

    if (item.type === 'forkArm' && forkTarget?.forkArm) {
      forkTarget.forkArm.position.y = lerp(item.formForkH, item.toForkH, progress);
      applyInitialRadian(forkTarget.root, item.radian);
    }
  }

  useFrame((_, delta) => {
    let elapsed = stepElapsedRef.current + delta * 1000;
    let stepIndex = stepIndexRef.current;
    let step = animationData[stepIndex];

    while (step && elapsed >= step[0].time) {
      step.forEach((item) => applyAnimation(item, 1));
      syncCargoState(step);
      elapsed -= step[0].time;
      stepIndex++;

      if (stepIndex >= animationData.length) {
        stepIndex = 0;
        elapsed = 0;
        resetAnimation();
      }

      step = animationData[stepIndex];
    }

    if (step) {
      const progress = Math.min(elapsed / step[0].time, 1);
      step.forEach((item) => applyAnimation(item, progress));
      syncCargoState(step);
    }

    stepIndexRef.current = stepIndex;
    stepElapsedRef.current = elapsed;
  });

  const goodsEl = useMemo(
    () =>
      goodsData
        .filter(
          (item) => !MANAGED_STATIC_GOODS.some((managed) => samePos(item as number[], managed))
        )
        .map((item, index) => <Goods groupProps={{ position: item }} key={index}></Goods>),
    []
  );
  const stereoscopicShelfEl = useMemo(() => {
    return (
      <>
        {stereoscopicShelfData.shelf.map((item, index) => (
          <StereoscopicShelf
            key={index}
            layout={item.layout}
            groupProps={{ position: new Vector3(...item.position) }}
          ></StereoscopicShelf>
        ))}
        {stereoscopicShelfData.track.map((item, index) => (
          <StereoscopicTrack
            key={index}
            layout={item.layout}
            groupProps={{ position: new Vector3(...item.position) }}
          ></StereoscopicTrack>
        ))}
        {stereoscopicShelfData.lifter.map((item, index) => (
          <Lifter
            layout={item.layout}
            groupProps={{ position: new Vector3(...item.position) }}
            key={index}
          ></Lifter>
        ))}
      </>
    );
  }, []);
  const shelfEl = useMemo(
    () =>
      shelfData.map((item, index) => (
        <Shelf layout={item.layout} groupProps={{ position: item.position }} key={index}></Shelf>
      )),
    []
  );
  const tunnelEl = useMemo(
    () => tunnelData.map((tunnel, index) => <Tunnel key={index} {...tunnel} />),
    []
  );
  const areaEl = useMemo(() => areaData.map((area, index) => <Area key={index} {...area} />), []);

  return (
    <group>
      {goodsEl}
      {stereoscopicShelfEl}
      {shelfEl}
      <MxwCar
        ref={mxwCarRef}
        position={initialPose.mxwCar.position}
        radian={initialPose.mxwCar.radian}
        hasGoods={cargoState.mxwCar}
        label="麦小微"
      />
      <ForkTruck
        ref={forkTruckRef}
        position={initialPose.forkTruckCar.position}
        radian={initialPose.forkTruckCar.radian}
        liftArmHeight={initialPose.forkTruckCar.liftArmHeight}
        forkArmHeight={initialPose.forkTruckCar.forkArmHeight}
        hasGoods={cargoState.forkTruckCar}
        label="叉车1"
      />
      <FourWayCar
        ref={fourWayCarRef}
        position={initialPose.fourWayCar.position}
        hasGoods={cargoState.forWayCar}
        label="四向车"
      />
      {groundState.a2Source && <Goods groupProps={{ position: [...A2_PICKUP_GOODS] }} />}
      {groundState.a3Slot && <Goods groupProps={{ position: a3SlotPos }} />}
      {groundState.a1Drop && <Goods groupProps={{ position: [...A1_DROP] }} />}
      {groundState.a1Pick && <Goods groupProps={{ position: [...A1_PICK] }} />}
      {groundState.a4Drop && <Goods groupProps={{ position: [...A4_DROP] }} />}
      {tunnelEl}
      {areaEl}
      <ConveyerBelt
        ref={conveyerGoodsRef}
        position={[-300, 0, 495]}
        goodsPosition={initialPose.conveyerBelt.goodsPosition}
        hasGoods={cargoState.conveyerBelt}
      />
      <ForkTruck
        ref={forkTruck2Ref}
        position={initialPose.forkTruckCar2.position}
        radian={initialPose.forkTruckCar2.radian}
        liftArmHeight={initialPose.forkTruckCar2.liftArmHeight}
        forkArmHeight={initialPose.forkTruckCar2.forkArmHeight}
        hasGoods={cargoState.forkTruckCar2}
        label="叉车2"
      />
    </group>
  );
});

export default WarehouseMap;
