import type { JSX } from "react";

export const Floor = (): JSX.Element => (
  <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[220, 220]} />
    <meshStandardMaterial color="#c4b5fd" roughness={0.9} />
  </mesh>
);
