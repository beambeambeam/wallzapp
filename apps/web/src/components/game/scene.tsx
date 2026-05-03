import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { JSX } from "react";

import { DIFFICULTY_CONFIG, ENDLESS_TIERS } from "@/constants/difficulty";
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

/** Returns which tier index (0-based) a given wall number (1-based) falls into. */
const getTierIndex = (wallNumber: number): number => {
  let wallsSeen = 0;
  for (const [index, tier] of ENDLESS_TIERS.entries()) {
    wallsSeen += tier.wallCount;
    if (wallNumber <= wallsSeen) return index;
  }
  return ENDLESS_TIERS.length - 1;
};

interface WorldProps {
  onWallResolved: () => void;
  setWallZ: (value: number) => void;
  tierIndex: number;
  wallZ: number;
}

const World = ({ onWallResolved, setWallZ, tierIndex, wallZ }: WorldProps): JSX.Element => {
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

  // Fog color shifts red at high tiers in endless
  const fogColor = useMemo(() => {
    if (gameMode !== "endless") return "#102439";
    const fogColors = ["#102439", "#12283a", "#2a1510", "#3a0a0a"];
    return fogColors[Math.min(tierIndex, fogColors.length - 1)];
  }, [gameMode, tierIndex]);

  // Fog near distance tightens at high tiers for tunnel-vision feel
  const fogNear = gameMode === "endless" ? Math.max(38 - tierIndex * 6, 14) : 38;

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
      <fog args={[fogColor, fogNear, 150]} attach="fog" />
      <Lighting />
      <StageEnvironment difficulty={difficulty} tierIndex={gameMode === "endless" ? tierIndex : 0} />
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

  // tierIndex is 0 in classic mode, computed from wall number in endless
  const tierIndex = gameMode === "endless" ? getTierIndex(currentWallIndex + 1) : 0;

  // Play tier step-up sound when tierIndex increases
  const prevTierRef = useRef(0);
  useEffect(() => {
    if (gameMode !== "endless") return;
    if (tierIndex > 0 && tierIndex !== prevTierRef.current) {
      soundService.playTier(Math.min(tierIndex, 3) as 1 | 2 | 3);
    }
    prevTierRef.current = tierIndex;
  }, [tierIndex, gameMode]);

  const onWallResolved = (): void => {
    const delay = gameMode === "endless" ? 1000 : config.interWallDelayMs;
    window.setTimeout(() => {
      const { gameMode: currentGameMode, wallResults: latestResults } = useGameStore.getState();
      const lastResult = latestResults[latestResults.length - 1];
      if (currentGameMode === "endless" && lastResult === "fail") {
        soundService.playLose();
        window.setTimeout(() => {
          clearFlash();
          goTo("result");
        }, 1500);
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
        <World
          onWallResolved={onWallResolved}
          setWallZ={setWallZ}
          tierIndex={tierIndex}
          wallZ={wallZ}
        />
        <PostProcessing tierIndex={tierIndex} />
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
        tierIndex={tierIndex}
        totalWalls={walls.length}
        wallResults={wallResults}
      />
    </div>
  );
};
