import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { JSX } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { GameApp } from "@/components/screens/game-app";
import { useKeyControls } from "@/hooks/use-key-controls";
import { useGameStore } from "@/store/game-store";

vi.mock("@/components/game/scene", () => ({
  Scene: (): JSX.Element => <div>scene mock</div>,
}));

const KeyControlsHarness = (): JSX.Element => {
  useKeyControls();

  return <div>key controls mounted</div>;
};

interface MockGamepadButton {
  pressed: boolean;
}

const createMockGamepad = (buttons: MockGamepadButton[]): Gamepad =>
  ({
    axes: [],
    buttons,
    connected: true,
    hapticActuators: [],
    id: "mock-gamepad",
    index: 0,
    mapping: "standard",
    timestamp: 0,
    vibrationActuator: null,
  }) as unknown as Gamepad;

const createMockButtons = (): MockGamepadButton[] =>
  Array.from({ length: 4 }, () => ({
    pressed: false,
  }));

describe("GameApp flow smoke", () => {
  let animationFrameTime = 0;
  let nextAnimationFrameId = 1;
  let animationFrameCallbacks: Map<number, FrameRequestCallback>;
  let gamepadButtons: MockGamepadButton[];

  beforeEach(() => {
    useGameStore.getState().resetToMenu();
    animationFrameTime = 0;
    nextAnimationFrameId = 1;
    animationFrameCallbacks = new Map();
    gamepadButtons = createMockButtons();
    vi.useFakeTimers();

    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: vi.fn((frameHandler: FrameRequestCallback) => {
        nextAnimationFrameId += 1;
        animationFrameCallbacks.set(nextAnimationFrameId, frameHandler);
        return nextAnimationFrameId;
      }),
      writable: true,
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: vi.fn((frameId: number) => {
        animationFrameCallbacks.delete(frameId);
      }),
      writable: true,
    });
    Object.defineProperty(navigator, "getGamepads", {
      configurable: true,
      value: vi.fn(() => [createMockGamepad(gamepadButtons), null, null, null]),
      writable: true,
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const advanceAnimationFrame = (elapsedMs: number): void => {
    expect(animationFrameCallbacks.size).toBeGreaterThan(0);
    animationFrameTime += elapsedMs;
    const currentCallbacks = [...animationFrameCallbacks.values()];
    animationFrameCallbacks.clear();

    act(() => {
      for (const frameHandler of currentCallbacks) {
        frameHandler(animationFrameTime);
      }
    });
  };

  const setGamepadButtonPressed = (index: number, pressed: boolean): void => {
    const button = gamepadButtons[index];

    if (!button) {
      throw new Error(`Missing mock gamepad button at index ${index}`);
    }

    button.pressed = pressed;
  };

  test("can go from difficulty selection to hold-to-start gate", () => {
    render(<GameApp />);

    fireEvent.click(screen.getByRole("button", { name: "Play" }));

    expect(screen.getByText("Select Difficulty")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Start Easy" }));

    expect(useGameStore.getState().screen).toBe("countdown");
    expect(useGameStore.getState().walls).toHaveLength(10);
    expect(screen.getByText("Hold both controls to start")).toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();
  });

  test("hold controls tuck and release arms only while playing", () => {
    render(<KeyControlsHarness />);

    fireEvent.keyDown(window, { key: "a" });
    fireEvent.keyDown(window, { key: "d" });

    expect(useGameStore.getState().leftArm).toBe("out");
    expect(useGameStore.getState().rightArm).toBe("out");

    act(() => {
      useGameStore.getState().goTo("playing");
    });

    advanceAnimationFrame(16);
    fireEvent.keyDown(window, { key: "a" });
    expect(useGameStore.getState().leftArm).toBe("tucked");
    expect(useGameStore.getState().rightArm).toBe("out");

    fireEvent.keyDown(window, { key: "d" });
    expect(useGameStore.getState().leftArm).toBe("tucked");
    expect(useGameStore.getState().rightArm).toBe("tucked");

    fireEvent.keyUp(window, { key: "a" });
    expect(useGameStore.getState().leftArm).toBe("out");
    expect(useGameStore.getState().rightArm).toBe("tucked");

    fireEvent.keyUp(window, { key: "d" });
    expect(useGameStore.getState().leftArm).toBe("out");
    expect(useGameStore.getState().rightArm).toBe("out");

    act(() => {
      useGameStore.getState().goTo("result");
    });

    fireEvent.keyDown(window, { key: "a" });
    fireEvent.keyDown(window, { key: "d" });

    expect(useGameStore.getState().leftArm).toBe("out");
    expect(useGameStore.getState().rightArm).toBe("out");
  });

  test("gamepad face buttons control arms only while playing and compose with keyboard input", () => {
    render(<KeyControlsHarness />);

    setGamepadButtonPressed(0, true);

    expect(animationFrameCallbacks.size).toBe(0);
    expect(useGameStore.getState().leftArm).toBe("out");
    expect(useGameStore.getState().rightArm).toBe("out");

    act(() => {
      useGameStore.getState().goTo("playing");
    });

    advanceAnimationFrame(16);
    expect(useGameStore.getState().leftArm).toBe("tucked");
    expect(useGameStore.getState().rightArm).toBe("out");

    setGamepadButtonPressed(0, false);
    setGamepadButtonPressed(2, true);
    advanceAnimationFrame(16);
    expect(useGameStore.getState().leftArm).toBe("tucked");

    setGamepadButtonPressed(2, false);
    advanceAnimationFrame(16);
    expect(useGameStore.getState().leftArm).toBe("out");

    setGamepadButtonPressed(1, true);
    advanceAnimationFrame(16);
    expect(useGameStore.getState().rightArm).toBe("tucked");

    setGamepadButtonPressed(1, false);
    setGamepadButtonPressed(3, true);
    advanceAnimationFrame(16);
    expect(useGameStore.getState().rightArm).toBe("tucked");

    fireEvent.keyDown(window, { key: "a" });
    expect(useGameStore.getState().leftArm).toBe("tucked");

    setGamepadButtonPressed(3, false);
    setGamepadButtonPressed(2, true);
    advanceAnimationFrame(16);
    expect(useGameStore.getState().leftArm).toBe("tucked");
    expect(useGameStore.getState().rightArm).toBe("out");

    setGamepadButtonPressed(2, false);
    advanceAnimationFrame(16);
    expect(useGameStore.getState().leftArm).toBe("tucked");

    fireEvent.keyUp(window, { key: "a" });
    expect(useGameStore.getState().leftArm).toBe("out");

    setGamepadButtonPressed(1, true);
    advanceAnimationFrame(16);
    expect(useGameStore.getState().rightArm).toBe("tucked");

    fireEvent.keyDown(window, { key: "d" });
    expect(useGameStore.getState().rightArm).toBe("tucked");

    fireEvent.keyUp(window, { key: "d" });
    expect(useGameStore.getState().rightArm).toBe("tucked");

    setGamepadButtonPressed(1, false);
    advanceAnimationFrame(16);
    expect(useGameStore.getState().rightArm).toBe("out");

    act(() => {
      useGameStore.getState().goTo("result");
    });

    setGamepadButtonPressed(0, true);
    expect(animationFrameCallbacks.size).toBe(0);
    expect(useGameStore.getState().leftArm).toBe("out");
    expect(useGameStore.getState().rightArm).toBe("out");
  });

  test("requires holding both controls before countdown starts and resets on early release", () => {
    render(<GameApp />);

    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    fireEvent.click(screen.getByRole("button", { name: "Start Easy" }));

    expect(screen.getByText("Hold both controls to start")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "a" });
    advanceAnimationFrame(250);
    expect(screen.getByText("Hold both controls to start")).toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: "d" });
    advanceAnimationFrame(200);
    expect(screen.queryByText("3")).not.toBeInTheDocument();

    fireEvent.keyUp(window, { key: "d" });
    advanceAnimationFrame(16);
    fireEvent.keyDown(window, { key: "d" });
    advanceAnimationFrame(499);
    expect(screen.queryByText("3")).not.toBeInTheDocument();

    advanceAnimationFrame(1);
    expect(screen.getByText("3")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(useGameStore.getState().screen).toBe("playing");
  });

  test("supports mixed keyboard and gamepad hold-to-start and applies the gate on retry", () => {
    render(<GameApp />);

    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    fireEvent.click(screen.getByRole("button", { name: "Start Easy" }));

    fireEvent.keyDown(window, { key: "a" });
    setGamepadButtonPressed(1, true);
    advanceAnimationFrame(16);
    advanceAnimationFrame(500);

    expect(screen.getByText("3")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(useGameStore.getState().screen).toBe("playing");

    act(() => {
      useGameStore.getState().goTo("result");
    });

    act(() => {
      useGameStore.getState().retryRound();
    });

    expect(useGameStore.getState().screen).toBe("countdown");
    expect(screen.getByText("Hold both controls to start")).toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();
  });
});
