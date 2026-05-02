import { a, useSpring } from "@react-spring/three";
import type { JSX } from "react";

import { CHARACTER_GEOMETRY } from "@/lib/pose-geometry";
import type { ArmState } from "@/types/game";

interface CharacterProps {
  leftArm: ArmState;
  rightArm: ArmState;
}

const armRotation = (state: ArmState): number =>
  state === "out" ? 0 : -CHARACTER_GEOMETRY.arm.tuckedRotation;

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
      <mesh castShadow position={[CHARACTER_GEOMETRY.torso.x, CHARACTER_GEOMETRY.torso.y, 0]}>
        <boxGeometry
          args={[CHARACTER_GEOMETRY.torso.width, CHARACTER_GEOMETRY.torso.height, 0.7]}
        />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      <mesh castShadow position={[CHARACTER_GEOMETRY.head.x, CHARACTER_GEOMETRY.head.y, 0]}>
        <boxGeometry args={[CHARACTER_GEOMETRY.head.width, CHARACTER_GEOMETRY.head.height, 0.9]} />
        <meshStandardMaterial color="#fef3c7" />
      </mesh>

      <a.group
        position={[-CHARACTER_GEOMETRY.arm.pivotXOffset, CHARACTER_GEOMETRY.arm.pivotY, 0]}
        rotation-z={leftSpring.rotationZ}
      >
        <mesh castShadow position={[-CHARACTER_GEOMETRY.arm.length / 2, 0, 0]}>
          <boxGeometry
            args={[CHARACTER_GEOMETRY.arm.length, CHARACTER_GEOMETRY.arm.thickness, 0.28]}
          />
          <meshStandardMaterial color="#60a5fa" />
        </mesh>
      </a.group>

      <a.group
        position={[CHARACTER_GEOMETRY.arm.pivotXOffset, CHARACTER_GEOMETRY.arm.pivotY, 0]}
        rotation-z={rightSpring.rotationZ}
      >
        <mesh castShadow position={[CHARACTER_GEOMETRY.arm.length / 2, 0, 0]}>
          <boxGeometry
            args={[CHARACTER_GEOMETRY.arm.length, CHARACTER_GEOMETRY.arm.thickness, 0.28]}
          />
          <meshStandardMaterial color="#60a5fa" />
        </mesh>
      </a.group>

      <mesh receiveShadow position={[CHARACTER_GEOMETRY.hips.x, CHARACTER_GEOMETRY.hips.y, 0]}>
        <boxGeometry args={[CHARACTER_GEOMETRY.hips.width, CHARACTER_GEOMETRY.hips.height, 0.55]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
    </group>
  );
};
