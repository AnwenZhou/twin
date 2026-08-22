import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** Match House defaults: position (200,0,0), width/length 1800/1600, aside 130 */
const HOUSE_POS_X = 200;
const HALF_W = 1800 + 130; // 1930
const HALF_L = 1600 + 130; // 1730
const FENCE_HEIGHT = 160;
const POST_SIZE = 8;
const POST_SPACING = 220;
const RAIL_THICK = 4;
const PANEL_THICK = 2;
const FENCE_COLOR = '#00e8ff';
const POST_COLOR = '#1a3040';

type Edge = {
  start: THREE.Vector3;
  end: THREE.Vector3;
  inward: THREE.Vector3;
};

function buildEdges(): Edge[] {
  const minX = HOUSE_POS_X - HALF_W;
  const maxX = HOUSE_POS_X + HALF_W;
  const minZ = -HALF_L;
  const maxZ = HALF_L;
  const y = 0;
  return [
    {
      start: new THREE.Vector3(minX, y, minZ),
      end: new THREE.Vector3(maxX, y, minZ),
      inward: new THREE.Vector3(0, 0, 1),
    },
    {
      start: new THREE.Vector3(maxX, y, minZ),
      end: new THREE.Vector3(maxX, y, maxZ),
      inward: new THREE.Vector3(-1, 0, 0),
    },
    {
      start: new THREE.Vector3(maxX, y, maxZ),
      end: new THREE.Vector3(minX, y, maxZ),
      inward: new THREE.Vector3(0, 0, -1),
    },
    {
      start: new THREE.Vector3(minX, y, maxZ),
      end: new THREE.Vector3(minX, y, minZ),
      inward: new THREE.Vector3(1, 0, 0),
    },
  ];
}

function FencePost({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, FENCE_HEIGHT / 2, 0]} castShadow>
        <boxGeometry args={[POST_SIZE, FENCE_HEIGHT, POST_SIZE]} />
        <meshStandardMaterial color={POST_COLOR} metalness={0.7} roughness={0.35} />
      </mesh>
      {/* beacon */}
      <mesh position={[0, FENCE_HEIGHT + 6, 0]}>
        <sphereGeometry args={[5, 12, 12]} />
        <meshBasicMaterial color={FENCE_COLOR} toneMapped={false} />
      </mesh>
    </group>
  );
}

function FencePanel({
  start,
  end,
  scanMap,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  scanMap: THREE.CanvasTexture;
}) {
  const { length, position, quaternion } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.y = FENCE_HEIGHT / 2;
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(1, 0, 0),
      dir.clone().normalize()
    );
    return { length: len, position: mid, quaternion: quat };
  }, [start, end]);

  return (
    <group position={position} quaternion={quaternion}>
      {/* translucent electronic wall */}
      <mesh renderOrder={5}>
        <boxGeometry args={[length - POST_SIZE, FENCE_HEIGHT * 0.92, PANEL_THICK]} />
        <meshBasicMaterial
          color={FENCE_COLOR}
          transparent
          opacity={0.12}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {/* scan lines */}
      <mesh renderOrder={6} position={[0, 0, PANEL_THICK * 0.6]}>
        <planeGeometry args={[length - POST_SIZE, FENCE_HEIGHT * 0.92]} />
        <meshBasicMaterial
          map={scanMap}
          transparent
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* top rail */}
      <mesh position={[0, FENCE_HEIGHT / 2 - RAIL_THICK, 0]}>
        <boxGeometry args={[length - POST_SIZE, RAIL_THICK, RAIL_THICK]} />
        <meshBasicMaterial color={FENCE_COLOR} toneMapped={false} />
      </mesh>
      {/* mid rail */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[length - POST_SIZE, RAIL_THICK * 0.6, RAIL_THICK * 0.6]} />
        <meshBasicMaterial color={FENCE_COLOR} transparent opacity={0.55} toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * Rectangular electronic fence around the warehouse floor footprint.
 */
export default function ElectronicFence() {
  const scanMap = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, 'rgba(0,232,255,0)');
    grad.addColorStop(0.45, 'rgba(0,232,255,0.15)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.95)');
    grad.addColorStop(0.55, 'rgba(0,232,255,0.15)');
    grad.addColorStop(1, 'rgba(0,232,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // horizontal grid lines
    ctx.strokeStyle = 'rgba(0,232,255,0.35)';
    ctx.lineWidth = 2;
    for (let y = 0; y < canvas.height; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 2);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useFrame((_, delta) => {
    scanMap.offset.y -= delta * 0.35;
  });

  const edges = useMemo(() => buildEdges(), []);

  const posts = useMemo(() => {
    const list: [number, number, number][] = [];
    edges.forEach((edge) => {
      const dir = new THREE.Vector3().subVectors(edge.end, edge.start);
      const len = dir.length();
      const n = Math.max(1, Math.round(len / POST_SPACING));
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const p = new THREE.Vector3().lerpVectors(edge.start, edge.end, t);
        list.push([p.x, 0, p.z]);
      }
    });
    // dedupe corners
    const key = (p: [number, number, number]) => `${p[0].toFixed(1)},${p[2].toFixed(1)}`;
    const seen = new Set<string>();
    return list.filter((p) => {
      const k = key(p);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [edges]);

  return (
    <group name="electronic-fence">
      {posts.map((p, i) => (
        <FencePost key={`post-${i}`} position={p} />
      ))}
      {edges.map((edge, i) => (
        <FencePanel key={`panel-${i}`} start={edge.start} end={edge.end} scanMap={scanMap} />
      ))}
    </group>
  );
}
