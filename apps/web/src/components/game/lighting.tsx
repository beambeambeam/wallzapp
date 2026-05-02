import type { JSX } from "react";

import { STAGE_COLORS } from "./stage-theme";

export const Lighting = (): JSX.Element => (
  <>
    <ambientLight color="#ffffff" intensity={0.2} />
    <hemisphereLight args={[STAGE_COLORS.rimBlue, "#142033", 0.52]} position={[0, 18, 0]} />

    <directionalLight
      castShadow
      color="#fff4d8"
      intensity={1.35}
      position={[10, 17, 12]}
      shadow-bias={-0.0001}
      shadow-camera-bottom={-12}
      shadow-camera-far={42}
      shadow-camera-left={-14}
      shadow-camera-near={1}
      shadow-camera-right={14}
      shadow-camera-top={14}
      shadow-mapSize-height={2048}
      shadow-mapSize-width={2048}
      shadow-normalBias={0.02}
      shadow-radius={3}
    />

    <spotLight
      angle={0.48}
      castShadow
      color={STAGE_COLORS.rimBlue}
      decay={2}
      distance={120}
      intensity={110}
      penumbra={0.55}
      position={[-12, 13, 14]}
      shadow-bias={-0.0001}
      shadow-mapSize-height={1024}
      shadow-mapSize-width={1024}
      shadow-normalBias={0.02}
      target-position={[0, 3.8, -24]}
    />

    <spotLight
      angle={0.42}
      castShadow
      color={STAGE_COLORS.borderGlow}
      decay={2}
      distance={120}
      intensity={90}
      penumbra={0.5}
      position={[12, 12, 8]}
      shadow-bias={-0.0001}
      shadow-mapSize-height={1024}
      shadow-mapSize-width={1024}
      shadow-normalBias={0.02}
      target-position={[0, 4.8, -66]}
    />

    <pointLight
      color={STAGE_COLORS.rimBlue}
      decay={2}
      distance={40}
      intensity={55}
      position={[-14, 8, -18]}
    />
    <pointLight
      color={STAGE_COLORS.rimWarm}
      decay={2}
      distance={40}
      intensity={48}
      position={[14, 7, -10]}
    />
    <pointLight
      color={STAGE_COLORS.borderGlow}
      decay={2}
      distance={32}
      intensity={34}
      position={[0, 8, -72]}
    />
  </>
);
