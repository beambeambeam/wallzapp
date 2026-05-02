import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import type { JSX } from "react";

import { DIFFICULTY_CONFIG } from "@/constants/difficulty";
import { judgeWall } from "@/lib/judgment";
import { useGameStore } from "@/store/game-store";

import { Character } from "./character";
import { Floor } from "./floor";
import { HUD } from "./hud";
import { Lighting } from "./lighting";
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
  const walls = useGameStore((state) => state.walls);
  const currentWallIndex = useGameStore((state) => state.currentWallIndex);
  const leftArm = useGameStore((state) => state.leftArm);
  const rightArm = useGameStore((state) => state.rightArm);
  const resolveCurrentWall = useGameStore((state) => state.resolveCurrentWall);

  const config = DIFFICULTY_CONFIG[difficulty];
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

    const nextZ = wallZ + config.wallSpeed * delta;
    setWallZ(nextZ);

    if (nextZ >= JUDGMENT_Z) {
      const offsetMs = ((nextZ - JUDGMENT_Z) / config.wallSpeed) * 1000;
      const isPass = judgeWall({
        leftArm,
        leniencyMs: config.leniencyMs,
        requiredWall: currentWall,
        rightArm,
        timingOffsetMs: offsetMs,
      });

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
      <color args={["#0ea5e9"]} attach="background" />
      <fog args={["#38bdf8", 30, 140]} attach="fog" />
      <Lighting />
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
  const walls = useGameStore((state) => state.walls);
  const currentWallIndex = useGameStore((state) => state.currentWallIndex);
  const leftArm = useGameStore((state) => state.leftArm);
  const rightArm = useGameStore((state) => state.rightArm);
  const showFlash = useGameStore((state) => state.showFlash);
  const score = useGameStore((state) => state.score);

  const config = useMemo(() => DIFFICULTY_CONFIG[difficulty], [difficulty]);
  const [wallZ, setWallZ] = useState<number>(WALL_START_Z);

  const travelDistance = WALL_DESPAWN_Z - WALL_START_Z;
  const progress = (wallZ - WALL_START_Z) / travelDistance;

  const onWallResolved = (): void => {
    window.setTimeout(() => {
      clearFlash();
      advanceWall();
    }, config.interWallDelayMs);
  };

  return (
    <div className="relative h-screen w-screen">
      <Canvas camera={{ fov: 50, position: [10, 7.5, 20] }} shadows>
        <World onWallResolved={onWallResolved} setWallZ={setWallZ} wallZ={wallZ} />
      </Canvas>
      <HUD
        currentWall={currentWallIndex + 1}
        flash={showFlash}
        leftArm={leftArm}
        progress={progress}
        rightArm={rightArm}
        score={score}
        totalWalls={walls.length}
      />
    </div>
  );
};
