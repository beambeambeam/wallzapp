import { a, useSpring } from "@react-spring/three";
import type { JSX } from "react";

import { CHARACTER_GEOMETRY } from "@/lib/pose-geometry";
import type { ArmState } from "@/types/game";

interface CharacterProps {
  leftArm: ArmState;
  rightArm: ArmState;
}

const getLeftArmRotation = (state: ArmState): number =>
  state === "out" ? 0 : CHARACTER_GEOMETRY.arm.tuckedRotation;

const getRightArmRotation = (state: ArmState): number =>
  state === "out" ? 0 : -CHARACTER_GEOMETRY.arm.tuckedRotation;

export const Character = ({ leftArm, rightArm }: CharacterProps): JSX.Element => {
  const leftSpring = useSpring({
    config: { friction: 18, tension: 170 },
    rotationZ: getLeftArmRotation(leftArm),
  });

  const rightSpring = useSpring({
    config: { friction: 18, tension: 170 },
    rotationZ: getRightArmRotation(rightArm),
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh receiveShadow position={[0, 0.04, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.2, 32]} />
        <meshStandardMaterial color="#0f1d2d" opacity={0.36} transparent />
      </mesh>

      <mesh castShadow position={[CHARACTER_GEOMETRY.torso.x, CHARACTER_GEOMETRY.torso.y, 0]}>
        <boxGeometry
          args={[CHARACTER_GEOMETRY.torso.width, CHARACTER_GEOMETRY.torso.height, 0.7]}
        />
        <meshStandardMaterial color="#fff6e2" metalness={0.08} roughness={0.36} />
      </mesh>

      <mesh castShadow position={[CHARACTER_GEOMETRY.head.x, CHARACTER_GEOMETRY.head.y, 0]}>
        <boxGeometry args={[CHARACTER_GEOMETRY.head.width, CHARACTER_GEOMETRY.head.height, 0.9]} />
        <meshStandardMaterial color="#ffe6c7" metalness={0.02} roughness={0.42} />
      </mesh>

      <a.group
        position={[-CHARACTER_GEOMETRY.arm.pivotXOffset, CHARACTER_GEOMETRY.arm.pivotY, 0]}
        rotation-z={leftSpring.rotationZ}
      >
        <mesh castShadow position={[-CHARACTER_GEOMETRY.arm.length / 2, 0, 0]}>
          <boxGeometry
            args={[CHARACTER_GEOMETRY.arm.length, CHARACTER_GEOMETRY.arm.thickness, 0.28]}
          />
          <meshStandardMaterial
            color="#45d3ff"
            emissive="#0f6ea5"
            emissiveIntensity={0.3}
            metalness={0.18}
            roughness={0.28}
          />
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
          <meshStandardMaterial
            color="#45d3ff"
            emissive="#0f6ea5"
            emissiveIntensity={0.3}
            metalness={0.18}
            roughness={0.28}
          />
        </mesh>
      </a.group>

      <mesh receiveShadow position={[CHARACTER_GEOMETRY.hips.x, CHARACTER_GEOMETRY.hips.y, 0]}>
        <boxGeometry args={[CHARACTER_GEOMETRY.hips.width, CHARACTER_GEOMETRY.hips.height, 0.55]} />
        <meshStandardMaterial color="#ff9f2f" metalness={0.22} roughness={0.26} />
      </mesh>
    </group>
  );
};
