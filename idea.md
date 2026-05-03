# WallzApp — Game Design Ideas

## Core Loop Problem (Current State)
- Fixed 10 walls per round, same difficulty throughout
- No progression within a run — wall 1 feels identical to wall 10
- Result screen just shows score, then dumps you back to menu
- No reason to play again beyond beating your own score mentally

---

## 1. Progression & Difficulty Scaling

### Dynamic Speed Ramp
Instead of a flat `wallSpeed` per difficulty, speed increases as the run goes on.
- Start at 60% of the difficulty's base speed, ramp to 130% by the final wall
- Players feel momentum building — the last few walls should feel like a sprint

### Streak Multiplier
Consecutive passes multiply the score:
- 1× base, 2× at 3 in a row, 3× at 5 in a row, 5× at 8 in a row
- Losing a streak resets the multiplier — creates tension every wall

### Endless Mode
After finishing 10 walls, instead of ending the game, speed and complexity keep increasing until the player fails. Score is measured by how far they survive. No natural endpoint = "one more try" loop.

---

## 2. Feedback & Juice

### Timing Grade Per Wall
Instead of binary pass/fail, show a timing grade:
- **PERFECT** (within 50ms) — extra points, strong visual flash
- **GOOD** (within leniency) — normal pass
- **MISS** — fail

Players chase PERFECT ratings, not just passes.

### Combo Visual Effects
When on a streak, add escalating effects:
- Screen edges glow more intensely
- Wall approach speed pulse on the beat
- Character model could flash or emit particles

### Death Replay
On a miss, briefly show what pose the wall required vs. what the player did. Makes failure feel fair and informative rather than frustrating.

### Better Result Screen
Current screen just lists pass/fail per wall. Replace with:
- Accuracy % per wall (timing offset visualized as a bar)
- Best streak
- Grade (S/A/B/C/F) based on overall timing quality
- Personal best comparison

---

## 3. Retention Hooks

### Daily Challenge
A fixed seed generates the same wall sequence for everyone on a given day. One attempt per day. Share your score. Creates social pressure and a reason to return daily.

### Personal Best & High Score
Currently there's no persistence. Store best score per difficulty in `localStorage`. Show it on the result screen and difficulty select. The gap between current score and personal best is a pull to retry.

### Ghost Mode
Record the player's arm timing inputs from their best run. Replay it as a transparent ghost character alongside the current run. Racing yourself is more motivating than racing an abstract number.

---

## 4. New Game Mechanics

### Both Arms Required
Currently each wall only requires one arm at a time. Introduce walls where **both arms** must be tucked simultaneously — higher complexity, harder timing, worth more points.

### Hold Walls
A wall that requires an arm to stay tucked for an extended time (2–3 seconds) while the wall slowly passes through. Tests sustained attention, not just reaction.

### Fake-Out Walls
A wall that shows a required pose but has a gap large enough to walk through regardless — players who over-react by tucking unnecessarily get penalized. Tests reading, not just reacting.

### Wall Patterns (Sequences)
Pre-designed sequences of 3–5 walls that form a "pattern" — like a rhythm game phrase. Patterns repeat with increasing speed, so players can learn and master them.

---

## 5. Meta Progression

### Unlockable Characters
Completing a difficulty unlocks a new character model. Gives a tangible reward for finishing a run, not just a score.

### Skins / Themes
Unlock different stage themes (neon, winter, sunset) by achieving score thresholds. The environment itself changes — keeps runs visually fresh.

### Achievement Badges
Small one-time achievements shown on the result screen:
- "First Perfect" — first PERFECT timing
- "Flawless" — 10/10 pass with no MISS
- "Speed Demon" — finish hard mode under X seconds
- "Unstoppable" — 8+ streak

---

## Priority Order (Biggest Impact First)

1. **Streak multiplier + timing grade** — immediate juice, no architectural changes needed
2. **Speed ramp within a run** — one config change, huge feel difference
3. **Personal best persistence** — `localStorage`, minimal work, strong retention
4. **Endless mode** — remove the win condition, add survival scoring
5. **Daily challenge** — seeded RNG + one attempt per day
6. **Ghost mode** — record inputs, replay alongside current run
