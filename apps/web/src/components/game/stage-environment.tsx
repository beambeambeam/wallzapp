import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { JSX } from "react";
import { Mesh as ThreeMesh } from "three";
import type { Group, Mesh, Object3D } from "three";

import type { Difficulty } from "@/types/game";

import { StageScreen } from "./stage-screen";
import { STAGE_COLORS, STAGE_DIMENSIONS } from "./stage-theme";

interface StageEnvironmentProps {
  difficulty: Difficulty;
}

const hasEmissiveIntensity = (
  child: Object3D,
): child is Mesh & {
  material: {
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

const SidePanelWall = ({ side }: { side: "left" | "right" }): JSX.Element => {
  const groupRef = useRef<Group>(null);
  const x = side === "left" ? -16.2 : 16.2;
  const direction = side === "left" ? 1 : -1;

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    const elapsed = clock.getElapsedTime();
    for (const [index, child] of group.children.entries()) {
      if (!hasEmissiveIntensity(child)) {
        continue;
      }

      child.material.emissiveIntensity =
        0.35 + (index % 3) * 0.12 + Math.sin(elapsed * 1.8 + index * 0.4) * 0.15;
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

const StageTruss = (): JSX.Element => (
  <group position={[0, STAGE_DIMENSIONS.trussHeight, -12]}>
    <mesh castShadow receiveShadow position={[0, 0, 0]}>
      <boxGeometry args={[29, 0.55, 0.55]} />
      <meshStandardMaterial color={STAGE_COLORS.wallFrame} metalness={0.45} roughness={0.38} />
    </mesh>
    {[-13.5, -4.5, 4.5, 13.5].map((x, index) => (
      <mesh key={`truss-lamp-${x}-${index}`} position={[x, -0.9, 0.42]} rotation={[0.38, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.46, 0.8, 18]} />
        <meshStandardMaterial
          color={STAGE_COLORS.portalFrame}
          emissive={index % 2 === 0 ? STAGE_COLORS.rimBlue : STAGE_COLORS.borderGlow}
          emissiveIntensity={1.15}
          metalness={0.18}
          roughness={0.24}
        />
      </mesh>
    ))}
  </group>
);

const PortalBackdrop = ({ difficulty }: StageEnvironmentProps): JSX.Element => {
  const haloRef = useRef<Mesh>(null);
  const trimRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (haloRef.current?.material && "emissiveIntensity" in haloRef.current.material) {
      haloRef.current.material.emissiveIntensity = 0.8 + Math.sin(elapsed * 1.7) * 0.12;
    }

    if (trimRef.current?.material && "emissiveIntensity" in trimRef.current.material) {
      trimRef.current.material.emissiveIntensity = 1 + Math.sin(elapsed * 2.1) * 0.22;
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

export const StageEnvironment = ({ difficulty }: StageEnvironmentProps): JSX.Element => {
  const riserPositions = useMemo(() => [-14.2, 14.2] as const, []);

  return (
    <>
      <PortalBackdrop difficulty={difficulty} />
      <StageTruss />

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

      <SidePanelWall side="left" />
      <SidePanelWall side="right" />
    </>
  );
};
