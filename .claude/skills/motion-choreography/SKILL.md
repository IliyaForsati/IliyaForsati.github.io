---
name: motion-choreography
description: Design and implement entrance, scroll-driven and micro-interaction animation on this site with GSAP, ScrollTrigger, SplitText and Lenis (vanilla JS, vendored, no build). Use when adding or changing any reveal, timeline, scrubbed or pinned scroll effect, text split, count-up, magnetic or hover interaction, or when motion feels flat, janky or generic.
argument-hint: <what to animate>
---

# Motion choreography

Motion should make the résumé feel crafted and alive without ever standing between a
reader and the content.

Task: $ARGUMENTS

Read first: `assets/js/motion.js`, `assets/css/motion.css`, `assets/js/main.js` (boot
order, how the libraries load) and the invariants in `CLAUDE.md`.

## Direction before code

1. In one or two sentences, say what the motion *means* for this section — what it
   reveals or emphasises. If it means nothing, don't add it.
2. At most one signature moment per section; everything else is a quiet supporting
   reveal.
3. Plan the timeline before writing it: what moves first, how much things overlap,
   total length. A section's entrance stays under ~1.2 s, and nothing makes the reader
   wait for text.

## Engineering rules

- **Easing** — never linear or the default `ease`.
  - GSAP: `power3.out` / `power4.out` / `expo.out` for entrances, `power2.inOut` for
    scrubbed or draw-on, `back.out(1.4–2)` only for small markers,
    `elastic.out(1, 0.4)` only for a snap-back.
  - CSS: `var(--ease-out)` / `var(--ease-in-out)`. A new curve becomes a token in
    `tokens.css`, not an inline cubic-bezier.
- **Start states** — if CSS hides it (`.js [data-reveal]`), use `fromTo` and add
  `is-in` on complete. Never give SplitText chars a hidden start state in CSS.
- **Reveal vocabulary** — reuse `data-reveal` (`''`, `fade`, `left`, `scale`). A new
  variant goes into `motion.css` with both its hidden state and its reduced-motion
  override, never as a one-off inline style. Staggered groups are registered in the
  parent/child list inside `initMotion()`.
- **Text splitting** — SplitText with `mask: 'lines'` for masked rises (as on the hero
  name). Split by words for anything longer than a name. The text must stay selectable
  and readable by screen readers: check the result in the accessibility tree.
- **Scroll-linked**
  - Use `scrub: true`, or a number between 0.5 and 1 for smoothing.
  - Pin only with a clear reason and only above ~864 px wide; on mobile a pinned
    section becomes a trap.
  - Lenis is driven from `gsap.ticker` and calls `ScrollTrigger.update`. Keep that
    wiring and never add a second scroll rAF loop.
- **Layout shifts** — anything that changes layout after load (fonts, charts
  re-rendering, images) must be followed by `ScrollTrigger.refresh()`. `main.js`
  already refreshes on resize and on `document.fonts.ready`; hook new async content
  into the same path.
- **GPU-friendly** — animate only transform, opacity and clip-path. Never width,
  height, top, left or box-shadow on scroll. Use `will-change` only on elements that
  animate repeatedly, and remove it when they're done.
- **Micro-interactions**
  - Magnetic pull comes from the existing `.magnetic` class, for `pointer: fine` only.
  - Cursor-tracked spotlight or tilt works only through CSS custom properties
    (`--mx`, `--my`) set in a `throttleFrame` handler.
  - No layout reads inside per-event loops.
  - At most one such effect per component.

## Fallbacks (required for every change)

- `settle()` puts the new element in its final state.
- The reduced-motion block in `motion.css` covers it.
- With GSAP blocked, the element is still visible (`shoot.py --no-motion-libs`).
- Count-ups: the DOM text is already the final value, and the animation only runs
  over it.

## Verify

Run the site locally and check at 1440×900 and 390×844:
- the first load
- a slow scroll through every section you touched
- a nav-link jump, and scrolling back up
- a resize and a theme switch
- reduced motion, and GSAP blocked

Use `.claude/skills/visual-polish/shoot.py` for screenshots
(`--reduced-motion`, `--no-motion-libs`, `--section <id>`). Report what you actually
observed, including flashes of hidden content, double-playing animations or jank. Don't
claim smoothness you didn't see.
