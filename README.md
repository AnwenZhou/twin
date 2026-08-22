<div align="center">
<img src="logo.png" width="200px" alt="logo"/>
<h1>工业数字孪生 · 智能仓储 3D</h1>
</div>

## 项目简介

本仓库是一个面向**工业数字孪生**场景的 Web 3D 示例：用浏览器还原智能仓储产线的空间布局、设备形态与物流搬运过程，便于理解「数据驱动场景」在数字孪生中的落地方式。

当前为**单包 Vite 应用**，核心能力包括：

- 厂区 / 库区 3D 场景搭建（建筑、地面、灯光、大气环境）
- 货架、立库、输送线、电子围栏等工业资产建模与排布
- 叉车、四向车、AGV 等载具轨迹与货物搬运动画
- 基于 TS 数据源的场景编排（布局点位、动画关键时）

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite 6 + pnpm |
| 3D | Three.js + React Three Fiber + Drei |
| 渲染增强 | Postprocessing、大气 / 云层（@takram/*） |
| 状态 | MobX |

## 项目架构

```
twin/
├── index.html              # 应用入口 HTML
├── vite.config.ts          # 开发 / 构建配置
├── public/static/          # 模型、贴图、HDR、大气 LUT 等静态资源
└── src/
    ├── main.tsx            # React 挂载
    ├── app.tsx             # 页面壳，挂载 Canvas
    ├── threejs.ts          # 场景能力对外导出
    └── Canva/              # 工业孪生场景核心
        ├── index.tsx       # R3F Canvas + 场景装配
        ├── store.tsx       # MobX 场景状态
        ├── utils/          # 静态资源路径、PBR / 金属材质等
        └── components/
            ├── AtmosphereEnv.tsx   # 大气、色调映射、后处理
            ├── BaseSence/         # 相机、灯光、地面、建筑等基础层
            ├── Factory/           # 仓储业务层（设备、动画、数据）
            └── Help.tsx           # 调试辅助（Gizmo 等）
```

### 场景分层

```
App
 └─ Canva (R3F Canvas + ThreeStoreProvider)
     └─ AtmosphereEnv          # 天空大气 / ToneMapping / 后处理
         ├─ Environment       # HDR IBL，服务 PBR 金属反射
         ├─ BaseSence         # 相机、灯光、建筑、地面
         ├─ Factory           # 仓储孪生主体（异步加载）
         │    └─ WarehouseMap # 货架 / 立库 / 载具 / 动画编排
         └─ Gizmo             # 开发辅助
```

| 层级 | 职责 |
|------|------|
| **BaseSence** | 与业务弱相关的基础环境：相机控制、灯光、厂区建筑与地面 |
| **Factory** | 工业仓储业务：货架、立库轨道、升降机、输送带、叉车 / 四向车 / AGV、电子围栏、区域标注 |
| **Factory/data** | 布局与动画数据源（货位坐标、货架排布、关键时关键帧），用 TS/JSON 描述场景，便于对照理解数据结构 |
| **utils** | `staticUrl` 统一解析 `public/static` 资源；PBR / 金属材质复用 |

### 数据驱动思路

场景生成不依赖后端实时接口，主要靠 `src/Canva/components/Factory/data/` 下的静态数据描述：

- **空间布局**：货架行列、立库位置、区域边界、路径点（waypoints）
- **物流动画**：`animation.ts` 定义载具移动、旋转、货叉升降与货物状态切换的时间轴

适合作为工业数字孪生 POC：先把「空间 + 设备 + 流程」在前端跑通，再对接真实 WMS / 设备信号。

## 快速开始

环境要求：Node.js ≥ 18，推荐使用 pnpm。

```bash
git clone https://github.com/anyone-yuren/degital-twin-3d.git
cd degital-twin-3d
pnpm install
pnpm dev
```

本地默认地址：<http://localhost:9000>

```bash
pnpm build    # 产出目录 dist/
pnpm deploy   # 构建并用 wrangler pages deploy 发布

pnpm preview  # 预览生产构建
```

## License

MIT
