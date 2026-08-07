import * as THREE from 'three';
import { ThreeElements } from '@react-three/fiber';
import { Fragment, useEffect, useMemo } from 'react';
import { shelfBottomHeight, locationSize, shelfRackDiameter } from './stereoscopicShelf';
interface IStereoscopicTrack {
  layout: {
    col: number;
    layer: number;
  };
  groupProps?: ThreeElements['group'];
}
const trackDiameter = 4;
function StereoscopicTrack(props: IStereoscopicTrack) {
  const {
    layout: { col, layer },
    groupProps,
  } = props;
  const lenZ = useMemo(() => col * locationSize.z + (col + 1) * shelfRackDiameter, [col]);
  const trackColGeometry = useMemo(
    () => new THREE.BoxGeometry(trackDiameter, trackDiameter, lenZ),
    [col]
  );
  const trackRowGeometry = useMemo(
    () => new THREE.BoxGeometry(locationSize.x, trackDiameter, trackDiameter),
    []
  );
  const material = useMemo(() => new THREE.MeshPhongMaterial({ color: 'orange' }), []);

  useEffect(() => () => {
    trackColGeometry.dispose();
    trackRowGeometry.dispose();
    material.dispose();
  });

  return (
    <group {...groupProps}>
      {new Array(layer).fill(1).map((_, index) => {
        const posY = shelfBottomHeight + (locationSize.y + shelfRackDiameter) * index;
        return (
          <Fragment key={`col-track-${index}`}>
            <mesh
              geometry={trackColGeometry}
              material={material}
              position={[-locationSize.x / 2 - trackDiameter / 2, posY, 0]}
            ></mesh>
            <mesh
              geometry={trackColGeometry}
              material={material}
              position={[locationSize.x / 2 + trackDiameter / 2, posY, 0]}
            ></mesh>
          </Fragment>
        );
      })}
      {new Array(layer).fill(1).map((_, layerIndex) =>
        new Array(col + 1).fill(1).map((_, colIndex) => {
          const posY = shelfBottomHeight + (locationSize.y + shelfRackDiameter) * layerIndex;
          const posZ =
            -lenZ / 2 + (locationSize.z + shelfRackDiameter) * colIndex + trackDiameter / 2;
          return (
            <mesh
              key={`row-track-${layerIndex}-${colIndex}`}
              geometry={trackRowGeometry}
              material={material}
              position={[0, posY, posZ]}
            ></mesh>
          );
        })
      )}
    </group>
  );
}
export default StereoscopicTrack;
