import type { JSX } from "react";

export const Lighting = (): JSX.Element => (
  <>
    <ambientLight intensity={0.65} />
    <directionalLight
      castShadow
      intensity={1.25}
      position={[10, 16, 8]}
      shadow-mapSize-height={1024}
      shadow-mapSize-width={1024}
    />
  </>
);
