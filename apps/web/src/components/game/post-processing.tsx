import { BlendFunction } from "postprocessing";
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { JSX } from "react";
import { Vector2 } from "three";

// Per-tier targets: [bloom intensity, chromatic aberration offset, vignette darkness]
const TIER_TARGETS: [number, number, number][] = [
  [1.4,  0.0008, 0.55], // tier 0 — baseline
  [2.0,  0.0022, 0.65], // tier 1 — noticeable
  [3.2,  0.0055, 0.76], // tier 2 — intense
  [5.0,  0.0120, 0.88], // tier 3 — brutal
];

interface PostProcessingProps {
  tierIndex: number;
}

const Effects = ({ tierIndex }: PostProcessingProps): JSX.Element => {
  const clampedTier = Math.min(tierIndex, TIER_TARGETS.length - 1);
  const [targetBloom, targetAberration, targetVignette] = TIER_TARGETS[clampedTier];

  // Mutable refs for animated values — updated in useFrame, trigger re-renders via setState
  const bloomRef = useRef(1.4);
  const aberrationRef = useRef(0.0008);
  const vignetteRef = useRef(0.55);

  const [bloomIntensity, setBloomIntensity] = useState(1.4);
  const [aberrationOffset, setAberrationOffset] = useState(() => new Vector2(0.0008, 0.0008));
  const [vignetteDarkness, setVignetteDarkness] = useState(0.55);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Bloom: lerp toward target + heartbeat pulse at high tiers
    const pulse = clampedTier >= 2 ? Math.abs(Math.sin(t * (2.5 + clampedTier))) * 0.6 : 0;
    bloomRef.current += (targetBloom + pulse - bloomRef.current) * 0.06;
    setBloomIntensity(bloomRef.current);

    // Chromatic aberration: lerp + glitch spike at tier 3
    const spike = clampedTier >= 3 && Math.sin(t * 7.3) > 0.92 ? 0.018 : 0;
    aberrationRef.current += (targetAberration + spike - aberrationRef.current) * 0.08;
    setAberrationOffset(new Vector2(aberrationRef.current, aberrationRef.current));

    // Vignette: lerp toward target
    vignetteRef.current += (targetVignette - vignetteRef.current) * 0.05;
    setVignetteDarkness(vignetteRef.current);
  });

  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={bloomIntensity}
        kernelSize={3}
        luminanceSmoothing={0.08}
        luminanceThreshold={0.18}
        mipmapBlur
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={aberrationOffset}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette darkness={vignetteDarkness} eskil={false} offset={0.3} />
    </EffectComposer>
  );
};

export const PostProcessing = ({ tierIndex }: PostProcessingProps): JSX.Element => (
  <Effects tierIndex={tierIndex} />
);
