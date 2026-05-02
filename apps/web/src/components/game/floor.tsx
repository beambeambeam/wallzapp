import type { JSX } from "react";

import { STAGE_COLORS, STAGE_DIMENSIONS } from "./stage-theme";

export const Floor = (): JSX.Element => (
  <group>
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[STAGE_DIMENSIONS.offstageWidth, 140]} />
      <meshStandardMaterial color={STAGE_COLORS.floorOuter} roughness={0.92} metalness={0.04} />
    </mesh>

    <mesh receiveShadow position={[0, 0.12, -22]}>
      <boxGeometry args={[STAGE_DIMENSIONS.laneWidth, 0.24, STAGE_DIMENSIONS.laneLength]} />
      <meshStandardMaterial
        color={STAGE_COLORS.floorRunway}
        emissive="#0d2032"
        emissiveIntensity={0.2}
        metalness={0.36}
        roughness={0.24}
      />
    </mesh>

    <mesh receiveShadow position={[0, 0.24, -72]}>
      <boxGeometry args={[14.5, 0.46, STAGE_DIMENSIONS.platformDepth]} />
      <meshStandardMaterial color={STAGE_COLORS.floorPlatform} metalness={0.18} roughness={0.48} />
    </mesh>

    {[-1, 1].map((direction) => (
      <group key={`lane-border-${direction}`}>
        <mesh receiveShadow position={[direction * 5.2, 0.22, -22]}>
          <boxGeometry
            args={[STAGE_DIMENSIONS.runwayBorderWidth, 0.34, STAGE_DIMENSIONS.laneLength]}
          />
          <meshStandardMaterial color="#ffbe55" metalness={0.15} roughness={0.42} />
        </mesh>
        <mesh position={[direction * 4.55, 0.3, -22]}>
          <boxGeometry args={[0.16, 0.12, STAGE_DIMENSIONS.laneLength - 5]} />
          <meshStandardMaterial
            color={STAGE_COLORS.laneGlow}
            emissive={STAGE_COLORS.laneGlow}
            emissiveIntensity={1.25}
            metalness={0.02}
            roughness={0.22}
          />
        </mesh>
      </group>
    ))}

    <mesh position={[0, 0.11, 8]}>
      <boxGeometry args={[11.6, 0.06, 10]} />
      <meshStandardMaterial
        color="#2a3650"
        emissive={STAGE_COLORS.borderGlow}
        emissiveIntensity={0.25}
        roughness={0.55}
      />
    </mesh>
  </group>
);
