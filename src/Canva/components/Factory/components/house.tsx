import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// import * as CSG from "@react-three/csg";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ThreeElements, useLoader, extend } from '@react-three/fiber';
import { Geometry, Base, Subtraction, Addition } from '@react-three/csg';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
// import myFont from '/static/STXingkai_Regular.json';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { createRoadMarkingTexture } from '../../../utils/pbrMaps';
import { staticUrl } from '../../../utils/staticUrl';
extend({ TextGeometry });

interface IHouse {
  // 墙的厚度
  wallThickness?: number;
  width?: number;
  length?: number;
  // aside 仓库周围的宽度，主要是算仓库地板的大小
  aside_width?: number;
  aside_length: number;
  height?: number;
  position?: THREE.Vector3;
  // 整个空间的大小
  space_width?: number;
  space_length?: number;
  // 门口的马路的宽度
  road_width?: number;
  // 草坪的宽度
  grass_width: number;
  // 下水管道的宽度
  cross_width: number;
}

type extraAry = {
  i?: number;
  setShape?: (shape: THREE.Shape, point: THREE.Vector2) => void;
};

const House = (props: IHouse) => {
  const {
    wallThickness = 2,
    width = 1800,
    length = 1600,
    aside_width = 130,
    aside_length = 130,
    position = new THREE.Vector3(200, 0, 0),
    space_width = 10000,
    space_length = 12000,
    road_width = 600,
    grass_width = 400,
    cross_width = 100,
  } = props;

  const getPointToShape = (points: THREE.Vector2[], extra?: extraAry[]) => {
    const shape = new THREE.Shape();
    const obj: Record<string, any> = {};
    extra?.forEach((item: any) => {
      obj[item.i] = item.setShape;
    });
    points.forEach((point, index) => {
      const { x, y } = point;
      if (!index) {
        shape.moveTo(x, y);
      }
      if (obj[index]) {
        obj[index](shape, point);
      } else {
        shape.lineTo(x, y);
      }
    });
    return shape;
  };

  const textureLoader = new THREE.TextureLoader();

  // Warehouse floor (existing Asphalt031 pack)
  const configureFloorMap = (tex: THREE.Texture, srgb = false) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(0.0005, 0.0005);
    if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };
  const floorTexture = configureFloorMap(
    textureLoader.load(staticUrl('static/floor/Asphalt031_1K-JPG_Color.jpg')),
    true
  );
  const floorRoughnessMap = configureFloorMap(
    textureLoader.load(staticUrl('static/floor/Asphalt031_1K-JPG_Roughness.jpg'))
  );
  const floorNormalMap = configureFloorMap(
    textureLoader.load(staticUrl('static/floor/Asphalt031_1K-JPG_NormalGL.jpg'))
  );
  const floorAoMap = configureFloorMap(
    textureLoader.load(staticUrl('static/floor/Asphalt031_1K-JPG_AmbientOcclusion.jpg'))
  );

  const configureMap = (
    path: string,
    repeat: [number, number],
    srgb = true,
    rotation?: number,
    wrapping: THREE.Wrapping = THREE.RepeatWrapping
  ) => {
    const tex = textureLoader.load(staticUrl(path));
    tex.wrapS = wrapping;
    tex.wrapT = wrapping;
    tex.repeat.set(repeat[0], repeat[1]);
    if (rotation) tex.rotation = rotation;
    if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  // Local project textures for road / grass / plaza
  const roadTexture = configureMap('static/road2.jpg', [5, 1]);
  const grassStripTexture = configureMap(
    'static/grass.jpg',
    [20, 1],
    true,
    undefined,
    THREE.MirroredRepeatWrapping
  );
  const plazaGrassTexture = configureMap(
    'static/grass.jpg',
    [0.0005, 0.0005],
    true,
    undefined,
    THREE.MirroredRepeatWrapping
  );
  const roadApronTexture = configureMap('static/road2.jpg', [0.01, 0.01]);

  const roadMarkingTexture = createRoadMarkingTexture([10, 1]);

  const crossTexture = configureMap('static/cross.png', [70, 1]);

  // 仓库底下的那一块地板，会比仓库略大
  const HouseFloor = () => {
    return (
      <extrudeGeometry
        args={[
          getPointToShape([
            // 下面的不要
            new THREE.Vector2(-width - aside_width, -length - aside_length),
            new THREE.Vector2(width + aside_width, -length - aside_length),
            new THREE.Vector2(width + aside_width, length + aside_length),
            new THREE.Vector2(-width - aside_width, length + aside_length),
          ]),
          { depth: wallThickness },
        ]}
      />
    );
  };

  // Road shapes must be CCW (viewed from +Z) so extrude caps face +Z → world +Y after -PI/2.
  // 前面的路，有招牌的那一面
  const FrontRoad = () => {
    return (
      <extrudeGeometry
        args={[
          getPointToShape([
            new THREE.Vector2(width + aside_width, -length - aside_length),
            new THREE.Vector2(-width - aside_width, -length - aside_length),
            new THREE.Vector2(-width - aside_width, -space_length),
            new THREE.Vector2(width + aside_width, -space_length),
          ]),
          { depth: wallThickness },
        ]}
      />
    );
  };
  //后面的路，招牌的那一边的反面
  const BackRoad = () => {
    return (
      <extrudeGeometry
        args={[
          getPointToShape([
            new THREE.Vector2(-width - aside_width, length + aside_length),
            new THREE.Vector2(width + aside_width, length + aside_length),
            new THREE.Vector2(width + aside_width, space_length),
            new THREE.Vector2(-width - aside_width, space_length),
          ]),
          { depth: wallThickness },
        ]}
      />
    );
  };

  // 右边的镂空的，就是没有墙的那一面
  const RightRoad = () => {
    return (
      <extrudeGeometry
        args={[
          getPointToShape([
            new THREE.Vector2(-width - aside_width, -length - aside_length),
            new THREE.Vector2(-space_width, -length - aside_length),
            new THREE.Vector2(-space_width, length + aside_length),
            new THREE.Vector2(-width - aside_width, length + aside_length),
          ]),
          { depth: wallThickness },
        ]}
      />
    );
  };

  const LeftRoad = () => {
    return (
      <extrudeGeometry
        args={[
          getPointToShape([
            new THREE.Vector2(width + aside_width, length + aside_length),
            new THREE.Vector2(width + aside_width, -length - aside_length),
            new THREE.Vector2(space_width, -length - aside_length),
            new THREE.Vector2(space_width, length + aside_length),
          ]),
          { depth: wallThickness },
        ]}
      />
    );
  };

  // envMapIntensity low: HDR Environment / SkyLight are unshadowed and otherwise wash out shadows
  const RoadMaterial = () => (
    <meshStandardMaterial map={roadTexture} roughness={0.9} metalness={0} envMapIntensity={0.08} />
  );

  const GrassMaterial = () => (
    <meshStandardMaterial
      map={grassStripTexture}
      // Lift grass.jpg vignette / dark seams a bit
      color="#d8f0a8"
      roughness={1}
      metalness={0}
      envMapIntensity={0.08}
    />
  );

  const SurfaceMaterial = () => (
    <meshStandardMaterial
      map={roadApronTexture}
      roughness={0.9}
      metalness={0}
      envMapIntensity={0.08}
    />
  );

  const PlazaGrassMaterial = () => (
    <meshStandardMaterial
      map={plazaGrassTexture}
      color="#d8f0a8"
      roughness={1}
      metalness={0}
      envMapIntensity={0.08}
    />
  );

  const CrossMaterial = () => (
    <meshStandardMaterial
      map={crossTexture}
      roughness={0.85}
      metalness={0.05}
      envMapIntensity={0.08}
    />
  );

  // Ground meshes: -PI/2 maps local +Z (extrude/plane normal) to world +Y.
  const GROUND_ROTATION: [number, number, number] = [-Math.PI / 2, 0, 0];
  // ExtrudeGeometry depth goes to +Y after -PI/2; shift so the top cap sits on y=0.
  const GROUND_Y = -wallThickness;
  // OutSideSurface boxes are 10 thick and centered → top face at y=5.
  const ROAD_TOP_Y = 5.1;

  const RoadMarkings = ({ length: stripLength }: { length: number }) => (
    <>
      {[road_width / 2, -road_width / 2].map((offsetZ) => (
        <mesh
          key={offsetZ}
          rotation={GROUND_ROTATION}
          position={[0, ROAD_TOP_Y, offsetZ]}
          renderOrder={2}
        >
          <planeGeometry args={[stripLength * 2, road_width * 0.9]} />
          <meshStandardMaterial
            map={roadMarkingTexture}
            transparent
            depthWrite={false}
            roughness={0.7}
            metalness={0}
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </mesh>
      ))}
    </>
  );

  const OutSideSurface = (props: any) => {
    return (
      <group rotation={[0, props.rotation, 0]}>
        {/* 沥青道路 */}
        <mesh rotation={GROUND_ROTATION} receiveShadow>
          <Geometry>
            <Base position={[0, road_width / 2, 0]}>
              <boxGeometry args={[props.length * 2, road_width, 10]} />
            </Base>
            <Addition position={[0, -road_width / 2, 0]}>
              <boxGeometry args={[props.length * 2, road_width, 10]} />
            </Addition>
            <Subtraction position={[0, 0, 0]}>
              <boxGeometry args={props.subArgs} />
            </Subtraction>
          </Geometry>
          <RoadMaterial />
        </mesh>
        <RoadMarkings length={props.length} />
        {/* 草地 */}
        <mesh rotation={GROUND_ROTATION} receiveShadow>
          <Geometry>
            <Base position={[0, road_width + grass_width / 2, 0]}>
              <boxGeometry args={[props.length * 2, grass_width, 10]} />
            </Base>
            <Addition position={[0, -(road_width + grass_width / 2), 0]}>
              <boxGeometry args={[props.length * 2, grass_width, 10]} />
            </Addition>
            <Subtraction position={[0, 0, 0]}>
              <boxGeometry args={props.subArgs} />
            </Subtraction>
          </Geometry>
          <GrassMaterial />
        </mesh>
        <mesh rotation={GROUND_ROTATION} receiveShadow>
          <Geometry>
            <Base position={[0, road_width + grass_width + cross_width / 2, 0]}>
              <boxGeometry args={[props.length * 2, cross_width, 10]} />
            </Base>
            <Addition position={[0, -(road_width + grass_width + cross_width / 2), 0]}>
              <boxGeometry args={[props.length * 2, cross_width, 10]} />
            </Addition>
            <Subtraction position={[0, 0, 0]}>
              <boxGeometry args={props.subArgs} />
            </Subtraction>
          </Geometry>
          <CrossMaterial />
        </mesh>
      </group>
    );
  };

  return (
    <group position={position} receiveShadow>
      {/* 草坪和场景 */}
      <mesh rotation={GROUND_ROTATION} position={[0, GROUND_Y, 0]} receiveShadow>
        {/* <mesh> */}
        <Geometry>
          <Base>
            <extrudeGeometry
              args={[
                getPointToShape([
                  new THREE.Vector2(-space_width, -space_length),
                  new THREE.Vector2(space_width, -space_length),
                  new THREE.Vector2(space_width, space_length),
                  new THREE.Vector2(-space_width, space_length),
                  new THREE.Vector2(-space_width, -space_length),
                ]),
                { depth: wallThickness },
              ]}
            />
          </Base>
          {/* 中间的镂空的 */}
          <Subtraction>
            <HouseFloor></HouseFloor>
          </Subtraction>
          {/* 正面的镂空的 */}
          <Subtraction>
            <FrontRoad></FrontRoad>
          </Subtraction>
          {/* 后边的镂空的,就是正面对面的那一面 */}
          <Subtraction>
            <BackRoad></BackRoad>
          </Subtraction>
          {/* 右面的镂空的，没有墙的那一面 */}
          <Subtraction>
            <RightRoad></RightRoad>
          </Subtraction>
          {/* 左边的镂空的,有个小门的那一边 */}
          <Subtraction>
            <LeftRoad></LeftRoad>
          </Subtraction>
        </Geometry>
        <PlazaGrassMaterial />
      </mesh>
      {/* <Text text="劢微机器人"></Text> */}
      {/* 地板 */}
      <mesh
        rotation={GROUND_ROTATION}
        position={[0, GROUND_Y, 0]}
        receiveShadow
        onUpdate={(mesh) => {
          const { uv } = mesh.geometry.attributes;
          if (uv && !mesh.geometry.attributes.uv2) {
            mesh.geometry.setAttribute('uv2', uv.clone());
          }
        }}
      >
        <HouseFloor></HouseFloor>
        <meshStandardMaterial
          map={floorTexture}
          roughnessMap={floorRoughnessMap}
          normalMap={floorNormalMap}
          aoMap={floorAoMap}
          aoMapIntensity={1}
          roughness={1}
          metalness={0}
          envMapIntensity={0.08}
        />
      </mesh>
      {/* 后面的路 */}
      <mesh
        rotation={GROUND_ROTATION}
        position={[0, GROUND_Y, 0]}
        receiveShadow
        onUpdate={(mesh) => {
          const { uv } = mesh.geometry.attributes;
          if (uv && !mesh.geometry.attributes.uv2) {
            mesh.geometry.setAttribute('uv2', uv.clone());
          }
        }}
      >
        <BackRoad></BackRoad>
        <SurfaceMaterial />
      </mesh>
      {/* 前面的路 */}
      <mesh
        rotation={GROUND_ROTATION}
        position={[0, GROUND_Y, 0]}
        receiveShadow
        onUpdate={(mesh) => {
          const { uv } = mesh.geometry.attributes;
          if (uv && !mesh.geometry.attributes.uv2) {
            mesh.geometry.setAttribute('uv2', uv.clone());
          }
        }}
      >
        <FrontRoad></FrontRoad>
        <SurfaceMaterial />
      </mesh>
      {/* 没有墙的那一面下面的路 */}
      <mesh
        rotation={GROUND_ROTATION}
        position={[0, GROUND_Y, 0]}
        receiveShadow
        onUpdate={(mesh) => {
          const { uv } = mesh.geometry.attributes;
          if (uv && !mesh.geometry.attributes.uv2) {
            mesh.geometry.setAttribute('uv2', uv.clone());
          }
        }}
      >
        <RightRoad></RightRoad>
        <SurfaceMaterial />
      </mesh>
      <mesh
        rotation={GROUND_ROTATION}
        position={[0, GROUND_Y, 0]}
        receiveShadow
        onUpdate={(mesh) => {
          const { uv } = mesh.geometry.attributes;
          if (uv && !mesh.geometry.attributes.uv2) {
            mesh.geometry.setAttribute('uv2', uv.clone());
          }
        }}
      >
        <LeftRoad></LeftRoad>
        <SurfaceMaterial />
      </mesh>

      {/* 两个轴的路面参数 */}
      <OutSideSurface
        rotation={0}
        length={space_width}
        subArgs={[width * 2 + aside_width * 2, length * 2 + aside_length * 2, 10]}
      ></OutSideSurface>
      <OutSideSurface
        rotation={Math.PI / 2}
        length={space_length}
        subArgs={[length * 2 + aside_length * 2, width * 2 + aside_width * 2, 10]}
      ></OutSideSurface>
    </group>
  );
};

export default House;
