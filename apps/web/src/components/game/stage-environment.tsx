import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { JSX } from "react";
import { Color, Mesh as ThreeMesh } from "three";
import type { Group, Mesh, Object3D } from "three";

import type { Difficulty } from "@/types/game";

import { StageScreen } from "./stage-screen";
import { STAGE_COLORS, STAGE_DIMENSIONS } from "./stage-theme";

interface StageEnvironmentProps {
  difficulty: Difficulty;
  tierIndex?: number;
}

const hasEmissiveIntensity = (
  child: Object3D,
): child is Mesh & {
  material: {
    emissive: Color;
    emissiveIntensity: number;
  };
} => {
  if (!(child instanceof ThreeMesh)) {
    return false;
  }

  const { material } = child;

  return (
    !Array.isArray(material) &&
    typeof material === "object" &&
    material !== null &&
    "emissiveIntensity" in material
  );
};

// Per-tier panel animation params: [pulse speed multiplier, base emissive intensity, extra emissive range]
const PANEL_TIER_PARAMS: [number, number, number][] = [
  [1.8, 0.35, 0.15], // tier 0 — default
  [2.8, 0.55, 0.28], // tier 1 — brighter, faster
  [4.5, 0.80, 0.42], // tier 2 — frantic
  [7.0, 1.10, 0.60], // tier 3 — strobing
];

// Backdrop glow colors per tier
const BACKDROP_GLOW_COLORS = [
  STAGE_COLORS.backdropGlow, // "#1ec8ff" cyan
  "#40d0ff",                 // brighter cyan
  "#ff8c1a",                 // orange
  "#ff2020",                 // red
];

interface SidePanelWallProps {
  side: "left" | "right";
  tierIndex: number;
}

const SidePanelWall = ({ side, tierIndex }: SidePanelWallProps): JSX.Element => {
  const groupRef = useRef<Group>(null);
  const x = side === "left" ? -16.2 : 16.2;
  const direction = side === "left" ? 1 : -1;
  const clampedTier = Math.min(tierIndex, PANEL_TIER_PARAMS.length - 1);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;

    const elapsed = clock.getElapsedTime();
    const [speed, base, range] = PANEL_TIER_PARAMS[clampedTier];

    for (const [index, child] of group.children.entries()) {
      if (!hasEmissiveIntensity(child)) continue;

      // At tier 3, some panels get a red shift
      if (clampedTier >= 3) {
        const isStrobe = index % 2 === 0;
        child.material.emissive.set(isStrobe ? "#ff2020" : STAGE_COLORS.panelBlue);
      } else if (clampedTier === 2) {
        child.material.emissive.set(
          (index + Math.floor(elapsed * 2)) % 3 === 0 ? "#ff6600" : STAGE_COLORS.panelBlue,
        );
      }

      child.material.emissiveIntensity =
        base + (index % 3) * 0.12 + Math.sin(elapsed * speed + index * 0.4) * range;
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: STAGE_DIMENSIONS.panelColumns }, (_columnValue, column) =>
        Array.from({ length: STAGE_DIMENSIONS.panelRows }, (_rowValue, row) => {
          const isGold = (column + row) % 3 === 0;
          const color = isGold ? STAGE_COLORS.panelGold : STAGE_COLORS.panelBlue;
          return (
            <mesh
              key={`${side}-${column}-${row}`}
              position={[x, 1.6 + row * (1.6 + STAGE_DIMENSIONS.panelGap), -18 + column * 5.2]}
              rotation={[0, direction * 0.23, 0]}
            >
              <boxGeometry args={[2.4, 1.6, 0.42]} />
              <meshStandardMaterial
                color={isGold ? "#50381b" : STAGE_COLORS.panelDim}
                emissive={color}
                emissiveIntensity={0.4}
                metalness={0.16}
                roughness={0.34}
              />
            </mesh>
          );
        }),
      )}
    </group>
  );
};

interface PortalBackdropProps extends StageEnvironmentProps {
  tierIndex: number;
}

const PortalBackdrop = ({ difficulty, tierIndex }: PortalBackdropProps): JSX.Element => {
  const haloRef = useRef<Mesh>(null);
  const trimRef = useRef<Mesh>(null);
  const clampedTier = Math.min(tierIndex, BACKDROP_GLOW_COLORS.length - 1);
  const glowColor = BACKDROP_GLOW_COLORS[clampedTier];

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const speed = 1.7 + clampedTier * 1.2;

    if (haloRef.current?.material && "emissiveIntensity" in haloRef.current.material) {
      (haloRef.current.material as { emissive: Color; emissiveIntensity: number }).emissive.set(glowColor);
      haloRef.current.material.emissiveIntensity =
        0.8 + clampedTier * 0.4 + Math.sin(elapsed * speed) * (0.12 + clampedTier * 0.1);
    }

    if (trimRef.current?.material && "emissiveIntensity" in trimRef.current.material) {
      (trimRef.current.material as { emissive: Color; emissiveIntensity: number }).emissive.set(glowColor);
      trimRef.current.material.emissiveIntensity =
        1.0 + clampedTier * 0.5 + Math.sin(elapsed * (speed + 0.4)) * (0.22 + clampedTier * 0.14);
    }
  });

  return (
    <group position={[0, 0, -74]}>
      <mesh receiveShadow position={[0, 5.8, -1.4]}>
        <boxGeometry args={[STAGE_DIMENSIONS.backdropWidth, 12, 1.8]} />
        <meshStandardMaterial color={STAGE_COLORS.backdropBase} metalness={0.18} roughness={0.72} />
      </mesh>

      <mesh ref={haloRef} position={[0, 5.6, -0.55]}>
        <boxGeometry args={[12.8, 11.2, 0.2]} />
        <meshStandardMaterial
          color="#213c61"
          emissive={STAGE_COLORS.backdropGlow}
          emissiveIntensity={0.9}
          metalness={0.08}
          roughness={0.35}
        />
      </mesh>

      <mesh ref={trimRef} position={[0, 5.6, 0.15]}>
        <boxGeometry
          args={[STAGE_DIMENSIONS.wallPortalWidth, STAGE_DIMENSIONS.wallPortalHeight, 0.16]}
        />
        <meshStandardMaterial
          color={STAGE_COLORS.portalFrame}
          emissive={STAGE_COLORS.backdropGlow}
          emissiveIntensity={1.05}
          metalness={0.14}
          roughness={0.22}
        />
      </mesh>

      <mesh position={[0, 5.6, 0.34]}>
        <boxGeometry args={[6.8, 8.5, 0.12]} />
        <meshStandardMaterial
          color="#091527"
          emissive={difficulty === "hard" ? "#4e1515" : "#0f2438"}
          emissiveIntensity={0.36}
          roughness={0.52}
        />
      </mesh>

      <StageScreen difficulty={difficulty} />
    </group>
  );
};

export const StageEnvironment = ({ difficulty, tierIndex = 0 }: StageEnvironmentProps): JSX.Element => {
  const riserPositions = useMemo(() => [-14.2, 14.2] as const, []);

  return (
    <>
      <PortalBackdrop difficulty={difficulty} tierIndex={tierIndex} />

      <mesh receiveShadow position={[0, 0.06, -38]}>
        <boxGeometry args={[STAGE_DIMENSIONS.offstageWidth, 0.12, STAGE_DIMENSIONS.laneLength]} />
        <meshStandardMaterial color={STAGE_COLORS.floorOuter} roughness={0.92} metalness={0.04} />
      </mesh>

      {riserPositions.map((x) => (
        <mesh key={`riser-${x}`} receiveShadow position={[x, 0.45, -18]}>
          <boxGeometry args={[STAGE_DIMENSIONS.sideRiserWidth, 0.9, 42]} />
          <meshStandardMaterial
            color={STAGE_COLORS.floorPlatform}
            roughness={0.82}
            metalness={0.1}
          />
        </mesh>
      ))}

      <SidePanelWall side="left" tierIndex={tierIndex} />
      <SidePanelWall side="right" tierIndex={tierIndex} />
    </>
  );
};
