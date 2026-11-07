---
name: visual-polish
description: Audit and raise the visual quality of this site — typography, spacing rhythm, depth, texture, light/dark parity, responsive layout — by looking at the real rendered page in a headless browser at desktop and mobile sizes. Use for any visual redesign or polish task, to verify any UI change visually, or when asked how something on the site looks.
argument-hint: <section or element to polish>
---

# Visual polish

Task: $ARGUMENTS

## 1. Look before touching

Take a baseline first, so every change is judged against it. Keep screenshots in a
scratch directory outside the repo; they are never committed.

```bash
python3 -m http.server 8000 --directory <repo root>      # run in background
python3 .claude/skills/visual-polish/shoot.py --out <scratch>/before --section education
python3 .claude/skills/visual-polish/shoot.py --out <scratch>/before --full
```

`shoot.py` captures desktop 1440×900 and mobile 390×844 in light and dark. Before
capturing, it scrolls through the page so once-only reveals have fired. It prints
console errors, page errors, failed requests and elements that overflow the viewport
horizontally, and exits non-zero if it found any.

Flags:
- `--reduced-motion` emulates reduced motion.
- `--no-motion-libs` blocks `vendor/*.js` to test the no-GSAP fallback.
- `--only desktop|mobile` and `--theme light|dark` narrow the set.

Read the PNGs afterwards. A full-page shot is an overview only; judge details from
`--section` shots.

It needs Python Playwright: `pip install playwright && python3 -m playwright install chromium`.
If that's missing, say so and ask the user before installing.

## 2. Audit checklist

- **Hierarchy** — one clear focal point per section.
  - Display type is tight: letter-spacing −0.02 to −0.04em, line-height ~0.9–1.05.
  - Body text uses `--lh-body`, with a max width of `--measure`.
  - Instrument Serif italic is the accent voice and mono is for labels and data. Don't
    add new font families.
- **Rhythm** — spacing comes from the existing scale (`--section-pad`, `--gutter`, rem
  steps). Keep the gap between section-head and content the same in every section,
  with edges aligned across sections.
- **Depth** — hairlines (`--rule`) plus `--shadow-card` / `--shadow-pop`, never heavy
  drop shadows. Allowed upgrades, each checked in both themes:
  - 1 px gradient borders through a mask
  - an inset top highlight in dark mode (`inset 0 1px 0 rgb(255 255 255 / .06)`)
  - soft accent washes (`--accent-wash`)
- **Texture & atmosphere** — the grain overlay and hero lattice already exist. Tune
  them with `--grain-opacity` / `--lattice-opacity` rather than stacking new layers. An
  ambient blurred gradient is fine if it is subtle, `pointer-events: none`, and doesn't
  lower text contrast.
- **Colour** — tokens only. A new colour gets a light value on `:root` and the same
  dark value in *both* dark blocks. Contrast: text ≥ 4.5:1, UI marks ≥ 3:1, measured
  on the surface they sit on. Don't hand-tune the chart palette.
- **States** — hover, focus-visible, active and disabled for every control. The focus
  ring must be visible in both themes.
- **Responsive**
  - no horizontal scroll at 390 px
  - tap targets ≥ 44 px
  - the nav panel is usable
  - charts are legible (they re-render at their true width)
- **Consistency** — radii from `--r-*`, icon stroke 1.6–1.7, one button language
  throughout.

## 3. Change, then prove it

- Make the smallest set of token/CSS changes that fixes what the screenshots show.
  Prefer changing a token to overriding it inside a section.
- Re-shoot to `<scratch>/after`, compare against the baseline, and report concretely
  what changed and what still looks off. Never claim a visual result you haven't
  looked at.
