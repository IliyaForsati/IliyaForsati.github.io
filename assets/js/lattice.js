/**
 * The hero backdrop: a slow drifting lattice of nodes joined by faint edges,
 * nudged away from the pointer. A quiet nod to the graphs this research is
 * about — deliberately low contrast so it never competes with the type.
 *
 * Cheap by construction: the node count scales with viewport area and is
 * capped, the canvas is sized to a capped DPR, and the loop stops whenever the
 * hero scrolls out of view or the tab is hidden.
 */

import { reduceMotion } from './util.js';

const MAX_NODES = 70;
const LINK_DIST = 132;

export function initLattice(canvas) {
  if (!canvas || reduceMotion()) return () => {};

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return () => {};

  let w = 0, h = 0, dpr = 1;
  let nodes = [];
  let raf = null;
  let visible = true;
  const pointer = { x: -9999, y: -9999, active: false };

  const colors = () => {
    const cs = getComputedStyle(document.documentElement);
    return {
      node: cs.getPropertyValue('--ink-3').trim() || '#898781',
      link: cs.getPropertyValue('--rule-strong').trim() || '#383835',
      accent: cs.getPropertyValue('--series-1').trim() || '#3987e5',
    };
  };
  let palette = colors();

  function size() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, Math.round(r.width));
    h = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = Math.min(MAX_NODES, Math.round((w * h) / 17000));
    nodes = Array.from({ length: target }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.17,
      vy: (Math.random() - 0.5) * 0.17,
      r: 0.9 + Math.random() * 1.5,
    }));
  }

  function frame() {
    raf = null;
    if (!visible) return;
    ctx.clearRect(0, 0, w, h);

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;

      // gentle repulsion from the pointer
      if (pointer.active) {
        const dx = n.x - pointer.x, dy = n.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 15000 && d2 > 1) {
          const f = (1 - d2 / 15000) * 0.55;
          const d = Math.sqrt(d2);
          n.x += (dx / d) * f;
          n.y += (dy / d) * f;
        }
      }
    }

    // edges
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > LINK_DIST * LINK_DIST) continue;
        const t = 1 - Math.sqrt(d2) / LINK_DIST;
        ctx.globalAlpha = t * 0.4;
        ctx.strokeStyle = palette.link;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // nodes — the few nearest the pointer pick up the accent
    for (const n of nodes) {
      const near = pointer.active && Math.hypot(n.x - pointer.x, n.y - pointer.y) < 110;
      ctx.globalAlpha = near ? 0.75 : 0.42;
      ctx.fillStyle = near ? palette.accent : palette.node;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }

  const start = () => { if (!raf && visible) raf = requestAnimationFrame(frame); };
  const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };

  size();
  start();

  const onResize = () => { size(); };
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
    pointer.active = true;
  };
  const onLeave = () => { pointer.active = false; };

  window.addEventListener('resize', onResize);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerleave', onLeave);
  window.addEventListener('themechange', () => { palette = colors(); });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { palette = colors(); });

  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    visible ? start() : stop();
  });

  // Stop entirely once the hero is off screen.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting && !document.hidden;
      visible ? start() : stop();
    }, { threshold: 0 });
    io.observe(canvas);
  }

  return () => {
    stop();
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerleave', onLeave);
  };
}
