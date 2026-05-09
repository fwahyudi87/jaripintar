# JariPintar — Belajar Mengetik Anak

## Stack

- **Framework:** React 18 + Vite 6 SPA (no backend)
- **State:** React Context + `sessionStorage` — reset on tab close
- **Assets:** SVG/emoji confetti, inline styles (no CSS modules), Google Fonts via CDN
- **Fonts:** Fredoka (display), Quicksand (instruction), Comic Neue (target letters)
- **Audio:** planned via Howler.js (`package.json` dep, not wired yet)

## Commands

```
npm install      # install deps (howler.js, react, vite)
npm run dev      # start Vite dev server
npm run build    # production build
npm run preview  # preview production build
```

## UPDATE_ALL slash command

When asked `UPDATE_ALL`, execute these steps in order:

1. **Bump version** in `package.json` (patch: `0.2.0` → `0.2.1`, minor: `0.2.0` → `0.3.0`)
2. **Update `CHANGELOG.md`** — add new entry with bumped version + today's date + summary of changes since last release
3. **Rebuild** (`npm run build`) to verify no errors
4. **Git commit** all changes with message `"chore: v<new-version>"`
5. **Git push** to origin (use stored GitHub token or existing remote auth)

## Architecture

```
src/
├── context/GameContext.jsx    — all state: score, module locks, screen
├── components/
│   ├── GameScreen.jsx         — screen router (splash / letterHunt / balloonCatch / kiteCatch / rocketCatch)
│   ├── SplashScreen.jsx       — title + "MULAI MAIN!" button + fullscreen toggle
│   ├── OnScreenKeyboard.jsx   — 3-row QWERTY, blue/yellow hand zones, F/J anchor highlight
│   ├── ScoreBar.jsx           — back button + star score display
│   ├── LetterHunt.jsx         — Module 1: press correct letter, 8 rounds, auto-unlocks M2
│   ├── BalloonCatch.jsx       — Module 2: rAF balloon physics, 45s timer, type to pop
│   ├── KiteCatch.jsx          — Module 3: rAF kite physics, numbers 0-9, score ≥200 unlocks
│   └── RocketCatch.jsx        — Module 4: rAF rocket physics, mixed letters+numbers, score ≥400 unlocks
└── hooks/
    ├── useDebounce.js         — 200ms input debounce for keyboard mashing
    ├── useGameLoop.js         — requestAnimationFrame wrapper (start/stop via `running` flag)
    └── useLetterSound.js      — Web Speech API, Indonesian voice, lowercased text
```

## Module unlock chain

1. **LetterHunt** (M1) — 8 rounds correct → auto-unlocks BalloonCatch
2. **BalloonCatch** (M2) — 45s timer, 10pts per pop, cumulative score ≥200 → unlocks KiteCatch
3. **KiteCatch** (M3) — numbers 0-9, 15pts per catch, kite drifts sideways with sine-wave bob, score ≥400 → unlocks RocketCatch
4. **RocketCatch** (M4) — mixed letters+numbers (A-Z, 0-9), 20pts per catch, dark sky background

## Key constraints

- 100% client-side, no backend, no auth, no API calls
- Target: children aged 5–7, input debounced (150ms per key), no input freeze
- Game loop uses `requestAnimationFrame` for physics (balloons float up, kites drift sideways, rockets fly up)
- All game progress is session-only — lost on browser close/refresh
- Module unlocks are permanent within the session once triggered

## Important quirks

- `OnScreenKeyboard` listens for `keydown` on `window` + renders visual buttons; keyboard input is debounced at 150ms (already handled in component)
- `OnScreenKeyboard` accepts `showNumbers` prop — adds a number row (0-9) for Module 3 & 4
- `BalloonCatch`, `KiteCatch`, and `RocketCatch` use `useGameLoop` hook; set `running=false` to pause the loop (e.g. on game over)
- `BalloonCatch` and `KiteCatch` use `gameOverRef` to avoid stale closures in `handleKey` — always use refs for values inside rAF callbacks
- Both game components use inline SVG for object shapes — no image files needed
- `BalloonCatch` restart via "Main Lagi!" uses `gameKey` state to re-trigger `useEffect` for timers
- Session persistence is partial: profile (name, gender), score, & moduleXUnlocked persist; game state (objects, timer) does not
- No CSS modules or preprocessors — all styles are inline or `<style>` tags
- Audio (chime/boop) not implemented yet — `howler` is listed as dep but unused
- `useDebounce` hook is defined but unused (debounce is inline in `OnScreenKeyboard`)
- `useLetterSound` is memoized with `useCallback` — must be stable to avoid re-creating keyboard event listeners every frame
- Letter sounds use Web Speech API (`speechSynthesis`) with `id-ID` locale — no audio files needed, speaks lowercased text to avoid "Capital A" issue
- SplashScreen requires name before "MULAI MAIN!" button is enabled

## Source of truth

`PLAN.md` is the PRD. `AGENTS.md` takes precedence for agent workflow guidance.
