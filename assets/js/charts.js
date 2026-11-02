/**
 * Charts, hand-built as inline SVG.
 *
 * Both charts re-render at the container's true pixel width rather than being
 * scaled by the browser, so label text keeps its real size at every viewport.
 *
 * Specs follow the dataviz skill: 2px lines with round joins, markers r>=4 with
 * a 2px surface ring, bars capped at 24px with a 4px rounded data-end and a
 * square baseline end, solid hairline gridlines (dashes are reserved for the
 * one actual threshold line), and no text ever wearing a series colour.
 */

import { $, el, clamp } from './util.js';
import { GPA_SERIES, BENCHMARKS } from '../data/transcript.js';
import { EDUCATION } from '../data/resume.js';

const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== null && v !== undefined) n.setAttribute(k, String(v));
  }
  return n;
};

/** Approximate text width — enough to decide whether a label fits in a mark. */
const textWidth = (str, px, mono = false) => str.length * px * (mono ? 0.6 : 0.56);

/* ── tooltip ──────────────────────────────────────────────────────────────── */
function makeTooltip(wrap) {
  const tip = el('div', { class: 'tip', role: 'status', 'aria-live': 'polite' });
  wrap.append(tip);
  return {
    node: tip,
    /**
     * Convert a point in SVG user units into pixels relative to the wrapper.
     * The SVG sits inside the chart's padding and may be horizontally scrolled,
     * so its own box — not the wrapper's — is the reference.
     */
    toWrap(svg, sx, sy, W, H) {
      const s = svg.getBoundingClientRect();
      const w = wrap.getBoundingClientRect();
      return [s.left - w.left + (sx / W) * s.width, s.top - w.top + (sy / H) * s.height];
    },
    show(x, y, html) {
      tip.innerHTML = html;
      // keep the tooltip inside the wrapper instead of letting it clip
      const w = wrap.clientWidth;
      const half = tip.offsetWidth / 2;
      tip.style.left = `${clamp(x, half + 4, w - half - 4)}px`;
      tip.style.top = `${y}px`;
      tip.dataset.show = 'true';
    },
    hide() {
      tip.dataset.show = 'false';
      // park it inside the wrapper so it can never extend the page box
      tip.style.left = '0px';
      tip.style.top = '0px';
    },
  };
}

/* ── 1. GPA progression — two series, one axis ───────────────────────────── */
function drawGpaChart(fig) {
  const scroll = $('.chart__scroll', fig);
  const wrap = fig.closest('.chart-wrap');
  if (!scroll || !wrap) return;

  const tip = makeTooltip(wrap);
  const data = GPA_SERIES;

  const render = () => {
    tip.hide();
    const W = Math.max(scroll.clientWidth || 0, 448);
    const H = 340;
    // right margin holds both the cumulative end-label and the "Dept. 17.49"
    // reference label; 64px clipped the latter.
    const m = { t: 28, r: 92, b: 40, l: 44 };
    const iw = W - m.l - m.r;
    const ih = H - m.t - m.b;

    // One shared 0–20 grade scale. The window is 16–20 so the trend is legible;
    // this is a line chart, where a framed window is honest — bars would not be.
    const Y0 = 16, Y1 = 20;
    const x = (i) => m.l + (data.length === 1 ? iw / 2 : (i * iw) / (data.length - 1));
    const y = (v) => m.t + ih - ((v - Y0) / (Y1 - Y0)) * ih;

    const svg = svgEl('svg', {
      class: 'chart__plot', width: W, height: H,
      viewBox: `0 0 ${W} ${H}`, role: 'img',
      'aria-label':
        'Line chart of semester and cumulative grade point average across seven semesters, ' +
        'rising from 16.70 to a cumulative 18.35, with a perfect 20.00 semester in Spring 2025-26. ' +
        'The full figures are listed in the transcript table below.',
    });

    // gridlines + y ticks (solid hairlines)
    for (let v = Y0; v <= Y1; v += 1) {
      svg.append(svgEl('line', { class: 'ax-grid', x1: m.l, x2: m.l + iw, y1: y(v), y2: y(v) }));
      const t = svgEl('text', { class: 'ax-text ax-text--end', x: m.l - 10, y: y(v) + 4 });
      t.textContent = v.toFixed(0);
      svg.append(t);
    }

    // baseline
    svg.append(svgEl('line', { class: 'ax-line', x1: m.l, x2: m.l + iw, y1: y(Y0), y2: y(Y0) }));

    // department-average reference rule. Dashed *because* it is a threshold,
    // not a grid — the one place dashing carries meaning.
    const refY = y(BENCHMARKS.department);
    svg.append(svgEl('line', { class: 'ref-line', x1: m.l, x2: m.l + iw, y1: refY, y2: refY }));
    const refT = svgEl('text', { class: 'ref-text', x: m.l + iw + 8, y: refY + 3.5 });
    refT.textContent = `Dept. ${BENCHMARKS.department}`;
    svg.append(refT);

    // x tick labels
    data.forEach((d, i) => {
      const t = svgEl('text', { class: 'ax-text ax-text--mid', x: x(i), y: m.t + ih + 24 });
      t.textContent = d.short;
      svg.append(t);
    });

    // series paths
    const path = (key) => data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join(' ');
    const pSem = svgEl('path', { class: 'series-line series-line--1', d: path('semester') });
    const pCum = svgEl('path', { class: 'series-line series-line--2', d: path('cumulative') });
    svg.append(pCum, pSem);

    // markers — ringed in the surface colour so crossings stay readable
    data.forEach((d, i) => {
      svg.append(svgEl('circle', { class: 'series-dot series-dot--2', cx: x(i), cy: y(d.cumulative) }));
      svg.append(svgEl('circle', { class: 'series-dot series-dot--1', cx: x(i), cy: y(d.semester) }));
    });

    // Direct labels, used sparingly: the extreme (the perfect semester) and the
    // final cumulative value. Labelling both endpoints would collide — 18.30 and
    // 18.35 land on top of each other — so the extreme carries the story instead.
    const peak = data.reduce((best, d, i) => (d.semester > data[best].semester ? i : best), 0);
    const lblPeak = svgEl('text', { class: 'end-label ax-text--mid', x: x(peak), y: y(data[peak].semester) - 14 });
    lblPeak.textContent = data[peak].semester.toFixed(2);
    svg.append(lblPeak);

    const last = data.length - 1;
    const lblCum = svgEl('text', { class: 'end-label', x: x(last) + 10, y: y(data[last].cumulative) + 4 });
    lblCum.textContent = data[last].cumulative.toFixed(2);
    svg.append(lblCum);

    // ── hover / focus layer ────────────────────────────────────────────────
    const cross = svgEl('line', { class: 'crosshair', y1: m.t, y2: m.t + ih });
    const fSem = svgEl('circle', { class: 'series-dot series-dot--1 focus-dot', r: 6 });
    const fCum = svgEl('circle', { class: 'series-dot series-dot--2 focus-dot', r: 6 });
    svg.append(cross, fCum, fSem);

    const step = data.length > 1 ? iw / (data.length - 1) : iw;
    const hit = svgEl('rect', { class: 'hit', x: m.l - step / 2, y: m.t, width: iw + step, height: ih });
    svg.append(hit);

    let active = -1;
    const focusIndex = (i) => {
      if (i < 0 || i >= data.length) return;
      active = i;
      const d = data[i];
      fig.dataset.active = 'true';
      cross.setAttribute('x1', x(i));
      cross.setAttribute('x2', x(i));
      fSem.setAttribute('cx', x(i)); fSem.setAttribute('cy', y(d.semester));
      fCum.setAttribute('cx', x(i)); fCum.setAttribute('cy', y(d.cumulative));
      const [px, py] = tip.toWrap(svg, x(i), Math.min(y(d.semester), y(d.cumulative)) - 6, W, H);
      tip.show(px, py,
        `<p class="tip__title">${d.label}</p>
         <p class="tip__row"><span class="tip__key"><span class="tip__swatch" style="background:var(--series-1)"></span>Semester</span><span class="tip__num">${d.semester.toFixed(2)}</span></p>
         <p class="tip__row"><span class="tip__key"><span class="tip__swatch" style="background:var(--series-2)"></span>Cumulative</span><span class="tip__num">${d.cumulative.toFixed(2)}</span></p>
         <p class="tip__row"><span class="tip__key">Units</span><span class="tip__num">${d.units}</span></p>`);
    };
    const blur = () => { active = -1; fig.dataset.active = 'false'; tip.hide(); };

    const nearest = (clientX) => {
      const r = svg.getBoundingClientRect();
      const px = ((clientX - r.left) / r.width) * W;
      let best = 0;
      data.forEach((_, i) => { if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i; });
      return best;
    };

    hit.addEventListener('pointermove', (e) => focusIndex(nearest(e.clientX)));
    hit.addEventListener('pointerleave', blur);
    hit.addEventListener('pointerdown', (e) => focusIndex(nearest(e.clientX)));

    // Keyboard reaches exactly what hover reaches.
    svg.setAttribute('tabindex', '0');
    svg.addEventListener('focus', () => focusIndex(active < 0 ? 0 : active));
    svg.addEventListener('blur', blur);
    svg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { focusIndex(Math.min(data.length - 1, active + 1)); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { focusIndex(Math.max(0, active - 1)); e.preventDefault(); }
      else if (e.key === 'Home') { focusIndex(0); e.preventDefault(); }
      else if (e.key === 'End') { focusIndex(data.length - 1); e.preventDefault(); }
      else if (e.key === 'Escape') blur();
    });

    scroll.replaceChildren(svg);
    return { svg, lines: [pCum, pSem] };
  };

  return { render, scroll };
}

/* ── 2. AI coursework — one series, true 0–20 baseline ───────────────────── */
function drawAiChart(fig) {
  const scroll = $('.chart__scroll', fig);
  const wrap = fig.closest('.chart-wrap');
  if (!scroll || !wrap) return;

  const tip = makeTooltip(wrap);
  const data = EDUCATION.aiCoursework;

  const render = () => {
    tip.hide();
    const W = Math.max(scroll.clientWidth || 0, 320);
    const narrow = W < 560;
    const nameW = narrow ? 0 : 210;      // name gutter collapses on small screens
    const rowH = narrow ? 52 : 40;
    const barH = Math.min(24, rowH - 18); // cap bars at 24px; the rest is air
    const m = { t: narrow ? 8 : 4, r: 16, b: 34, l: 0 };
    const H = m.t + data.length * rowH + m.b;
    const trackX = m.l + nameW;
    const trackW = W - trackX - m.r;

    // Bars carry magnitude, so the axis starts at a true zero.
    const X0 = 0, X1 = 20;
    const bx = (v) => trackX + ((v - X0) / (X1 - X0)) * trackW;

    const svg = svgEl('svg', {
      class: 'chart__plot', width: W, height: H,
      viewBox: `0 0 ${W} ${H}`, role: 'img',
      'aria-label':
        'Bar chart of six AI-related course grades on a 0 to 20 scale: ' +
        data.map((d) => `${d.title} ${d.grade.toFixed(1)}`).join(', ') + '.',
    });

    // vertical gridlines at clean values
    for (let v = 0; v <= 20; v += 5) {
      svg.append(svgEl('line', { class: v === 0 ? 'ax-line' : 'ax-grid', x1: bx(v), x2: bx(v), y1: m.t, y2: m.t + data.length * rowH }));
      const t = svgEl('text', { class: 'ax-text ax-text--mid', x: bx(v), y: m.t + data.length * rowH + 20 });
      t.textContent = String(v);
      svg.append(t);
    }

    data.forEach((d, i) => {
      const yTop = m.t + i * rowH + (rowH - barH) / 2 + (narrow ? 8 : 0);
      const g = svgEl('g', { class: 'bar-group', tabindex: '0', role: 'listitem' });
      g.setAttribute('aria-label', `${d.title}, ${d.grade.toFixed(1)} out of 20`);

      if (narrow) {
        const n = svgEl('text', { class: 'bar-name', x: trackX, y: m.t + i * rowH + 12 });
        n.textContent = d.title;
        g.append(n);
      } else {
        const n = svgEl('text', { class: 'bar-name ax-text--end', x: nameW - 14, y: yTop + barH / 2 + 4 });
        n.textContent = d.title;
        g.append(n);
      }

      // 4px rounded data-end, square at the baseline.
      const w = Math.max(bx(d.grade) - trackX, 1);
      const r = Math.min(4, w);
      const yb = yTop + barH;
      g.append(svgEl('path', {
        class: 'bar',
        d: `M${trackX},${yTop} H${trackX + w - r} A${r},${r} 0 0 1 ${trackX + w},${yTop + r} V${yb - r} A${r},${r} 0 0 1 ${trackX + w - r},${yb} H${trackX} Z`,
      }));

      // Value label: inside the bar end when it genuinely fits with padding,
      // otherwise just past the tip — never clipped.
      const label = d.grade.toFixed(1);
      const need = textWidth(label, 11.5, true) + 20;
      const inside = w > need;
      const vt = svgEl('text', {
        class: 'bar-label',
        x: inside ? trackX + w - 10 : trackX + w + 8,
        y: yTop + barH / 2 + 4,
        'text-anchor': inside ? 'end' : 'start',
        // inside a saturated fill, text takes white for contrast
        style: inside ? 'fill:#fff' : '',
      });
      vt.textContent = label;
      g.append(vt);

      const showTip = () => {
        const [px, py] = tip.toWrap(svg, trackX + w / 2, yTop, W, H);
        tip.show(px, py,
          `<p class="tip__title">${d.title}</p>
           <p class="tip__row"><span class="tip__key">${d.code}</span><span class="tip__num">${label} / 20</span></p>`);
      };
      g.addEventListener('pointerenter', showTip);
      g.addEventListener('focus', showTip);
      g.addEventListener('pointerleave', tip.hide);
      g.addEventListener('blur', tip.hide);

      svg.append(g);
    });

    scroll.replaceChildren(svg);
    return { svg };
  };

  return { render, scroll };
}

/* ── boot ─────────────────────────────────────────────────────────────────── */
export function initCharts() {
  const charts = [];
  const gpa = drawGpaChart($('#gpaChart'));
  const ai = drawAiChart($('#aiChart'));
  if (gpa) charts.push(gpa);
  if (ai) charts.push(ai);

  const out = charts.map((c) => ({ ...c, result: c.render() }));

  // Re-render at the new true width instead of letting the browser scale text.
  if ('ResizeObserver' in window) {
    let last = new WeakMap();
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const c = out.find((o) => o.scroll === entry.target);
        if (!c) continue;
        const w = Math.round(entry.contentRect.width);
        if (last.get(entry.target) === w) continue;
        last.set(entry.target, w);
        c.result = c.render();
      }
    });
    out.forEach((c) => ro.observe(c.scroll));
  }

  return out;
}
