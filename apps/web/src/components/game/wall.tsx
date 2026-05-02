import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { JSX } from "react";
import type { Mesh } from "three";

import {
  buildWallSegmentsForPose,
  getPoseSilhouetteBounds,
  WALL_GEOMETRY,
} from "@/lib/pose-geometry";
import type { Difficulty, WallConfig } from "@/types/game";

import { STAGE_COLORS } from "./stage-theme";

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
  const trimRef = useRef<Mesh>(null);
  const segments = useMemo(
    () => buildWallSegmentsForPose({ leftArm: config.leftArm, rightArm: config.rightArm }),
    [config.leftArm, config.rightArm],
  );

  const silhouette = useMemo(
    () => getPoseSilhouetteBounds({ leftArm: config.leftArm, rightArm: config.rightArm }),
    [config.leftArm, config.rightArm],
  );

  useFrame(({ clock }) => {
    const trim = trimRef.current;
    if (trim?.material && "emissiveIntensity" in trim.material) {
      trim.material.emissiveIntensity = 0.8 + Math.sin(clock.getElapsedTime() * 3.1) * 0.18;
    }
  });

  return (
    <group position={[0, 0, zPosition]}>
      <mesh receiveShadow position={[0, WALL_GEOMETRY.height / 2, -0.95]}>
        <boxGeometry
          args={[WALL_GEOMETRY.frameHalfWidth * 2 + 3.6, WALL_GEOMETRY.height + 1.3, 1.3]}
        />
        <meshStandardMaterial color={STAGE_COLORS.wallFrame} metalness={0.24} roughness={0.58} />
      </mesh>

      <mesh ref={trimRef} position={[0, WALL_GEOMETRY.height / 2, -0.22]}>
        <boxGeometry
          args={[WALL_GEOMETRY.frameHalfWidth * 2 + 2.2, WALL_GEOMETRY.height + 0.5, 0.22]}
        />
        <meshStandardMaterial
          color={STAGE_COLORS.wallTrim}
          emissive={STAGE_COLORS.backdropGlow}
          emissiveIntensity={0.9}
          metalness={0.08}
          roughness={0.22}
        />
      </mesh>

      <mesh receiveShadow position={[0, WALL_GEOMETRY.height / 2, -0.04]}>
        <boxGeometry args={[WALL_GEOMETRY.frameHalfWidth * 2, WALL_GEOMETRY.height, 0.14]} />
        <meshStandardMaterial color="#081526" roughness={0.7} metalness={0.12} />
      </mesh>

      {segments.map((segment, index) => (
        <mesh
          key={`segment-${index}-${segment.x}-${segment.y}`}
          position={[segment.x, segment.y, 0]}
          castShadow
        >
          <boxGeometry args={[segment.width, segment.height, segment.depth]} />
          <meshStandardMaterial
            color={wallColorByDifficulty[difficulty]}
            emissive={wallColorByDifficulty[difficulty]}
            emissiveIntensity={0.18}
            metalness={0.18}
            roughness={0.44}
          />
        </mesh>
      ))}

      {[-1, 1].map((direction) => (
        <mesh
          key={`gate-post-${direction}`}
          castShadow
          position={[
            direction * (WALL_GEOMETRY.frameHalfWidth + 1.7),
            WALL_GEOMETRY.height / 2,
            -0.3,
          ]}
        >
          <boxGeometry args={[0.68, WALL_GEOMETRY.height + 1.8, 0.68]} />
          <meshStandardMaterial color={STAGE_COLORS.wallFrame} metalness={0.4} roughness={0.34} />
        </mesh>
      ))}

      <mesh castShadow position={[0, WALL_GEOMETRY.height + 1.15, -0.3]}>
        <boxGeometry args={[WALL_GEOMETRY.frameHalfWidth * 2 + 4.5, 0.65, 0.65]} />
        <meshStandardMaterial color={STAGE_COLORS.wallFrame} metalness={0.42} roughness={0.34} />
      </mesh>

      {[-2.8, 0, 2.8].map((x) => (
        <mesh key={`truss-light-${x}`} position={[x, WALL_GEOMETRY.height + 0.85, 0.22]}>
          <boxGeometry args={[0.88, 0.22, 0.22]} />
          <meshStandardMaterial
            color={STAGE_COLORS.portalFrame}
            emissive={difficulty === "hard" ? "#ff764f" : STAGE_COLORS.borderGlow}
            emissiveIntensity={1}
            roughness={0.26}
          />
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
