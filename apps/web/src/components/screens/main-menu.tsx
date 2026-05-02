import { Button } from "@wallzapp/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@wallzapp/ui/components/card";
import type { JSX } from "react";

interface MainMenuProps {
  onPlay: () => void;
}

export const MainMenu = ({ onPlay }: MainMenuProps): JSX.Element => (
  <main className="grid min-h-screen place-items-center bg-linear-to-b from-sky-200 via-cyan-100 to-amber-100 p-4">
    <Card className="w-full max-w-2xl border-black/15 bg-white/80 shadow-xl backdrop-blur">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Hole In The Wall 3D</CardTitle>
        <CardDescription>
          Match the wall pose before it reaches you. Press <strong>A</strong> to toggle left arm and
          <strong> D</strong> to toggle right arm between out and down-tuck.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={onPlay} size="lg">
          Play
        </Button>
      </CardContent>
    </Card>
  </main>
);
