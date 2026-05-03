# ElevenLabs Voice Prompts — WallzApp

Hyped game-show announcer voice. Think a carnival barker on energy drinks crossed
with a WWE hype-man. Loud, breathless, unpredictable. Occasionally stutters or
rushes words together. Every line should feel like it could snap at any moment.

---

## Voice Settings (ElevenLabs recommended)

| Setting | Value |
|---|---|
| Voice | Adam / Josh / Clyde (deep & punchy) |
| Stability | 0.18 – 0.25 (low = more chaotic variation) |
| Similarity Boost | 0.75 |
| Style Exaggeration | 0.80 – 1.00 |
| Speaker Boost | ON |

---

## PASS — Wall cleared successfully

Use for: `pass` sound event. Short, punchy, euphoric.

---

### pass_01
> "YEAH! Get in there!"

---

### pass_02
> "Ohhh BEAUTIFUL! Clean right through!"

---

### pass_03
> "YYYYES! You're a machine, baby!"

---

### pass_04
> "Through the wall! THROUGH THE WALL!"

---

### pass_05
> "That's it! That's the one! LET'S GO!"

---

### pass_06
> "Perfecto! Nailed it! Don't stop now!"

---

### pass_07
> "You read that wall like a BOOK! Incredible!"

---

### pass_08
> "BOOM! Right through! You're absolutely cooking!"

---

### pass_09
> "Slick! So slick! How'd you even DO that?!"

---

### pass_10
> "Oh oh oh OH — FLAWLESS! Keep it rollin'!"

---

## HIT / FAIL — Wall hit the player

Use for: `hit` sound event. Pained, mocking, dramatic. Like a crowd groaning.

---

### hit_01
> "OOOOoooh! That's gonna HURT!"

---

### hit_02
> "WHAM! Right in the face! Classic!"

---

### hit_03
> "Noooo! So CLOSE! You were RIGHT there!"

---

### hit_04
> "BONK! Ha! The wall says NO!"

---

### hit_05
> "Ohhhh the crowd WINCES! That looked painful!"

---

### hit_06
> "You had it! YOU HAD IT! And then— WHACK!"

---

### hit_07
> "SMACKED! Absolutely SMACKED by the wall!"

---

### hit_08
> "Oof! Oof oof OOF! That one's gonna leave a mark!"

---

### hit_09
> "The wall doesn't care, baby! The wall does NOT care!"

---

### hit_10
> "Demolished! Completely demolished by a slab of concrete!"

---

## TIER STEP-UP — Speed increases (endless mode)

Use for: when the game shifts to a new speed tier. Manic, escalating energy.

---

### tier_01 (Tier 1 → Heating Up)
> "Ooh, picking up the pace now! Can you handle it?!"

---

### tier_02 (Tier 2 → On Fire)
> "Things are getting SPICY! The walls are ANGRY now!"

---

### tier_03 (Tier 3 → Insane)
> "OHHH HERE WE GO! MAXIMUM OVERDRIVE! GOOD LUCK!"

---

## COUNTDOWN

Use for: the 3-second countdown before a round starts.

---

### countdown_3
> "Three!"

---

### countdown_2
> "Two!"

---

### countdown_1
> "ONE!"

---

### countdown_go
> "GO GO GO GO GO!"

---

### countdown_go_alt
> "MOVE IT! MOVE IT! MOVE IT!"

---

## GAME OVER — Endless mode death

Use for: transitioning to the result screen in endless mode.

---

### gameover_01
> "AND IT'S OVER! The wall wins! The wall ALWAYS wins!"

---

### gameover_02
> "You lasted that long?! Honestly? Respect. A little."

---

### gameover_03
> "ELIMINATED! By a wall! A WALL! Incredible!"

---

### gameover_04
> "Oh, that's a shame. That's a real, real shame. So close to glory!"

---

### gameover_05
> "Down goes the challenger! The wall remains UNDEFEATED!"

---

## COMBO / STREAK — Multiple passes in a row

Use for: 3+, 5+, 10+ pass streaks.

---

### streak_3
> "Three in a row! You're finding your RHYTHM!"

---

### streak_5
> "FIVE STRAIGHT! Nobody stopping you today, are they?!"

---

### streak_10
> "TEN! TEN WALLS! Are you even HUMAN?! What IS this?!"

---

## IDLE / WAITING — Before the wall arrives

Optional ambient hype lines during wall travel.

---

### idle_01
> "Here it comes... here it COMES..."

---

### idle_02
> "Get ready... get ready... GET READY!"

---

### idle_03
> "The wall is watching you. Are YOU watching the wall?"

---

### idle_04
> "Tick tock tick tock tick— NOW!"

---

### idle_05
> "It's moving fast... FASTER than last time... I think..."

---

## Notes for generation

- Record each clip separately, do not chain lines together
- Aim for 0.5–1.5 seconds per short exclamation, 2–3 seconds for longer calls
- Add a tiny bit of reverb (room size ~15%) in post to give "arena" feel
- Normalize to -3 dBFS
- Export as `.wav` 44.1 kHz 16-bit
- File naming convention: `{category}_{id}.wav` e.g. `pass_01.wav`, `hit_03.wav`, `tier_02.wav`
