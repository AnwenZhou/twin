import React, { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';
import { EffectComposer, SMAA, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import {
  AerialPerspective,
  Atmosphere,
  type AtmosphereApi,
} from '@takram/three-atmosphere/r3f';
import { CloudLayer, Clouds } from '@takram/three-clouds/r3f';
import { Ellipsoid, Geodetic, radians } from '@takram/three-geospatial';
import { staticUrl } from '../utils/staticUrl';

/** Shanghai reference frame for local factory scene */
const LONGITUDE = 121.47;
const LATITUDE = 31.23;
const ALTITUDE = 0;

/** Fixed daytime: 2024-06-21 12:00 Asia/Shanghai (UTC+8) */
const DAYTIME = new Date('2024-06-21T04:00:00.000Z');

const ATMOSPHERE_TEXTURES_URL = staticUrl('static/atmosphere');
const CLOUDS_BASE = staticUrl('static/clouds');

type AtmosphereEnvProps = {
  children?: React.ReactNode;
};

function VolumetricClouds() {
  return (
    <Clouds
      disableDefaultLayers
      qualityPreset="high"
      coverage={0.22}
      temporalUpscale
      shapeDetail={false}
      turbulence={false}
      lightShafts={false}
      localWeatherRepeat={[28, 28]}
      shapeRepeat={[0.0001, 0.0001, 0.0001]}
      // Non-zero velocity animates cloud drift (defaults are 0 = static)
      localWeatherVelocity={[0.01, 0.004]}
      shapeVelocity={[0.00003, 0, 0.000015]}
      localWeatherTexture={`${CLOUDS_BASE}/local_weather.png`}
      shapeTexture={`${CLOUDS_BASE}/shape.bin`}
      shapeDetailTexture={`${CLOUDS_BASE}/shape_detail.bin`}
      turbulenceTexture={`${CLOUDS_BASE}/turbulence.png`}
      stbnTexture={`${CLOUDS_BASE}/stbn.bin`}
    >
      <CloudLayer
        channel="r"
        altitude={6000}
        height={1200}
        densityScale={0.08}
        shapeDetailAmount={0}
        coverageFilterWidth={0.85}
      />
      <CloudLayer
        channel="g"
        altitude={9000}
        height={1800}
        densityScale={0.06}
        shapeDetailAmount={0}
        coverageFilterWidth={0.9}
      />
    </Clouds>
  );
}

/**
 * Geospatial atmosphere + volumetric clouds around the local twin scene.
 * Maps world origin to the configured lon/lat via worldToECEFMatrix.
 */
const AtmosphereEnv = ({ children }: AtmosphereEnvProps) => {
  const atmosphereRef = useRef<AtmosphereApi>(null);
  // Defer heavy cloud pass so sky/tone-mapping/scene can paint first.
  const [enableClouds, setEnableClouds] = useState(false);

  useLayoutEffect(() => {
    const api = atmosphereRef.current;
    if (!api) return;
    const position = new Vector3();
    new Geodetic(radians(LONGITUDE), radians(LATITUDE), ALTITUDE).toECEF(position);
    Ellipsoid.WGS84.getNorthUpEastFrame(position, api.worldToECEFMatrix);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setEnableClouds(true), 300);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Atmosphere ref={atmosphereRef} textures={ATMOSPHERE_TEXTURES_URL} date={DAYTIME}>
      {children}
      {/* multisampling can break shadow maps on some GPUs; SMAA handles AA */}
      <EffectComposer enableNormalPass multisampling={0}>
        {enableClouds ? (
          <Suspense fallback={null}>
            <VolumetricClouds />
          </Suspense>
        ) : null}
        <AerialPerspective sky />
        {/* EffectComposer forces gl.toneMapping=NoToneMapping; ACES runs here */}
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} exposure={1.0} />
        <SMAA />
      </EffectComposer>
    </Atmosphere>
  );
};

export default AtmosphereEnv;
