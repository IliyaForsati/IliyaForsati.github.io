# CLAUDE.md — iliyaforsati.github.io

Personal résumé site of Iliya Forsati (B.Sc. Computer Engineering, Sharif University
of Technology). Live at https://iliyaforsati.github.io — GitHub Pages serves the
root of `main` as-is (`.nojekyll`).

## Stack — and what it is not

- Hand-written HTML + CSS + native ES modules. **No build step, no framework, no
  package manager.** Don't introduce Next.js, React, Tailwind, TypeScript, Framer
  Motion or a bundler unless the user explicitly decides to migrate. Generic
  "creative frontend" advice that assumes that stack must be translated to vanilla.
- Motion: GSAP + ScrollTrigger + SplitText + Lenis, **vendored** in `vendor/` and
  loaded at runtime by `assets/js/main.js` as classic scripts (`window.gsap`, …).
  New libraries are vendored the same way (pinned version, minified file committed),
  never CDN-linked.
- Fonts are self-hosted in `assets/fonts/` (Inter, JetBrains Mono, Instrument Serif).
- Local dev: `python3 -m http.server 8000` → http://localhost:8000
  (`file://` doesn't work — ES modules need an HTTP origin).

## Where things live

- **Content**: `assets/data/resume.js`, `assets/data/transcript.js`. Text changes go
  here, never into markup or render code.
- `index.html` static shell and section skeletons · `render.js` fills them from data ·
  `charts.js` inline-SVG charts · `transcript.js` course table · `nav.js` nav,
  scroll-spy, theme toggle · `motion.js` choreography · `lattice.js` hero canvas ·
  `cat.js` the corner cat (own rAF loop; placement is CSS sticky in `cat.css`) ·
  `util.js` helpers (`el`, `$`, `$$`, `throttleFrame`, `lerp`, `clamp`).
- **CSS** order: `tokens.css` (every colour/type/space/motion token) → `base` →
  `layout` → `sections` → `charts` → `motion`.

## Invariants — don't break these

1. **Content never depends on motion.** Every word must be readable with JS off, with
   GSAP failing to load, and with `prefers-reduced-motion`. Hidden start states exist
   only under `.js` (see `motion.css`). Anything newly animated needs its final state
   in `settle()` (`motion.js`) and in the reduced-motion block of `motion.css`.
2. **GSAP: `fromTo`, not `from`,** for anything CSS already hides (`[data-reveal]`,
   `.hero__name`). `.from()` takes the current value as the end value → 0→0 →
   invisible forever.
3. **Colour only through tokens** in `tokens.css`: light on bare `:root`, dark defined
   twice (OS media query and `[data-theme='dark']`) — keep both dark blocks identical.
   Chart colours (`--series-*`, `--blue-*`) are a validated palette; don't hand-tune.
4. **Performance:** animate `transform` / `opacity` / `clip-path` only; rAF-throttle
   scroll and pointer handlers (`throttleFrame`); pause render loops when offscreen or
   the tab is hidden; cap DPR at 2.
5. **Accessibility:** keyboard reaches whatever hover reaches; visible focus in both
   themes; decoration is `aria-hidden`; text contrast ≥ 4.5:1, UI marks ≥ 3:1.
6. **Responsive:** no horizontal page scroll at 390 px. Check 390×844 and 1440×900,
   light and dark.
7. **Taste:** the audience is professors and admissions committees. Motion and effects
   support reading and never delay it. One memorable moment beats ten gimmicks.
8. **Public by default:** GitHub Pages serves every committed file, so nothing private
   goes in the repo. Email and phone are stored in parts and assembled at runtime —
   keep it that way.

## Project skills (`.claude/skills/`)

- `motion-choreography` — entrance, scroll-linked and micro-interaction animation.
- `visual-polish` — visual audit plus real browser screenshots (`shoot.py`).
- `interactive-canvas` — cursor/scroll-reactive canvas, WebGL, Rive or character work.

## Git

Commit identity is set in the repo's local config:
`Iliya Forsati <iliyaforsati2005@gmail.com>`. Don't change it, and don't commit with
the machine's global identity.
