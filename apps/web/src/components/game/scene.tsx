import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import * as THREE from "three";
import type { PointerLockControls as PointerLockControlsImpl } from "three-stdlib";

import { playSound, startMusic, stopMusic } from "@/lib/sound";
import { useGameStore } from "@/store/game-store";

import { HUD } from "./hud";

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAYER_EYE_HEIGHT = 1.7; // camera height above ground
const GRAVITY = -18; // m/s² downward acceleration
const MOVE_SPEED = 8;
const BULLET_SPEED = 0.3;
const BULLET_MAX_DIST = 22;
const INTER_HIT_DELAY_MS = 800;
const GROUND_RAY_ORIGIN_OFFSET = 10; // cast from this many units above player
const GROUND_SNAP_MAX = 12; // max distance the ray will detect ground

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Spread targets around the player start position */
function getCubePosition(index: number, total: number): THREE.Vector3 {
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 + index * 0.7;
  const radius = 4 + (index % 5) * 3;
  return new THREE.Vector3(Math.cos(angle) * radius, 0.5, Math.sin(angle) * radius);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface BulletData {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  traveled: number;
}

interface ExplodeData {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotAxis: THREE.Vector3;
  rotSpeed: number;
  traveled: number;
}

interface TargetData {
  id: string;
  mesh: THREE.Mesh;
  alive: boolean;
}

// ─── Infinite floor ───────────────────────────────────────────────────────────

// ── Tuning ────────────────────────────────────────────────────────────────────
const FLOOR_COLOR = "#8B5E3C"; // brown color
const FLOOR_SIZE = 2000; // total plane size — large enough to never see the edge
const FLOOR_Y = 0; // height of the floor
// ──────────────────────────────────────────────────────────────────────────────

const InfiniteFloor = (): JSX.Element => {
  const { camera } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);

  // Follow camera on XZ so the floor is always under the player
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x = camera.position.x;
      meshRef.current.position.z = camera.position.z;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, FLOOR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[FLOOR_SIZE, FLOOR_SIZE]} />
      <meshStandardMaterial color={FLOOR_COLOR} />
    </mesh>
  );
};

// ─── GameWorld (inside Canvas) ────────────────────────────────────────────────

const GameWorld = (): JSX.Element => {
  const { camera, scene } = useThree();

  const walls = useGameStore((s) => s.walls);
  const resolveCurrentWall = useGameStore((s) => s.resolveCurrentWall);
  const advanceWall = useGameStore((s) => s.advanceWall);
  const clearFlash = useGameStore((s) => s.clearFlash);

  const controlsRef = useRef<PointerLockControlsImpl | null>(null);
  const moveRef = useRef({ b: false, f: false, l: false, r: false });
  const lockedRef = useRef(false);
  const bulletsRef = useRef<BulletData[]>([]);
  const explodeRef = useRef<ExplodeData[]>([]);
  const targetsRef = useRef<TargetData[]>([]);
  const pendingRef = useRef(false);
  // Scratch vectors — allocated once, reused every frame
  const _fwd = useRef(new THREE.Vector3());
  const _right = useRef(new THREE.Vector3());
  const _up = useRef(new THREE.Vector3(0, 1, 0));
  // Physics
  const velY = useRef(0); // vertical velocity
  const groundRc = useRef(new THREE.Raycaster()); // dedicated ground raycaster

  // ── Camera start position — start high so it falls onto terrain ──
  useEffect(() => {
    camera.position.set(0, 10, 0);
    velY.current = 0;
  }, [camera]);

  // ── Spawn target cubes whenever walls list changes ──
  useEffect(() => {
    // Remove old cubes
    for (const t of targetsRef.current) {scene.remove(t.mesh);}
    targetsRef.current = [];
    pendingRef.current = false;

    for (let i = 0; i < walls.length; i++) {
      const pos = getCubePosition(i, walls.length);
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0x00_ff_00 }),
      );
      mesh.position.copy(pos);
      scene.add(mesh);
      targetsRef.current.push({ alive: true, id: walls[i].id, mesh });
    }
  }, [walls, scene]);

  // ── Cleanup on unmount ──
  useEffect(() => () => {
      for (const t of targetsRef.current) scene.remove(t.mesh);
      for (const b of bulletsRef.current) scene.remove(b.mesh);
      for (const e of explodeRef.current) scene.remove(e.mesh);
    }, [scene]);

  // ── Track pointer-lock state in a ref (no re-render needed) ──
  useEffect(() => {
    const handler = (): void => {
      lockedRef.current = !!document.pointerLockElement;
      // Clear movement keys on unlock so nothing keeps "held"
      if (!lockedRef.current) {
        moveRef.current = { b: false, f: false, l: false, r: false };
      }
    };
    document.addEventListener("pointerlockchange", handler);
    return () => document.removeEventListener("pointerlockchange", handler);
  }, []);

  // ── Keyboard movement ──
  useEffect(() => {
    const MOVE_KEYS = new Set([
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
      "ArrowUp",
      "ArrowLeft",
      "ArrowDown",
      "ArrowRight",
      "Space",
    ]);

    const down = (e: KeyboardEvent): void => {
      if (!MOVE_KEYS.has(e.code)) {return;}
      e.preventDefault();
      e.stopPropagation();
      if (!lockedRef.current) {return;}
      if (e.code === "KeyW" || e.code === "ArrowUp") {moveRef.current.f = true;}
      if (e.code === "KeyS" || e.code === "ArrowDown") {moveRef.current.b = true;}
      if (e.code === "KeyA" || e.code === "ArrowLeft") {moveRef.current.l = true;}
      if (e.code === "KeyD" || e.code === "ArrowRight") {moveRef.current.r = true;}
      if (e.code === "Space") {shoot();}
    };
    const up = (e: KeyboardEvent): void => {
      if (e.code === "KeyW" || e.code === "ArrowUp") {moveRef.current.f = false;}
      if (e.code === "KeyS" || e.code === "ArrowDown") {moveRef.current.b = false;}
      if (e.code === "KeyA" || e.code === "ArrowLeft") {moveRef.current.l = false;}
      if (e.code === "KeyD" || e.code === "ArrowRight") {moveRef.current.r = false;}
    };
    // Use capture phase so we get keys before anything else
    window.addEventListener("keydown", down, { capture: true });
    window.addEventListener("keyup", up, { capture: true });
    return () => {
      window.removeEventListener("keydown", down, { capture: true });
      window.removeEventListener("keyup", up, { capture: true });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mouse click to shoot ──
  useEffect(() => {
    const click = (e: MouseEvent): void => {
      if (e.button === 0 && lockedRef.current) {shoot();}
    };
    window.addEventListener("mousedown", click);
    return () => window.removeEventListener("mousedown", click);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fire a bullet from camera ──
  const shoot = (): void => {
    playSound("pass"); // laser substitute
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xADD8E6 }),
    );
    mesh.position.copy(camera.position);
    const velocity = camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(BULLET_SPEED);
    scene.add(mesh);
    bulletsRef.current.push({ mesh, traveled: 0, velocity });
  };

  // ── Spawn explosion particles at position ──
  const explode = (pos: THREE.Vector3): void => {
    playSound("hit");
    for (let i = 0; i < 30; i++) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array([-0.08, 0, 0, 0.08, 0, 0, 0, 0.1, 0]), 3),
      );
      geo.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 1, 2]), 1));
      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({
          color: 0xFFFF00,
          side: THREE.DoubleSide,
        }),
      );
      mesh.position.copy(pos);
      scene.add(mesh);
      explodeRef.current.push({
        mesh,
        rotAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
        rotSpeed: Math.random() * 0.1 + 0.005,
        traveled: 0,
        velocity: new THREE.Vector3(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
        )
          .normalize()
          .multiplyScalar(Math.random() * 0.05 + 0.01),
      });
    }
  };

  // ── Per-frame update ──
  const rc = useRef(new THREE.Raycaster());

  useFrame((_, delta) => {
    if (!lockedRef.current) {return;}

    const mv = moveRef.current;
    const anyMove = mv.f || mv.b || mv.l || mv.r;

    if (anyMove) {
      // Flat forward from camera yaw only
      camera.getWorldDirection(_fwd.current);
      _fwd.current.y = 0;
      _fwd.current.normalize();
      _right.current.crossVectors(_fwd.current, _up.current).normalize();

      const speed = MOVE_SPEED * delta;

      if (mv.f) {camera.position.addScaledVector(_fwd.current, speed);}
      if (mv.b) {camera.position.addScaledVector(_fwd.current, -speed);}
      if (mv.l) {camera.position.addScaledVector(_right.current, -speed);}
      if (mv.r) {camera.position.addScaledVector(_right.current, speed);}
    }

    // ── Terrain-following physics ──────────────────────────────────────────
    // Cast a ray straight down from above the player to find ground height
    groundRc.current.set(
      new THREE.Vector3(
        camera.position.x,
        camera.position.y + GROUND_RAY_ORIGIN_OFFSET,
        camera.position.z,
      ),
      new THREE.Vector3(0, -1, 0),
    );
    const groundHits = groundRc.current.intersectObjects(scene.children, true);
    // Filter to hits within range (ignore bullets / explosion particles by checking distance)
    const groundHit = groundHits.find(
      (h) => h.distance < GROUND_RAY_ORIGIN_OFFSET + GROUND_SNAP_MAX && h.distance > 0.01,
    );

    if (groundHit) {
      const groundY = groundHit.point.y;
      const targetY = groundY + PLAYER_EYE_HEIGHT;

      if (camera.position.y > targetY + 0.05) {
        // Above ground — apply gravity
        velY.current += GRAVITY * delta;
        camera.position.y += velY.current * delta;
        // Clamp so we don't fall through
        if (camera.position.y < targetY) {
          camera.position.y = targetY;
          velY.current = 0;
        }
      } else {
        // On or below ground — snap to surface and reset velocity
        camera.position.y = targetY;
        velY.current = 0;
      }
    } else {
      // No ground found — keep falling with gravity
      velY.current += GRAVITY * delta;
      camera.position.y += velY.current * delta;
    }

    // Bullet movement + hit detection
    for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
      const b = bulletsRef.current[i];
      b.mesh.position.add(b.velocity);
      b.traveled += BULLET_SPEED;

      if (b.traveled > BULLET_MAX_DIST) {
        scene.remove(b.mesh);
        bulletsRef.current.splice(i, 1);
        continue;
      }

      let hit = false;
      for (const target of targetsRef.current) {
        if (!target.alive) {continue;}
        rc.current.set(b.mesh.position, b.velocity.clone().normalize());
        const hits = rc.current.intersectObject(target.mesh);
        if (hits.length > 0 && hits[0].distance < 0.6) {
          const pos = target.mesh.position.clone();
          scene.remove(target.mesh);
          target.alive = false;

          scene.remove(b.mesh);
          bulletsRef.current.splice(i, 1);

          explode(pos);

          if (!pendingRef.current) {
            pendingRef.current = true;
            resolveCurrentWall("pass");
            window.setTimeout(() => {
              clearFlash();
              advanceWall();
              pendingRef.current = false;
            }, INTER_HIT_DELAY_MS);
          }

          hit = true;
          break;
        }
      }
      if (hit) {continue;}
    }

    // Explosion particle update
    for (let i = explodeRef.current.length - 1; i >= 0; i--) {
      const p = explodeRef.current[i];
      p.mesh.position.add(p.velocity);
      p.mesh.rotateOnWorldAxis(p.rotAxis, p.rotSpeed);
      p.traveled += p.velocity.length();
      if (p.traveled >= 2) {
        scene.remove(p.mesh);
        explodeRef.current.splice(i, 1);
      }
    }
  });

  return (
    <>
      <PointerLockControls ref={controlsRef} />
      <color attach="background" args={["#87ceeb"]} />
      <fog attach="fog" args={["#87ceeb", 20, 80]} />
      <ambientLight intensity={0.6} />
      <directionalLight castShadow intensity={1.4} position={[10, 20, 10]} />
      <InfiniteFloor />
    </>
  );
};

// ─── Pointer-lock blocker overlay ─────────────────────────────────────────────

interface BlockerProps {
  onLock: () => void;
}

const Blocker = ({ onLock }: BlockerProps): JSX.Element => (
  <div
    onClick={onLock}
    style={{
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.75)",
      color: "white",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Arial, sans-serif",
      inset: 0,
      justifyContent: "center",
      position: "fixed",
      zIndex: 10,
    }}
  >
    <div
      style={{
        fontSize: "clamp(1.5rem, 5vw, 3rem)",
        fontWeight: "bold",
        marginBottom: "1rem",
        textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
      }}
    >
      Click to Play
    </div>
    <p
      style={{
        fontSize: "clamp(0.8rem, 2vw, 1rem)",
        lineHeight: 1.8,
        margin: 0,
        textAlign: "center",
      }}
    >
      ESC — Menu
      <br />
      WASD / Arrows — Move
      <br />
      Left Mouse / Space — Fire
      <br />M — Music
    </p>
  </div>
);

// ─── Crosshair ────────────────────────────────────────────────────────────────

const Crosshair = (): JSX.Element => (
  <div
    style={{
      left: "50%",
      pointerEvents: "none",
      position: "fixed",
      top: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 5,
    }}
  >
    <div
      style={{
        background: "rgba(255,255,255,0.9)",
        height: 16,
        left: -1,
        position: "absolute",
        top: -8,
        width: 2,
      }}
    />
    <div
      style={{
        background: "rgba(255,255,255,0.9)",
        height: 2,
        left: -8,
        position: "absolute",
        top: -1,
        width: 16,
      }}
    />
  </div>
);

// ─── Scene (exported, rendered by GameScreen) ─────────────────────────────────

export const Scene = (): JSX.Element => {
  const score = useGameStore((s) => s.score);
  const walls = useGameStore((s) => s.walls);
  const currentWallIndex = useGameStore((s) => s.currentWallIndex);
  const showFlash = useGameStore((s) => s.showFlash);

  const [isLocked, setIsLocked] = useState(false);
  const [musicOn, setMusicOn] = useState(false);

  // Track pointer-lock state
  useEffect(() => {
    const handler = (): void => setIsLocked(!!document.pointerLockElement);
    document.addEventListener("pointerlockchange", handler);
    return () => document.removeEventListener("pointerlockchange", handler);
  }, []);

  // M key toggles music
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "m" || e.key === "M") {
        setMusicOn((prev) => {
          if (prev) {
            stopMusic();
            return false;
          }
          startMusic();
          return true;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const lockPointer = (): void => {
    document.querySelector("canvas")?.requestPointerLock();
  };

  return (
    <div style={{ height: "100vh", position: "relative", width: "100vw" }}>
      <Canvas
        camera={{
          far: 1000,
          fov: 75,
          near: 0.1,
          position: [0, 10, 0],
        }}
        gl={{ antialias: true }}
        shadows
        onCreated={({ gl }) => {
          gl.setPixelRatio(window.devicePixelRatio);
          gl.toneMapping = THREE.ReinhardToneMapping;
        }}
      >
        <GameWorld />
      </Canvas>

      {!isLocked && <Blocker onLock={lockPointer} />}

      {isLocked && (
        <>
          <Crosshair />
          <HUD
            currentWall={currentWallIndex + 1}
            flash={showFlash}
            score={score}
            totalWalls={walls.length}
          />
        </>
      )}
    </div>
  );
};
