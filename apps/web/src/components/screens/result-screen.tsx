import { Button } from "@wallzapp/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@wallzapp/ui/components/card";
import type { JSX } from "react";

import type { WallResult } from "@/types/game";

interface ResultScreenProps {
  score: number;
  totalWalls: number;
  wallResults: WallResult[];
  onRetry: () => void;
  onMainMenu: () => void;
}

export const ResultScreen = ({
  score,
  totalWalls,
  wallResults,
  onRetry,
  onMainMenu,
}: ResultScreenProps): JSX.Element => (
  <main className="grid min-h-screen place-items-center bg-linear-to-b from-amber-100 via-rose-50 to-sky-100 p-4">
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="text-3xl">Results: {score} / 10</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {wallResults.map((result, index) => (
            <div
              className={`rounded-md p-2 text-center text-sm font-semibold ${
                result === "pass" ? "bg-green-500 text-white" : "bg-red-500 text-white"
              }`}
              key={`result-${index + 1}`}
            >
              Wall {index + 1}: {result.toUpperCase()}
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Final Score: {score} out of {totalWalls}
        </p>

        <div className="flex gap-3">
          <Button onClick={onRetry}>Retry</Button>
          <Button onClick={onMainMenu} variant="outline">
            Main Menu
          </Button>
        </div>
      </CardContent>
    </Card>
  </main>
);
