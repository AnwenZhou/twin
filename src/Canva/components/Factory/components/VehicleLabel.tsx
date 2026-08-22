import { useMemo } from 'react';
import * as THREE from 'three';

interface VehicleLabelProps {
  text: string;
  /** Height above the vehicle root (local Y). */
  offsetY?: number;
  color?: string;
}

/**
 * Camera-facing 3D sprite label. Place as a child of the vehicle root group
 * so animation that mutates the group transform keeps the label in sync.
 */
function VehicleLabel({ text, offsetY = 90, color = '#00D1D1' }: VehicleLabelProps) {
  const material = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 120px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    ctx.lineWidth = 14;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);

    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return new THREE.SpriteMaterial({
      map,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
  }, [text, color]);

  return (
    <sprite
      material={material}
      position={[0, offsetY, 0]}
      scale={[200, 50, 1]}
      renderOrder={999}
    />
  );
}

export default VehicleLabel;
