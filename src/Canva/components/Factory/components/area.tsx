import React, { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CameraControls } from '@react-three/drei';
import Text2 from './text';
import Annotation, { IAnnotationDataItem, IAnnotationRef } from './annotation';

export interface IAreaProps {
  x: number;
  y: number;
  width: number;
  height: number;
  areaNumber: string;
  strokeColor: string;
  textHeight?: number;
}

const Y = 1;
const FLOW_Y = 2.5;
const FLOW_THICKNESS = 6;
const FLOW_HEIGHT = 4;

/** One rectangle edge with a scrolling glow texture (reliable on sharp corners). */
function FlowEdge({
  start,
  end,
  color,
  phase = 0,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
  phase?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texRef = useRef<THREE.CanvasTexture | null>(null);

  const { length, position, quaternion } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(1, 0, 0),
      dir.clone().normalize()
    );
    return { length: len, position: mid, quaternion: quat };
  }, [start, end]);

  const map = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, '#000000');
    grad.addColorStop(0.3, color);
    grad.addColorStop(0.5, '#ffffff');
    grad.addColorStop(0.7, color);
    grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(Math.max(2, length / 180), 1);
    texture.offset.x = phase;
    texture.colorSpace = THREE.SRGBColorSpace;
    texRef.current = texture;
    return texture;
  }, [color, length, phase]);

  useFrame((_, delta) => {
    if (texRef.current) {
      texRef.current.offset.x -= delta * 0.45;
    }
  });

  return (
    <mesh ref={meshRef} position={position} quaternion={quaternion} renderOrder={20}>
      <boxGeometry args={[length, FLOW_HEIGHT, FLOW_THICKNESS]} />
      <meshBasicMaterial
        map={map}
        color="#ffffff"
        transparent
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/** Flowing light along the area rectangle perimeter (4 edges). */
function AreaFlowBorder({
  x,
  y,
  width,
  height,
  color,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}) {
  const edges = useMemo(() => {
    const cx = x + width / 2;
    const cz = y + height / 2;
    const hw = width / 2;
    const hh = height / 2;
    const c0 = new THREE.Vector3(cx - hw, FLOW_Y, cz - hh);
    const c1 = new THREE.Vector3(cx + hw, FLOW_Y, cz - hh);
    const c2 = new THREE.Vector3(cx + hw, FLOW_Y, cz + hh);
    const c3 = new THREE.Vector3(cx - hw, FLOW_Y, cz + hh);
    const perimeter = 2 * (width + height);
    return [
      { start: c0, end: c1, phase: 0 },
      { start: c1, end: c2, phase: width / perimeter },
      { start: c2, end: c3, phase: (width + height) / perimeter },
      { start: c3, end: c0, phase: (2 * width + height) / perimeter },
    ];
  }, [x, y, width, height]);

  return (
    <group>
      {edges.map((edge, i) => (
        <FlowEdge key={i} start={edge.start} end={edge.end} color={color} phase={edge.phase} />
      ))}
    </group>
  );
}

const Area: React.FC<IAreaProps> = ({
  x,
  y,
  width,
  height,
  areaNumber,
  textHeight,
  strokeColor,
}) => {
  const [hovered, setHover] = useState(false);
  const [clicked, setClicked] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const controls = useThree((state) => state.controls) as CameraControls | null;

  // 转换为x轴和z轴组成的坐标系中的位置
  const position: THREE.Vector3 = new THREE.Vector3(x + width / 2, Y, y + height / 2);
  const size: [number, number, number] = [width, 1, height];
  textHeight ||= Y + 50;

  // 相机移动到区域的位置
  const handleClick = () => {
    if (clicked) return;
    setClicked(true);
    const mesh = meshRef.current;
    if (!mesh || !controls || typeof controls.fitToBox !== 'function') return;

    const { x, y, z } = mesh.position;
    const box = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(x, (y + textHeight!) / 2, z),
      new THREE.Vector3(width, textHeight, height)
    );
    controls.fitToBox(box, true);

    annotationRef.current?.show();
  };

  // 相机移动回原来的位置
  const handleDoubleClick = () => {
    setClicked(false);
  };

  // 监听鼠标移入和移出事件，改变hover状态
  const handlePointerOver = () => setHover(true);
  const handlePointerOut = () => setHover(false);

  // 每帧更新边框的颜色和粗细
  useFrame(() => {
    const box = meshRef.current;
    if (box) {
      const color = hovered || clicked ? strokeColor : 'white';
      const thickness = clicked ? 0.5 : 0.2;
      const material = box.material as THREE.MeshBasicMaterial & { linewidth: number };
      material.color.set(color);
      material.linewidth = thickness;
    }
  });

  const annotationRef = useRef<IAnnotationRef>(null);
  const annotationData: IAnnotationDataItem[] = [
    {
      label: '长',
      value: width / 100 + '米',
    },
    {
      label: '宽',
      value: height / 100 + '米',
    },
  ];

  return (
    <group
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onDoubleClick={handleDoubleClick}
      onPointerMissed={() => setClicked(false)}
    >
      <mesh ref={meshRef} position={position}>
        <boxGeometry attach="geometry" args={size} />
        <lineSegments>
          <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(...size)]} />
          <lineBasicMaterial attach="material" color={strokeColor} linewidth={0.2} />
        </lineSegments>
        <meshBasicMaterial attach="material" color={strokeColor} transparent opacity={0.2} />
      </mesh>

      <AreaFlowBorder x={x} y={y} width={width} height={height} color={strokeColor} />

      {areaNumber && (
        <Text2
          position={new THREE.Vector3(position.x, textHeight, position.z)}
          text={areaNumber}
          scale={new THREE.Vector3(100, 100, 100)}
          fontSize={100}
        />
      )}
      <Annotation
        ref={annotationRef}
        title={areaNumber}
        position={position}
        data={annotationData}
      ></Annotation>
    </group>
  );
};

export default Area;
