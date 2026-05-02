import { Button } from "@wallzapp/ui/components/button";
import { Badge } from "@wallzapp/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@wallzapp/ui/components/card";
import type { JSX } from "react";

import { DIFFICULTY_CONFIG } from "@/constants/difficulty";
import type { Difficulty } from "@/types/game";

interface DifficultySelectProps {
  onBack: () => void;
  onChoose: (difficulty: Difficulty) => void;
}

const cards: { difficulty: Difficulty; label: string }[] = [
  { difficulty: "easy", label: "Easy" },
  { difficulty: "medium", label: "Medium" },
  { difficulty: "hard", label: "Hard" },
];

export const DifficultySelect = ({ onBack, onChoose }: DifficultySelectProps): JSX.Element => (
  <main className="grid min-h-screen place-items-center bg-linear-to-b from-cyan-100 via-white to-orange-100 p-4">
    <section className="w-full max-w-5xl space-y-6">
      <h1 className="text-center text-3xl font-bold">Select Difficulty</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const cfg = DIFFICULTY_CONFIG[card.difficulty];

          return (
            <Card key={card.difficulty}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-2xl">
                  {card.label}
                  <Badge variant={card.difficulty}>{card.label}</Badge>
                </CardTitle>
                <CardDescription>
                  Speed: {cfg.wallSpeed.toFixed(0)} | Reaction: {cfg.reactionSeconds}s
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => onChoose(card.difficulty)}>
                  Start {card.label}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Button onClick={onBack} variant="outline">
        Back
      </Button>
    </section>
  </main>
);
