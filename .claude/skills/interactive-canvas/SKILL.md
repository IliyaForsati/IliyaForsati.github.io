---
name: interactive-canvas
description: Build or modify cursor-, scroll- or touch-reactive graphics on this site — the hero lattice canvas, a mascot or character, Rive animations, WebGL/Three.js scenes, cursor followers. Use when adding anything that runs in a continuous render loop or reacts to pointer position.
argument-hint: <interactive element to build or change>
---

# Interactive canvas & character

Task: $ARGUMENTS

Reference implementation: `assets/js/lattice.js`. New interactive elements follow the
same shape: an `initX(canvas)` that returns early under reduced motion, a single loop,
offscreen pausing, and a teardown function.

## Choosing the tech

- **Generative 2D or graph-like** → Canvas 2D, like `lattice.js`. Cheapest option, no
  dependency.
- **A character with designed states** (eyes follow the cursor, reacts to hover or
  scroll) → **Rive** state machine.
  - It needs a `.riv` file authored in the Rive editor; code alone can't produce the
    character, so ask the user for the asset.
  - Use the plain web runtime (`@rive-app/canvas`), not the React one, vendored into
    `vendor/` at a pinned version together with its `.wasm`.
- **Real 3D** → the Three.js ES-module build, vendored into `vendor/` and wired up
  through an import map.
  - Only when the effect truly needs 3D.
  - Hero budget: about 150 KB gzipped JS plus assets.
- Ask before adding any dependency or asset over ~100 KB.

## Engineering rules

1. **Smoothing.** Never bind raw `clientX/Y` or scroll position straight to visuals.
   Event handlers store a target, and the loop eases toward it in a frame-rate
   independent way: `cur += (target - cur) * (1 - Math.exp(-k * dt))`, with `dt` in
   seconds and k ≈ 8–14. `lerp` from `util.js` is fine for fixed-step cases.
2. **One loop per element.** When GSAP is loaded, `gsap.ticker` may replace rAF so the
   element shares a frame with scrolling. Handlers only write state — no drawing and no
   layout reads.
3. **Pause when not visible.** Use an IntersectionObserver on the canvas plus
   `visibilitychange`. On resume, reset `dt` so nothing jumps.
4. **Size correctly.** Measure with `getBoundingClientRect`, cap DPR at 2, re-size on
   resize (ResizeObserver preferred), and scale the workload with area (see
   `MAX_NODES`).
5. **Theme-aware.** Read colours from CSS tokens with `getComputedStyle`. Refresh them
   on the `themechange` event and on the `prefers-color-scheme` media change.
6. **All pointer types.** Use pointer events (mouse, touch, pen). Touch has no hover,
   so define an idle behaviour, such as gentle autonomous motion. Never make an
   interaction the only way to see something.
7. **Rive inputs.**
   - Expose named state-machine inputs, e.g. `lookX`, `lookY`, `hoverCTA`,
     `scrollDepth`, `sleepy`.
   - Drive them from the smoothed values, with the whole mapping in one function.
   - Scroll-driven inputs read from ScrollTrigger or Lenis, never from a raw scroll
     listener.
8. **Fallbacks.**
   - Reduced motion → a static frame, or nothing.
   - If the runtime or asset fails, the static fallback (SVG or the `IF` monogram)
     stays visible. Never leave an empty box.
   - Decorative canvases get `aria-hidden="true"`.
9. **Cleanup.** Return a teardown that cancels the loop and removes every listener and
   observer.
10. **Budget.** A frame must stay well under 16 ms on a mid-range laptop, and O(n²)
    work (like the lattice edges) needs a cap on n. Measure frame time in the browser
    (`performance.now()` around the frame, or a Performance trace) and report the
    numbers, not impressions.

## Verify

- Take screenshots with `.claude/skills/visual-polish/shoot.py`.
- At desktop size, add a pointer test: Playwright `page.mouse.move` over the element,
  screenshot before and after.
- At the mobile viewport, check the touch/idle behaviour.
- Check `--reduced-motion` and `--no-motion-libs` to confirm the fallback shows.
