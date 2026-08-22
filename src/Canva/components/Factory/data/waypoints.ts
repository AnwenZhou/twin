/**
 * Shared world / local coordinates for the warehouse vehicle loop.
 * Conveyor local handoffs come from GTX.FBX bbox (longest=X, shortest=Y height).
 */

export const CONVEYOR_WORLD = [-300, 0, 495] as const;

/** Local to ConveyerBelt group — belt top ends on longest axis */
export const BELT_RIGHT_LOCAL = [472, 25, 0] as const;
export const BELT_LEFT_LOCAL = [-472, 25, 0] as const;
/** Align with lifter world x=-124 → local x = 176 */
export const BELT_LIFTER_LOCAL = [176, 25, 0] as const;

export const BELT_RIGHT_WORLD = [
  CONVEYOR_WORLD[0] + BELT_RIGHT_LOCAL[0],
  0,
  CONVEYOR_WORLD[2],
] as const; // [172, 0, 495]

export const BELT_LEFT_WORLD = [
  CONVEYOR_WORLD[0] + BELT_LEFT_LOCAL[0],
  0,
  CONVEYOR_WORLD[2],
] as const; // [-772, 0, 495]

/** 叉车货箱相对车体本地偏移（forkArm 上） */
export const FORK_GOODS_LOCAL = [0, 2, -77] as const;
/** 朝向 -π/2 时，本地 -Z 映射为世界 +X，偏移长度为 77 */
export const FORK_GOODS_OFFSET_X = 77;

/**
 * 叉车2 传送带左侧取货停靠：车体在货箱 -X 侧，前叉对准货箱而非穿入。
 * 货箱世界 x=-772，朝向 -π/2 → 车停在 x = -772 - 77
 */
export const BELT_LEFT_FORK_STOP = [
  BELT_LEFT_WORLD[0] - FORK_GOODS_OFFSET_X,
  0,
  BELT_LEFT_WORLD[2],
] as const; // [-849, 0, 495]

/** A3 第一层第三行第一列 — 货箱落地世界坐标 (grid origin 600/100, step 60) */
export const A3_SLOT = [600, 0, 220] as const;

/**
 * 车辆停靠点：使车上货箱本地偏移旋转后与 A3_SLOT 重合（朝向 -π/2）。
 * 叉车货箱本地 [0,2,-77] → 世界偏移 (+77, 2, 0)
 * 麦小微货箱本地 [0,0,-10] → 世界偏移 (+10, 0, 0)
 */
export const A3_FORK_STOP = [A3_SLOT[0] - FORK_GOODS_OFFSET_X, 0, A3_SLOT[2]] as const; // [523, 0, 220]
export const A3_MXW_STOP = [A3_SLOT[0] - 10, 0, A3_SLOT[2]] as const; // [590, 0, 220]

/** A2 original fork-1 pickup goods / approach (unchanged) */
export const A2_PICKUP_GOODS = [600, 146, -722] as const;
export const A2_PICKUP_APPROACH = [500, 0, -722] as const;

/** A1 第五层第一列第八行 / 相邻第九行 */
export const A1_DROP = [-445.5, 312, 93] as const;
export const A1_PICK = [-445.5, 312, 156] as const;
export const A1_DROP_CAR = [-445.5, 314, 93] as const;
export const A1_PICK_CAR = [-445.5, 314, 156] as const;

/** A4：A1 左侧相隔 10m（按 cm 场景单位 = 1000），落点 */
export const A4_DROP = [-1550, 0, -150] as const;

export const MANAGED_STATIC_GOODS = [A1_DROP, A1_PICK] as const;
