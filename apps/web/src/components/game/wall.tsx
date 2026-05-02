import { useMemo } from "react";
import type { JSX } from "react";

import type { Difficulty, WallConfig } from "@/types/game";

interface WallProps {
  config: WallConfig;
  difficulty: Difficulty;
  zPosition: number;
}

const wallColorByDifficulty: Record<Difficulty, string> = {
  easy: "#22c55e",
  hard: "#ef4444",
  medium: "#facc15",
};

const WALL_DEPTH = 2;
const WALL_HEIGHT = 9;
const SIDE_WIDTH = 2.2;
const CENTER_WIDTH = 1.6;

export const Wall = ({ config, difficulty, zPosition }: WallProps): JSX.Element => {
  const segments = useMemo(() => {
    const leftArmBlocked = config.leftArm === "tucked";
    const rightArmBlocked = config.rightArm === "tucked";

    return {
      centerBottomHeight: 1.8,
      centerTopHeight: 1.9,
      leftArmBlocked,
      rightArmBlocked,
      shoulderHeight: 1.2,
      shoulderY: 4,
      sideHeight: WALL_HEIGHT,
      sideY: WALL_HEIGHT / 2,
    };
  }, [config.leftArm, config.rightArm]);

  return (
    <group position={[0, 0, zPosition]}>
      <mesh position={[-(CENTER_WIDTH / 2 + SIDE_WIDTH / 2), segments.sideY, 0]}>
        <boxGeometry args={[SIDE_WIDTH, segments.sideHeight, WALL_DEPTH]} />
        <meshStandardMaterial color={wallColorByDifficulty[difficulty]} />
      </mesh>
      <mesh position={[CENTER_WIDTH / 2 + SIDE_WIDTH / 2, segments.sideY, 0]}>
        <boxGeometry args={[SIDE_WIDTH, segments.sideHeight, WALL_DEPTH]} />
        <meshStandardMaterial color={wallColorByDifficulty[difficulty]} />
      </mesh>

      <mesh position={[0, segments.centerBottomHeight / 2, 0]}>
        <boxGeometry args={[CENTER_WIDTH, segments.centerBottomHeight, WALL_DEPTH]} />
        <meshStandardMaterial color={wallColorByDifficulty[difficulty]} />
      </mesh>
      <mesh position={[0, WALL_HEIGHT - segments.centerTopHeight / 2, 0]}>
        <boxGeometry args={[CENTER_WIDTH, segments.centerTopHeight, WALL_DEPTH]} />
        <meshStandardMaterial color={wallColorByDifficulty[difficulty]} />
      </mesh>

      {segments.leftArmBlocked ? (
        <mesh position={[-0.9, segments.shoulderY, 0]}>
          <boxGeometry args={[0.85, segments.shoulderHeight, WALL_DEPTH]} />
          <meshStandardMaterial color={wallColorByDifficulty[difficulty]} />
        </mesh>
      ) : null}

      {segments.rightArmBlocked ? (
        <mesh position={[0.9, segments.shoulderY, 0]}>
          <boxGeometry args={[0.85, segments.shoulderHeight, WALL_DEPTH]} />
          <meshStandardMaterial color={wallColorByDifficulty[difficulty]} />
        </mesh>
      ) : null}
    </group>
  );
};
