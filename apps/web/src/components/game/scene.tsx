import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import type { JSX } from "react";

import { DIFFICULTY_CONFIG } from "@/constants/difficulty";
import { judgeWall } from "@/lib/judgment";
import { soundService } from "@/lib/sound";
import { useGameStore } from "@/store/game-store";

import { Character } from "./character";
import { Floor } from "./floor";
import { HUD } from "./hud";
import { Lighting } from "./lighting";
import { PostProcessing } from "./post-processing";
import { StageEnvironment } from "./stage-environment";
import { STAGE_COLORS } from "./stage-theme";
import { Wall } from "./wall";

const WALL_START_Z = -80;
const JUDGMENT_Z = 0;
const WALL_DESPAWN_Z = 20;

interface WorldProps {
  onWallResolved: () => void;
  setWallZ: (value: number) => void;
  wallZ: number;
}

const World = ({ onWallResolved, setWallZ, wallZ }: WorldProps): JSX.Element => {
  const difficulty = useGameStore((state) => state.difficulty);
  const gameMode = useGameStore((state) => state.gameMode);
  const endlessWallSpeed = useGameStore((state) => state.endlessWallSpeed);
  const endlessLeniencyMs = useGameStore((state) => state.endlessLeniencyMs);
  const walls = useGameStore((state) => state.walls);
  const currentWallIndex = useGameStore((state) => state.currentWallIndex);
  const leftArm = useGameStore((state) => state.leftArm);
  const rightArm = useGameStore((state) => state.rightArm);
  const resolveCurrentWall = useGameStore((state) => state.resolveCurrentWall);

  const config = DIFFICULTY_CONFIG[difficulty];
  const activeSpeed = gameMode === "endless" ? endlessWallSpeed : config.wallSpeed;
  const activeLeniency = gameMode === "endless" ? endlessLeniencyMs : config.leniencyMs;
  const [didJudge, setDidJudge] = useState<boolean>(false);

  const currentWall = walls[currentWallIndex];

  useEffect(() => {
    setWallZ(WALL_START_Z);
    setDidJudge(false);
  }, [currentWallIndex, setWallZ]);

  useFrame((_, delta) => {
    if (!currentWall || didJudge) {
      return;
    }

    const nextZ = wallZ + activeSpeed * delta;
    setWallZ(nextZ);

    if (nextZ >= JUDGMENT_Z) {
      const offsetMs = ((nextZ - JUDGMENT_Z) / activeSpeed) * 1000;
      const isPass = judgeWall({
        leftArm,
        leniencyMs: activeLeniency,
        requiredWall: currentWall,
        rightArm,
        timingOffsetMs: offsetMs,
      });

      soundService.playSound(isPass ? "pass" : "hit");
      resolveCurrentWall(isPass ? "pass" : "fail");
      setDidJudge(true);
      onWallResolved();
    }
  });

  if (!currentWall) {
    return <></>;
  }

  return (
    <>
      <color args={[STAGE_COLORS.ambientSky]} attach="background" />
      <fog args={["#102439", 38, 150]} attach="fog" />
      <Lighting />
      <StageEnvironment difficulty={difficulty} />
      <Floor />
      <Character leftArm={leftArm} rightArm={rightArm} />
      <Wall config={currentWall} difficulty={difficulty} zPosition={wallZ} />
    </>
  );
};

export const Scene = (): JSX.Element => {
  const advanceWall = useGameStore((state) => state.advanceWall);
  const clearFlash = useGameStore((state) => state.clearFlash);
  const difficulty = useGameStore((state) => state.difficulty);
  const gameMode = useGameStore((state) => state.gameMode);
  const endlessWallSpeed = useGameStore((state) => state.endlessWallSpeed);
  const goTo = useGameStore((state) => state.goTo);
  const walls = useGameStore((state) => state.walls);
  const currentWallIndex = useGameStore((state) => state.currentWallIndex);
  const leftArm = useGameStore((state) => state.leftArm);
  const rightArm = useGameStore((state) => state.rightArm);
  const showFlash = useGameStore((state) => state.showFlash);
  const score = useGameStore((state) => state.score);
  const wallResults = useGameStore((state) => state.wallResults);

  const config = useMemo(() => DIFFICULTY_CONFIG[difficulty], [difficulty]);
  const [wallZ, setWallZ] = useState<number>(WALL_START_Z);

  const travelDistance = WALL_DESPAWN_Z - WALL_START_Z;
  const progress = (wallZ - WALL_START_Z) / travelDistance;

  const onWallResolved = (): void => {
    const delay = gameMode === "endless" ? 1000 : config.interWallDelayMs;
    window.setTimeout(() => {
      const latestResults = useGameStore.getState().wallResults;
      const lastResult = latestResults[latestResults.length - 1];
      if (gameMode === "endless" && lastResult === "fail") {
        clearFlash();
        goTo("result");
        return;
      }
      clearFlash();
      advanceWall();
    }, delay);
  };

  return (
    <div className="relative h-screen w-screen">
      <Canvas
        camera={{ far: 220, fov: 43, position: [16, 9.5, 23] }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ camera, gl }) => {
          camera.lookAt(0, 4.2, -24);
          gl.setClearColor(STAGE_COLORS.ambientSky);
        }}
        shadows
      >
        <World onWallResolved={onWallResolved} setWallZ={setWallZ} wallZ={wallZ} />
        <PostProcessing />
      </Canvas>
      <HUD
        currentWall={currentWallIndex + 1}
        endlessSpeed={gameMode === "endless" ? endlessWallSpeed : undefined}
        flash={showFlash}
        gameMode={gameMode}
        leftArm={leftArm}
        progress={progress}
        rightArm={rightArm}
        score={score}
        totalWalls={walls.length}
        wallResults={wallResults}
      />
    </div>
  );
};
