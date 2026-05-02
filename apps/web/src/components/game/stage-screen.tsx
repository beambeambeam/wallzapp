import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { JSX } from "react";
import type { Group, Mesh } from "three";

import type { Difficulty } from "@/types/game";

import { STAGE_COLORS, STAGE_DIMENSIONS } from "./stage-theme";

interface StageScreenProps {
  difficulty: Difficulty;
  title?: string;
}

const difficultyLabel: Record<Difficulty, string> = {
  easy: "EASY",
  hard: "HARD",
  medium: "MEDIUM",
};

const difficultyColor: Record<Difficulty, string> = {
  easy: "#75f08f",
  hard: "#ff6b57",
  medium: "#ffd84d",
};

export const StageScreen = ({ difficulty, title = "WALLZAPP" }: StageScreenProps): JSX.Element => {
  const barsRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);
  const barOffsets = useMemo(
    () => [0, 0.8, 1.6, 2.1, 2.9, 3.7, 4.4].map((value, index) => value + index * 0.11),
    [],
  );

  useFrame(({ clock }) => {
    const bars = barsRef.current;
    if (bars) {
      const elapsed = clock.getElapsedTime();

      for (const [index, bar] of bars.children.entries()) {
        const offset = barOffsets[index] ?? 0;
        const scale = 0.72 + Math.sin(elapsed * 2.3 + offset) * 0.28;
        bar.scale.y = Math.max(scale, 0.22);
        bar.position.y = -1.8 + bar.scale.y * 0.9;
      }
    }

    const glowMesh = glowRef.current;
    if (glowMesh?.material && "emissiveIntensity" in glowMesh.material) {
      glowMesh.material.emissiveIntensity = 0.9 + Math.sin(clock.getElapsedTime() * 2.2) * 0.18;
    }
  });

  return (
    <group>
      <mesh castShadow position={[0, STAGE_DIMENSIONS.screenHeight / 2, -0.2]}>
        <boxGeometry
          args={[STAGE_DIMENSIONS.screenWidth + 1, STAGE_DIMENSIONS.screenHeight + 1, 0.6]}
        />
        <meshStandardMaterial color={STAGE_COLORS.propBody} metalness={0.2} roughness={0.62} />
      </mesh>

      <mesh ref={glowRef} position={[0, STAGE_DIMENSIONS.screenHeight / 2, 0.2]}>
        <boxGeometry
          args={[STAGE_DIMENSIONS.screenWidth + 0.3, STAGE_DIMENSIONS.screenHeight + 0.3, 0.18]}
        />
        <meshStandardMaterial
          color={STAGE_COLORS.portalFrame}
          emissive={STAGE_COLORS.backdropGlow}
          emissiveIntensity={1}
          metalness={0.05}
          roughness={0.2}
        />
      </mesh>

      <mesh position={[0, STAGE_DIMENSIONS.screenHeight / 2, 0.35]}>
        <boxGeometry args={[STAGE_DIMENSIONS.screenWidth, STAGE_DIMENSIONS.screenHeight, 0.1]} />
        <meshStandardMaterial
          color={STAGE_COLORS.backdropBase}
          emissive={STAGE_COLORS.backdropBase}
          emissiveIntensity={0.45}
          metalness={0.1}
          roughness={0.4}
        />
      </mesh>

      <group position={[0, 4.8, 0.45]}>
        <Text anchorX="center" anchorY="middle" color="#fefefe" fontSize={0.95} maxWidth={8}>
          {title}
        </Text>
      </group>

      <group position={[0, 3.3, 0.45]}>
        <Text
          anchorX="center"
          anchorY="middle"
          color={difficultyColor[difficulty]}
          fontSize={0.54}
          letterSpacing={0.12}
        >
          {difficultyLabel[difficulty]}
        </Text>
      </group>

      <group ref={barsRef} position={[0, 0, 0.5]}>
        {barOffsets.map((offset, index) => {
          const x = -3 + index * 1;
          const color = index % 2 === 0 ? STAGE_COLORS.panelBlue : STAGE_COLORS.panelGold;

          return (
            <mesh key={`bar-${offset}-${index}`} position={[x, -1.1, 0]}>
              <boxGeometry args={[0.56, 2.4, 0.12]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.85}
                metalness={0.1}
                roughness={0.28}
              />
            </mesh>
          );
        })}
      </group>

      <group position={[0, 1.2, 0.48]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[7.8, 0.3, 0.08]} />
          <meshStandardMaterial
            color={STAGE_COLORS.panelDim}
            emissive={STAGE_COLORS.panelBlue}
            emissiveIntensity={0.35}
          />
        </mesh>
        <mesh position={[0, -3.25, 0]}>
          <boxGeometry args={[7.8, 0.3, 0.08]} />
          <meshStandardMaterial
            color={STAGE_COLORS.panelDim}
            emissive={STAGE_COLORS.panelGold}
            emissiveIntensity={0.35}
          />
        </mesh>
      </group>
    </group>
  );
};
