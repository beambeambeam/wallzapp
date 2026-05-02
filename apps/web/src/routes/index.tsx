import { createFileRoute } from "@tanstack/react-router";

import { GameApp } from "@/components/screens/game-app";

function HomeComponent() {
  return <GameApp />;
}

export const Route = createFileRoute("/")({
  component: HomeComponent,
});
