# iliyaforsati.github.io

Personal résumé site for **Iliya Forsati** — B.Sc. Computer Engineering, Sharif
University of Technology.

Live at **https://iliyaforsati.github.io**

---

## What it is

A single scrolling page holding the full résumé plus the complete academic
transcript. Everything is readable by scrolling alone; the top bar is a shortcut,
never a requirement.

**No build step, no framework, no dependencies to install.** Hand-written HTML, CSS
and ES modules, served straight from the repository. Clone it, open `index.html`
through any static server, and that is the whole development loop.

---

## Editing content

All text and data live in two files. You should never need to touch markup or logic
to update the résumé:

| File | Holds |
|---|---|
| `assets/data/resume.js` | Profile, research interests, education, experience, publications, teaching, honors, skills, references, nav order |
| `assets/data/transcript.js` | Every course, every grade, semester GPAs, cohort benchmarks |

Replacing the PDF is just `assets/cv.pdf`.

### Adding your photo

Two steps:

1. Put the image at **`assets/img/portrait.jpg`**
2. In `assets/data/resume.js`, set `portrait: 'assets/img/portrait.jpg'`
   (it ships as `null`)

A portrait-orientation crop around 800×1000 works best. Until then the hero shows
an `IF` monogram, which is a deliberate fallback rather than a broken image — and
because the path is opt-in, the site makes no request for a photo that isn't there.
If the file is ever missing or fails to decode, the monogram comes back on its own.

---

## Running it locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly as a `file://` URL will **not** work — ES modules
require a real HTTP origin. Any static server is fine.

---

## Deploying

The repository *is* the site. GitHub Pages serves the default branch root:

1. **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**
2. Push to `main`. The site updates within a minute or two.

`.nojekyll` is present so GitHub serves the files as-is instead of running them
through Jekyll.

---

## Structure

```
index.html              the whole page
assets/
  css/   tokens  base  layout  sections  charts  motion  cat
  js/    main · render · charts · transcript · nav · motion · lattice · cat · util
  data/  resume.js · transcript.js      ← edit these
  fonts/ self-hosted woff2 (Inter, JetBrains Mono, Instrument Serif)
  cv.pdf
vendor/  gsap · ScrollTrigger · SplitText · lenis   (vendored, not CDN-linked)
```

Libraries are committed rather than loaded from a CDN, so the site does not depend
on a third-party host staying reachable.

---

## Design notes

**Motion is strictly an enhancement.** The scroll choreography uses GSAP +
ScrollTrigger with Lenis for smooth scrolling, but the page is built so that it
reads identically without them. If the libraries fail to load, or the visitor has
*Reduce Motion* enabled, or JavaScript is off entirely, every word is still on
screen — nothing is hidden behind an animation that might not run. All three paths
are covered by the test suite.

**The cat** (`assets/js/cat.js`, `assets/css/cat.css`) is a hand-drawn inline SVG
with no dependencies. It sits in the corner for the whole page and comes to rest on the
footer. That placement is CSS `position: sticky`, so it needs no scroll JavaScript.

- Its tail is a simulated chain of segments that swishes harder the faster you scroll.
- Its eyes follow the pointer.
- It dozes off when left alone.
- Hover makes it squint happily; a click makes it hop and shows a heart.

It is decorative (`aria-hidden`), costs well under a millisecond a frame, pauses when
the tab is hidden, and sits still under *Reduce Motion*. Its colours are the `--cat-*`
tokens in `tokens.css`.

**Charts are hand-built inline SVG**, not a charting library:

- *GPA by semester* — two series on one shared 0–20 scale (never a dual axis). The
  axis window is 16–20 so the trend is legible, which is honest for a line chart;
  the bar chart below it uses a true zero baseline, where it would not be.
- *AI coursework* — one hue for all six bars; colour carries no information the bar
  length already shows.
- The department average is a labelled reference rule, not a third series.
- The transcript table is also the charts' table view, so no value is reachable only
  through a tooltip. Both charts respond to keyboard as well as hover.

The palette is the `dataviz` reference instance, verified against this site's actual
light and dark surfaces: CVD separation ΔE 24.7 light / 26.8 dark against an ≥8
target, normal-vision 33.6 / 31.8 against an ≥15 floor, every mark ≥3:1 on its
surface. Don't hand-tune the hexes in `tokens.css` — re-run the validator.

**Transcript honesty.** Three withdrawn courses (each later retaken and passed) and
the five in-progress Fall 2026 courses are excluded from the default view because
they carry no grade, not to flatter the record — the *Show withdrawn & in progress*
toggle reveals every one of them, and nothing is deleted from the data.

---

## Browser support

Current Chrome, Safari, Firefox and Edge. Scroll animations use GSAP rather than
CSS `animation-timeline`, which is still unsupported in stable Firefox.
