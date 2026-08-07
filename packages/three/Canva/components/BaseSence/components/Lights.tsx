// Atmosphere-driven lighting for the twin scene
import React from 'react';
import { SkyLight, SunLight } from '@takram/three-atmosphere/r3f';

/**
 * Very soft fill only — just enough to avoid a black first frame while
 * atmosphere LUTs load. SunLight/SkyLight take over once ready.
 */
const Lights = () => {
  return (
    <>
      <ambientLight intensity={0.12} />
      <SunLight />
      <SkyLight />
    </>
  );
};

export default Lights;
