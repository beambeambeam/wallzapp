import * as THREE from "three";
import React from "react";
import type { JSX } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import { useFrame } from "@react-three/fiber";

import type { ArmState } from "@/types/game";

type ModelProps = JSX.IntrinsicElements["group"] & {
  leftArm?: ArmState;
  rightArm?: ArmState;
};

type GLTFResult = GLTF & {
  nodes: {
    mixamorig9_Hips: THREE.Bone;
    mixamorig9_LeftArm: THREE.Bone;
    mixamorig9_RightArm: THREE.Bone;
    Ch31_Body: THREE.SkinnedMesh;
    Ch31_Pants: THREE.SkinnedMesh;
    Ch31_Sweater: THREE.SkinnedMesh;
    Ch31_Collar: THREE.SkinnedMesh;
    Ch31_Eyelashes: THREE.SkinnedMesh;
    Ch31_Shoes: THREE.SkinnedMesh;
    Ch31_Hair: THREE.SkinnedMesh;
  };
  materials: {
    Ch31_body: THREE.MeshStandardMaterial;
    Ch31_hair: THREE.MeshStandardMaterial;
  };
};

const ARM_OUT = 0;
const ARM_TUCKED = Math.PI / 3;
const LERP_SPEED = 12;

export function Model({ leftArm = "out", rightArm = "out", ...props }: ModelProps) {
  const group = React.useRef<THREE.Group>(null);
  const { nodes, materials, animations } = useGLTF("/models/Ch31_nonPBR.glb") as GLTFResult;
  const { actions } = useAnimations(animations, group);

  // Play idle animation
  React.useEffect(() => {
    const idle = actions["mixamo.com"];
    if (idle) {
      idle.reset().fadeIn(0.2).play();
    }
    return () => {
      idle?.fadeOut(0.2);
    };
  }, [actions]);

  // Smoothly interpolate arm bones each frame
  useFrame((_, delta) => {
    const leftBone: THREE.Bone | undefined = nodes.mixamorig9_LeftArm;
    const rightBone: THREE.Bone | undefined = nodes.mixamorig9_RightArm;
    const t = 1 - 0.001 ** (delta * LERP_SPEED);

    if (leftBone) {
      const target = leftArm === "tucked" ? ARM_TUCKED : ARM_OUT;
      leftBone.rotation.x = THREE.MathUtils.lerp(leftBone.rotation.x, target, t);
    }

    if (rightBone) {
      const target = rightArm === "tucked" ? ARM_TUCKED : ARM_OUT;
      rightBone.rotation.x = THREE.MathUtils.lerp(rightBone.rotation.x, target, t);
    }
  });

  return (
    <group
      ref={group}
      {...props}
      dispose={null}
      position={[0, 0, 0]}
      scale={0.028}
      rotation={[0, Math.PI, 0]}
    >
      <group name="empty_1">
        <group name="FBX_Root">
          <primitive object={nodes.mixamorig9_Hips} />
          <skinnedMesh
            name="Ch31_Body"
            geometry={nodes.Ch31_Body.geometry}
            material={materials.Ch31_body}
            skeleton={nodes.Ch31_Body.skeleton}
            castShadow
          />
          <skinnedMesh
            name="Ch31_Pants"
            geometry={nodes.Ch31_Pants.geometry}
            material={materials.Ch31_body}
            skeleton={nodes.Ch31_Pants.skeleton}
            castShadow
          />
          <skinnedMesh
            name="Ch31_Sweater"
            geometry={nodes.Ch31_Sweater.geometry}
            material={materials.Ch31_body}
            skeleton={nodes.Ch31_Sweater.skeleton}
            castShadow
          />
          <skinnedMesh
            name="Ch31_Collar"
            geometry={nodes.Ch31_Collar.geometry}
            material={materials.Ch31_body}
            skeleton={nodes.Ch31_Collar.skeleton}
            castShadow
          />
          <skinnedMesh
            name="Ch31_Eyelashes"
            geometry={nodes.Ch31_Eyelashes.geometry}
            material={materials.Ch31_hair}
            skeleton={nodes.Ch31_Eyelashes.skeleton}
          />
          <skinnedMesh
            name="Ch31_Shoes"
            geometry={nodes.Ch31_Shoes.geometry}
            material={materials.Ch31_body}
            skeleton={nodes.Ch31_Shoes.skeleton}
            castShadow
          />
          <skinnedMesh
            name="Ch31_Hair"
            geometry={nodes.Ch31_Hair.geometry}
            material={materials.Ch31_hair}
            skeleton={nodes.Ch31_Hair.skeleton}
            castShadow
          />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/Ch31_nonPBR.glb");
