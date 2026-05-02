import { useMemo } from "react";
import type { JSX } from "react";

import { buildWallSegmentsForPose, getPoseSilhouetteBounds } from "@/lib/pose-geometry";
import type { Difficulty, WallConfig } from "@/types/game";

interface WallProps {
  config: WallConfig;
  difficulty: Difficulty;
  zPosition: number;
}

const SHOW_WALL_GUIDES = false;

const wallColorByDifficulty: Record<Difficulty, string> = {
  easy: "#22c55e",
  hard: "#ef4444",
  medium: "#facc15",
};

export const Wall = ({ config, difficulty, zPosition }: WallProps): JSX.Element => {
  const segments = useMemo(
    () => buildWallSegmentsForPose({ leftArm: config.leftArm, rightArm: config.rightArm }),
    [config.leftArm, config.rightArm],
  );

  const silhouette = useMemo(
    () => getPoseSilhouetteBounds({ leftArm: config.leftArm, rightArm: config.rightArm }),
    [config.leftArm, config.rightArm],
  );

  return (
    <group position={[0, 0, zPosition]}>
      {segments.map((segment, index) => (
        <mesh
          key={`segment-${index}-${segment.x}-${segment.y}`}
          position={[segment.x, segment.y, 0]}
        >
          <boxGeometry args={[segment.width, segment.height, segment.depth]} />
          <meshStandardMaterial color={wallColorByDifficulty[difficulty]} />
        </mesh>
      ))}

      {SHOW_WALL_GUIDES
        ? [silhouette.body, silhouette.leftArm, silhouette.rightArm].map((rect, index) => (
            <mesh
              key={`guide-${index}-${rect.minX}-${rect.minY}`}
              position={[(rect.minX + rect.maxX) / 2, (rect.minY + rect.maxY) / 2, 1.05]}
            >
              <boxGeometry args={[rect.maxX - rect.minX, rect.maxY - rect.minY, 0.04]} />
              <meshStandardMaterial color="#0f172a" opacity={0.2} transparent />
            </mesh>
          ))
        : null}
    </group>
  );
};
