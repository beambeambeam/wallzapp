import { BlendFunction } from "postprocessing";
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from "@react-three/postprocessing";
import type { JSX } from "react";
import { Vector2 } from "three";

export const PostProcessing = (): JSX.Element => (
  <EffectComposer multisampling={4}>
    <Bloom
      intensity={1.4}
      kernelSize={3}
      luminanceSmoothing={0.08}
      luminanceThreshold={0.18}
      mipmapBlur
    />
    <ChromaticAberration
      blendFunction={BlendFunction.NORMAL}
      offset={new Vector2(0.0008, 0.0008)}
      radialModulation={false}
      modulationOffset={0}
    />
    <Vignette darkness={0.55} eskil={false} offset={0.3} />
  </EffectComposer>
);
