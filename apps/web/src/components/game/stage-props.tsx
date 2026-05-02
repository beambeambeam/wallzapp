import type { JSX } from "react";

import { STAGE_COLORS } from "./stage-theme";

const SpeakerStack = ({ x, z }: { x: number; z: number }): JSX.Element => (
  <group position={[x, 0, z]}>
    <mesh castShadow receiveShadow position={[0, 1.2, 0]}>
      <boxGeometry args={[1.7, 2.4, 1.25]} />
      <meshStandardMaterial color={STAGE_COLORS.propBody} metalness={0.18} roughness={0.72} />
    </mesh>
    <mesh position={[0, 1.2, 0.68]}>
      <boxGeometry args={[1.18, 1.82, 0.08]} />
      <meshStandardMaterial
        color="#0a1220"
        emissive={STAGE_COLORS.rimBlue}
        emissiveIntensity={0.16}
        metalness={0.05}
        roughness={0.88}
      />
    </mesh>
    {[-0.48, 0.48].map((y, index) => (
      <mesh key={`speaker-ring-${x}-${z}-${index}`} position={[0, 1.2 + y, 0.75]}>
        <cylinderGeometry args={[0.34, 0.34, 0.06, 28]} />
        <meshStandardMaterial
          color={STAGE_COLORS.portalFrame}
          emissive={STAGE_COLORS.borderGlow}
          emissiveIntensity={0.42}
          metalness={0.15}
          roughness={0.3}
        />
      </mesh>
    ))}
  </group>
);

const LightColumn = ({ x, z }: { x: number; z: number }): JSX.Element => (
  <group position={[x, 0, z]}>
    <mesh castShadow receiveShadow position={[0, 3.7, 0]}>
      <boxGeometry args={[1.2, 7.4, 1.2]} />
      <meshStandardMaterial color={STAGE_COLORS.propBody} metalness={0.18} roughness={0.7} />
    </mesh>
    {Array.from({ length: 5 }, (_, index) => (
      <mesh key={`light-column-panel-${x}-${z}-${index}`} position={[0, 1.4 + index * 1.2, 0.63]}>
        <boxGeometry args={[0.74, 0.74, 0.08]} />
        <meshStandardMaterial
          color={index % 2 === 0 ? STAGE_COLORS.panelBlue : STAGE_COLORS.panelGold}
          emissive={index % 2 === 0 ? STAGE_COLORS.panelBlue : STAGE_COLORS.panelGold}
          emissiveIntensity={0.95}
          metalness={0.08}
          roughness={0.22}
        />
      </mesh>
    ))}
  </group>
);

export const StageProps = (): JSX.Element => (
  <>
    <SpeakerStack x={-9.2} z={-15} />
    <SpeakerStack x={9.2} z={-15} />
    <SpeakerStack x={-8.6} z={4} />
    <SpeakerStack x={8.6} z={4} />

    <LightColumn x={-13.5} z={-14} />
    <LightColumn x={13.5} z={-14} />
    <LightColumn x={-13.5} z={2} />
    <LightColumn x={13.5} z={2} />
  </>
);
