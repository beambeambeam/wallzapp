import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";

import { GameApp } from "@/components/screens/game-app";
import { useGameStore } from "@/store/game-store";

describe("GameApp flow smoke", () => {
  beforeEach(() => {
    useGameStore.getState().resetToMenu();
  });

  test("can go from difficulty selection to countdown start", () => {
    render(<GameApp />);

    fireEvent.click(screen.getByRole("button", { name: "Play" }));

    expect(screen.getByText("Select Difficulty")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Start Easy" }));

    expect(useGameStore.getState().screen).toBe("countdown");
    expect(useGameStore.getState().walls).toHaveLength(10);
  });
});
