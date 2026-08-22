import {
  A1_DROP_CAR,
  A1_PICK_CAR,
  A2_PICKUP_APPROACH,
  A3_FORK_STOP,
  A3_MXW_STOP,
  A3_SLOT,
  A4_DROP,
  BELT_LEFT_FORK_STOP,
  BELT_LEFT_LOCAL,
  BELT_LEFT_WORLD,
  BELT_LIFTER_LOCAL,
  BELT_RIGHT_LOCAL,
  BELT_RIGHT_WORLD,
} from './waypoints';

/**
 * Vehicle loop:
 * fork1 A2→A3 → mxw A3→belt right → belt→lifter → fourWay A1 drop + adjacent pick
 * → belt left → fork2 → A4
 *
 * Optional `ground` on a step syncs staged cargo spots in WarehouseMap.
 */
export default [
  // ─── 叉车1：原取货路径（A2）───────────────────────────────────────────
  [
    {
      el: 'forkTruckCar',
      type: 'move',
      from: [460, 0, 700],
      to: [460, 0, -722],
      radian: Math.PI,
      hasGoods: false,
      ground: { a2Source: true, a3Slot: false, a1Drop: false, a1Pick: true, a4Drop: false },
      time: 4000,
    },
  ],
  [
    {
      el: 'forkTruckCar',
      type: 'rotate',
      radian: Math.PI,
      varyRadian: Math.PI / 2,
      hasGoods: false,
      time: 2000,
    },
  ],
  [
    {
      el: 'forkTruckCar',
      type: 'liftArm',
      formLiftH: 0,
      toLiftH: 90,
      radian: Math.PI,
      hasGoods: false,
      time: 2000,
    },
  ],
  [
    {
      el: 'forkTruckCar',
      type: 'liftArm',
      formLiftH: 90,
      toLiftH: 90,
      radian: Math.PI,
      hasGoods: false,
      time: 500,
    },
  ],
  [
    {
      el: 'forkTruckCar',
      type: 'forkArm',
      formForkH: 0,
      toForkH: 54,
      radian: Math.PI,
      hasGoods: false,
      time: 2000,
    },
  ],
  [
    {
      el: 'forkTruckCar',
      type: 'forkArm',
      formForkH: 54,
      toForkH: 54,
      radian: Math.PI,
      hasGoods: false,
      time: 500,
    },
  ],
  [
    {
      el: 'forkTruckCar',
      type: 'move',
      from: [460, 0, -722],
      to: [...A2_PICKUP_APPROACH],
      radian: Math.PI,
      hasGoods: false,
      time: 1000,
    },
  ],
  [
    {
      el: 'forkTruckCar',
      type: 'move',
      from: [...A2_PICKUP_APPROACH],
      to: [...A2_PICKUP_APPROACH],
      radian: Math.PI,
      hasGoods: true,
      ground: { a2Source: false },
      time: 500,
    },
  ],
  [
    {
      el: 'forkTruckCar',
      type: 'move',
      from: [...A2_PICKUP_APPROACH],
      to: [460, 0, -722],
      radian: Math.PI,
      hasGoods: true,
      time: 1000,
    },
  ],
  [
    {
      el: 'forkTruckCar',
      type: 'liftArm',
      formLiftH: 90,
      toLiftH: 0,
      radian: Math.PI,
      hasGoods: true,
      time: 2000,
    },
  ],
  [
    {
      el: 'forkTruckCar',
      type: 'forkArm',
      formForkH: 54,
      toForkH: 0,
      radian: Math.PI,
      hasGoods: true,
      time: 2000,
    },
  ],
  [
    {
      el: 'forkTruckCar',
      type: 'rotate',
      radian: Math.PI,
      varyRadian: -Math.PI,
      hasGoods: true,
      time: 2000,
    },
  ],
  // 运到 A3 落点
  [
    {
      el: 'forkTruckCar',
      type: 'move',
      from: [460, 0, -722],
      to: [460, 0, A3_SLOT[2]],
      radian: 0,
      hasGoods: true,
      time: 4000,
    },
  ],
  [
    {
      el: 'forkTruckCar',
      type: 'rotate',
      radian: 0,
      varyRadian: -Math.PI / 2,
      hasGoods: true,
      time: 1500,
    },
  ],
  [
    {
      el: 'forkTruckCar',
      type: 'move',
      from: [460, 0, A3_SLOT[2]],
      to: [...A3_FORK_STOP],
      radian: -Math.PI / 2,
      hasGoods: true,
      time: 1500,
    },
  ],
  [
    {
      el: 'forkTruckCar',
      type: 'move',
      from: [...A3_FORK_STOP],
      to: [...A3_FORK_STOP],
      radian: -Math.PI / 2,
      hasGoods: false,
      ground: { a3Slot: true },
      time: 500,
    },
  ],
  [
    {
      el: 'forkTruckCar',
      type: 'move',
      from: [...A3_FORK_STOP],
      to: [460, 0, A3_SLOT[2]],
      radian: -Math.PI / 2,
      hasGoods: false,
      time: 1500,
    },
  ],
  [
    {
      el: 'forkTruckCar',
      type: 'rotate',
      radian: -Math.PI / 2,
      varyRadian: Math.PI / 2,
      hasGoods: false,
      time: 1500,
    },
  ],
  [
    {
      el: 'forkTruckCar',
      type: 'move',
      from: [460, 0, A3_SLOT[2]],
      to: [460, 0, 700],
      radian: 0,
      hasGoods: false,
      time: 3000,
    },
  ],

  // ─── 麦小微：A3 → 传送带右侧 ───────────────────────────────────────────
  [
    {
      el: 'mxwCar',
      type: 'move',
      from: [400, 0, 700],
      to: [400, 0, A3_SLOT[2]],
      radian: Math.PI,
      hasGoods: false,
      time: 3000,
    },
  ],
  [
    {
      el: 'mxwCar',
      type: 'rotate',
      radian: Math.PI,
      varyRadian: Math.PI / 2,
      hasGoods: false,
      time: 1500,
    },
  ],
  [
    {
      el: 'mxwCar',
      type: 'move',
      from: [400, 0, A3_SLOT[2]],
      to: [...A3_MXW_STOP],
      radian: -Math.PI / 2,
      hasGoods: false,
      time: 1500,
    },
  ],
  [
    {
      el: 'mxwCar',
      type: 'move',
      from: [...A3_MXW_STOP],
      to: [...A3_MXW_STOP],
      radian: -Math.PI / 2,
      hasGoods: true,
      ground: { a3Slot: false },
      time: 500,
    },
  ],
  [
    {
      el: 'mxwCar',
      type: 'move',
      from: [...A3_MXW_STOP],
      to: [400, 0, A3_SLOT[2]],
      radian: -Math.PI / 2,
      hasGoods: true,
      time: 1500,
    },
  ],
  [
    {
      el: 'mxwCar',
      type: 'rotate',
      radian: -Math.PI / 2,
      varyRadian: Math.PI / 2,
      hasGoods: true,
      time: 1500,
    },
  ],
  [
    {
      el: 'mxwCar',
      type: 'move',
      from: [400, 0, A3_SLOT[2]],
      to: [400, 0, BELT_RIGHT_WORLD[2]],
      radian: 0,
      hasGoods: true,
      time: 2500,
    },
  ],
  [
    {
      el: 'mxwCar',
      type: 'rotate',
      radian: 0,
      varyRadian: Math.PI / 2,
      hasGoods: true,
      time: 1500,
    },
  ],
  [
    {
      el: 'mxwCar',
      type: 'move',
      from: [400, 0, BELT_RIGHT_WORLD[2]],
      to: [...BELT_RIGHT_WORLD],
      radian: Math.PI / 2,
      hasGoods: true,
      time: 2000,
    },
  ],
  [
    {
      el: 'mxwCar',
      type: 'move',
      from: [...BELT_RIGHT_WORLD],
      to: [...BELT_RIGHT_WORLD],
      radian: Math.PI / 2,
      hasGoods: false,
      time: 500,
    },
    {
      el: 'conveyerBelt',
      type: 'move',
      from: [...BELT_RIGHT_LOCAL],
      to: [...BELT_RIGHT_LOCAL],
      hasGoods: true,
      time: 500,
    },
  ],
  [
    {
      el: 'mxwCar',
      type: 'move',
      from: [...BELT_RIGHT_WORLD],
      to: [400, 0, BELT_RIGHT_WORLD[2]],
      radian: Math.PI / 2,
      hasGoods: false,
      time: 1500,
    },
  ],
  [
    {
      el: 'mxwCar',
      type: 'rotate',
      radian: Math.PI / 2,
      varyRadian: -Math.PI / 2,
      hasGoods: false,
      time: 1500,
    },
  ],
  [
    {
      el: 'mxwCar',
      type: 'move',
      from: [400, 0, BELT_RIGHT_WORLD[2]],
      to: [400, 0, 700],
      radian: 0,
      hasGoods: false,
      time: 2500,
    },
  ],

  // ─── 传送带右 → 电梯对接；四向车入库放货 ───────────────────────────────
  [
    {
      el: 'conveyerBelt',
      type: 'move',
      from: [...BELT_RIGHT_LOCAL],
      to: [...BELT_LIFTER_LOCAL],
      hasGoods: true,
      time: 3000,
    },
  ],
  [
    {
      el: 'forWayCar',
      type: 'move',
      from: [-125, 23, 32],
      to: [-125, 23, 415],
      hasGoods: false,
      time: 2000,
    },
  ],
  [
    {
      el: 'forWayCar',
      type: 'move',
      from: [-125, 23, 415],
      to: [-125, 23, 415],
      hasGoods: true,
      time: 500,
    },
    {
      el: 'conveyerBelt',
      type: 'move',
      from: [...BELT_LIFTER_LOCAL],
      to: [...BELT_LIFTER_LOCAL],
      hasGoods: false,
      time: 500,
    },
  ],
  [
    {
      el: 'forWayCar',
      type: 'move',
      from: [-125, 23, 415],
      to: [-125, 314, 415],
      hasGoods: true,
      time: 4000,
    },
  ],
  [
    {
      el: 'forWayCar',
      type: 'move',
      from: [-125, 314, 415],
      to: [-125, 314, A1_DROP_CAR[2]],
      hasGoods: true,
      time: 2000,
    },
  ],
  [
    {
      el: 'forWayCar',
      type: 'move',
      from: [-125, 314, A1_DROP_CAR[2]],
      to: [...A1_DROP_CAR],
      hasGoods: true,
      time: 3000,
    },
  ],
  [
    {
      el: 'forWayCar',
      type: 'move',
      from: [...A1_DROP_CAR],
      to: [...A1_DROP_CAR],
      hasGoods: false,
      ground: { a1Drop: true },
      time: 500,
    },
  ],
  // 相邻货位取新箱
  [
    {
      el: 'forWayCar',
      type: 'move',
      from: [...A1_DROP_CAR],
      to: [...A1_PICK_CAR],
      hasGoods: false,
      time: 1500,
    },
  ],
  [
    {
      el: 'forWayCar',
      type: 'move',
      from: [...A1_PICK_CAR],
      to: [...A1_PICK_CAR],
      hasGoods: true,
      ground: { a1Pick: false },
      time: 500,
    },
  ],
  [
    {
      el: 'forWayCar',
      type: 'move',
      from: [...A1_PICK_CAR],
      to: [-125, 314, A1_PICK_CAR[2]],
      hasGoods: true,
      time: 3000,
    },
  ],
  [
    {
      el: 'forWayCar',
      type: 'move',
      from: [-125, 314, A1_PICK_CAR[2]],
      to: [-125, 314, 415],
      hasGoods: true,
      time: 2000,
    },
  ],
  [
    {
      el: 'forWayCar',
      type: 'move',
      from: [-125, 314, 415],
      to: [-125, 23, 415],
      hasGoods: true,
      time: 4000,
    },
  ],
  // 交接到传送带，滑向左侧
  [
    {
      el: 'forWayCar',
      type: 'move',
      from: [-125, 23, 415],
      to: [-125, 23, 415],
      hasGoods: false,
      time: 500,
    },
    {
      el: 'conveyerBelt',
      type: 'move',
      from: [...BELT_LIFTER_LOCAL],
      to: [...BELT_LIFTER_LOCAL],
      hasGoods: true,
      time: 500,
    },
  ],
  [
    {
      el: 'forWayCar',
      type: 'move',
      from: [-125, 23, 415],
      to: [-125, 23, 32],
      hasGoods: false,
      time: 3000,
    },
    {
      el: 'conveyerBelt',
      type: 'move',
      from: [...BELT_LIFTER_LOCAL],
      to: [...BELT_LEFT_LOCAL],
      hasGoods: true,
      time: 3000,
    },
  ],

  // ─── 叉车2：传送带左侧 → A4 ────────────────────────────────────────────
  // 先到货箱 -X 外侧，再朝 +X 进叉，避免停在货箱中心导致前叉穿模
  [
    {
      el: 'forkTruckCar2',
      type: 'move',
      from: [-780, 0, -300],
      to: [-900, 0, BELT_LEFT_WORLD[2]],
      radian: 0,
      hasGoods: false,
      time: 3000,
    },
    {
      el: 'conveyerBelt',
      type: 'move',
      from: [...BELT_LEFT_LOCAL],
      to: [...BELT_LEFT_LOCAL],
      hasGoods: true,
      time: 3000,
    },
  ],
  [
    {
      el: 'forkTruckCar2',
      type: 'rotate',
      radian: 0,
      varyRadian: -Math.PI / 2,
      hasGoods: false,
      time: 1500,
    },
  ],
  [
    {
      el: 'forkTruckCar2',
      type: 'liftArm',
      formLiftH: 0,
      toLiftH: 23,
      radian: -Math.PI / 2,
      hasGoods: false,
      time: 1500,
    },
  ],
  [
    {
      el: 'forkTruckCar2',
      type: 'move',
      radian: -Math.PI / 2,
      from: [-900, 0, BELT_LEFT_WORLD[2]],
      to: [...BELT_LEFT_FORK_STOP],
      hasGoods: false,
      time: 1500,
    },
  ],
  [
    {
      el: 'forkTruckCar2',
      type: 'move',
      radian: -Math.PI / 2,
      from: [...BELT_LEFT_FORK_STOP],
      to: [...BELT_LEFT_FORK_STOP],
      hasGoods: true,
      time: 500,
    },
    {
      el: 'conveyerBelt',
      type: 'move',
      from: [...BELT_LEFT_LOCAL],
      to: [...BELT_LEFT_LOCAL],
      hasGoods: false,
      time: 500,
    },
  ],
  // 取货后原地降叉，不再往前开
  [
    {
      el: 'forkTruckCar2',
      type: 'liftArm',
      formLiftH: 23,
      toLiftH: 0,
      radian: -Math.PI / 2,
      hasGoods: true,
      time: 1500,
    },
  ],
  [
    {
      el: 'forkTruckCar2',
      type: 'rotate',
      radian: -Math.PI / 2,
      varyRadian: -Math.PI / 2,
      hasGoods: true,
      time: 1500,
    },
  ],
  [
    {
      el: 'forkTruckCar2',
      type: 'move',
      from: [...BELT_LEFT_FORK_STOP],
      to: [BELT_LEFT_FORK_STOP[0], 0, A4_DROP[2]],
      radian: Math.PI,
      hasGoods: true,
      time: 2500,
    },
  ],
  [
    {
      el: 'forkTruckCar2',
      type: 'rotate',
      radian: Math.PI,
      varyRadian: -Math.PI / 2,
      hasGoods: true,
      time: 1500,
    },
  ],
  [
    {
      el: 'forkTruckCar2',
      type: 'move',
      from: [BELT_LEFT_FORK_STOP[0], 0, A4_DROP[2]],
      to: [...A4_DROP],
      radian: Math.PI / 2,
      hasGoods: true,
      time: 3000,
    },
  ],
  [
    {
      el: 'forkTruckCar2',
      type: 'move',
      from: [...A4_DROP],
      to: [...A4_DROP],
      radian: Math.PI / 2,
      hasGoods: false,
      ground: { a4Drop: true },
      time: 500,
    },
  ],
  [
    {
      el: 'forkTruckCar2',
      type: 'move',
      from: [...A4_DROP],
      to: [BELT_LEFT_FORK_STOP[0], 0, A4_DROP[2]],
      radian: Math.PI / 2,
      hasGoods: false,
      time: 2500,
    },
  ],
  [
    {
      el: 'forkTruckCar2',
      type: 'rotate',
      radian: Math.PI / 2,
      varyRadian: Math.PI / 2,
      hasGoods: false,
      time: 1500,
    },
  ],
  [
    {
      el: 'forkTruckCar2',
      type: 'move',
      from: [BELT_LEFT_FORK_STOP[0], 0, A4_DROP[2]],
      to: [-780, 0, -300],
      radian: Math.PI,
      hasGoods: false,
      time: 2000,
    },
  ],
];
