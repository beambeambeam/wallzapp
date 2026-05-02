import { a, useSpring } from "@react-spring/three";
import type { JSX } from "react";

import type { ArmState } from "@/types/game";

interface CharacterProps {
  leftArm: ArmState;
  rightArm: ArmState;
}

const armRotation = (state: ArmState): number => (state === "out" ? 0 : -Math.PI / 2.5);

export const Character = ({ leftArm, rightArm }: CharacterProps): JSX.Element => {
  const leftSpring = useSpring({
    config: { friction: 18, tension: 170 },
    rotationZ: armRotation(leftArm),
  });

  const rightSpring = useSpring({
    config: { friction: 18, tension: 170 },
    rotationZ: -armRotation(rightArm),
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh castShadow position={[0, 3.2, 0]}>
        <boxGeometry args={[1.4, 1.8, 0.7]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      <mesh castShadow position={[0, 4.6, 0]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color="#fef3c7" />
      </mesh>

      <a.group position={[-1, 3.9, 0]} rotation-z={leftSpring.rotationZ}>
        <mesh castShadow position={[-0.55, 0, 0]}>
          <boxGeometry args={[1.1, 0.28, 0.28]} />
          <meshStandardMaterial color="#60a5fa" />
        </mesh>
      </a.group>

      <a.group position={[1, 3.9, 0]} rotation-z={rightSpring.rotationZ}>
        <mesh castShadow position={[0.55, 0, 0]}>
          <boxGeometry args={[1.1, 0.28, 0.28]} />
          <meshStandardMaterial color="#60a5fa" />
        </mesh>
      </a.group>

      <mesh receiveShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[1.2, 1.8, 0.55]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
    </group>
  );
};
