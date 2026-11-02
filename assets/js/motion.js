/**
 * Scroll choreography: GSAP + ScrollTrigger for reveals, the hero sequence,
 * count-ups, and magnetic buttons.
 *
 * Everything here is an enhancement. If GSAP fails to load, or the visitor
 * prefers reduced motion, `settle()` drops every element straight to its final
 * state and the page reads exactly the same — just without the movement.
 */

import { $, $$, reduceMotion } from './util.js';

/** Put every animated element in its resting, fully-visible state. */
function settle() {
  $$('[data-reveal]').forEach((n) => n.classList.add('is-in'));
  $('#heroName')?.classList.add('is-ready');
  const portrait = $('#heroPortrait');
  if (portrait) portrait.style.clipPath = 'none';
  $$('[data-count]').forEach((n) => { n.textContent = n.dataset.count; });
  const rank = $('#rankFigure');
  if (rank) rank.textContent = '32';
}

/** Count a number up to its final value, preserving decimal places. */
function countUp(gsap, node, done) {
  const target = parseFloat(node.dataset.count);
  if (Number.isNaN(target)) return;
  const decimals = (node.dataset.count.split('.')[1] || '').length;
  const obj = { v: 0 };
  gsap.to(obj, {
    v: target,
    duration: 1.4,
    ease: 'power2.out',
    onUpdate: () => { node.textContent = obj.v.toFixed(decimals); },
    onComplete: () => { node.textContent = node.dataset.count; done?.(); },
  });
}

export function initMotion() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  if (!gsap || !ScrollTrigger || reduceMotion()) {
    settle();
    return { refresh: () => {} };
  }

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(window.SplitText);

  /* ---- hero ------------------------------------------------------------- */
  const heroName = $('#heroName');
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (window.SplitText && heroName) {
    // Masked per-character rise — the letters slide up out of their own line box.
    const split = new window.SplitText(heroName, {
      type: 'chars,lines',
      linesClass: 'line',
      charsClass: 'char',
      mask: 'lines',
    });
    heroName.dataset.split = 'done';
    heroName.classList.add('is-ready');
    // fromTo, not from: the end state is stated outright so nothing depends on
    // what the element happened to compute to when the tween was built.
    tl.fromTo(split.chars,
      { yPercent: 115, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.05, stagger: { each: 0.028, from: 'start' } });
  } else if (heroName) {
    heroName.classList.add('is-ready');
    tl.fromTo(heroName, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 });
  }

  // fromTo, not to: these carry [data-reveal] so CSS already has them at
  // opacity 0. A bare .to() would read the resting value and animate nothing.
  const reveal = (sel, at) =>
    tl.fromTo(sel,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.85, onComplete() { this.targets()[0]?.classList.add('is-in'); } },
      at);

  tl.from('.hero__eyebrow', { y: 14, opacity: 0, duration: 0.7 }, 0.1)
    .from('.hero__role', { y: 18, opacity: 0, duration: 0.8 }, 0.35);
  reveal('.hero__tagline', 0.5);
  reveal('.hero__facts', 0.62);
  reveal('.hero__cta', 0.72);
  tl.to('#heroPortrait', { clipPath: 'inset(0% 0% 0% 0% round var(--r-lg))', duration: 1.2, ease: 'power4.inOut' }, 0.3)
    .from('.hero__scroll', { opacity: 0, duration: 0.8 }, 1.0);

  // Portrait parallax — a small counter-drift as the hero leaves.
  const portrait = $('#heroPortrait');
  if (portrait && window.innerWidth > 864) {
    gsap.to(portrait, {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  /* ---- generic reveals --------------------------------------------------- */
  $$('[data-reveal]').forEach((node) => {
    if (node.closest('.hero')) return; // the hero runs on its own timeline
    ScrollTrigger.create({
      trigger: node,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(node, {
          opacity: 1, y: 0, x: 0, scale: 1,
          duration: 0.85,
          ease: 'power3.out',
          onComplete: () => node.classList.add('is-in'),
        });
      },
    });
  });

  // Staggered children inside grids/lists that reveal as a set.
  [['.interests__grid', '.interest'], ['.teaching', '.course'], ['.bullets', '.bullet'], ['.skills', '.skillrow']]
    .forEach(([parent, child]) => {
      const host = $(parent);
      if (!host) return;
      const kids = $$(child, host);
      if (!kids.length) return;
      ScrollTrigger.create({
        trigger: host,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(kids, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            stagger: 0.07,
            onComplete: () => kids.forEach((k) => k.classList.add('is-in')),
          });
        },
      });
    });

  /* ---- count-ups --------------------------------------------------------- */
  $$('[data-count]').forEach((node) => {
    ScrollTrigger.create({
      trigger: node,
      start: 'top 92%',
      once: true,
      onEnter: () => countUp(gsap, node),
    });
  });

  const rank = $('#rankFigure');
  if (rank) {
    ScrollTrigger.create({
      trigger: rank, start: 'top 90%', once: true,
      onEnter: () => {
        const obj = { v: 0 };
        gsap.to(obj, {
          v: 32, duration: 1.6, ease: 'power3.out',
          onUpdate: () => { rank.textContent = String(Math.round(obj.v)); },
          onComplete: () => { rank.textContent = '32'; },
        });
      },
    });
  }

  /* ---- chart draw-on ----------------------------------------------------- */
  // Re-queried on each run because the charts re-render on resize.
  const animateChart = (sel) => {
    ScrollTrigger.create({
      trigger: sel,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        const paths = $$(`${sel} .series-line`);
        paths.forEach((p, i) => {
          const len = p.getTotalLength();
          gsap.fromTo(p,
            { strokeDasharray: len, strokeDashoffset: len },
            { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut', delay: i * 0.12,
              onComplete: () => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; } });
        });
        gsap.from($$(`${sel} .series-dot:not(.focus-dot)`), { scale: 0, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2)', stagger: 0.03, delay: 0.5 });
        gsap.from($$(`${sel} .end-label`), { opacity: 0, duration: 0.6, delay: 1.3 });

        const bars = $$(`${sel} .bar`);
        if (bars.length) {
          gsap.from(bars, { scaleX: 0, transformOrigin: '0% 50%', duration: 0.9, ease: 'power3.out', stagger: 0.06 });
          gsap.from($$(`${sel} .bar-label`), { opacity: 0, duration: 0.5, stagger: 0.06, delay: 0.35 });
        }
      },
    });
  };
  animateChart('#gpaChart');
  animateChart('#aiChart');

  /* ---- magnetic buttons -------------------------------------------------- */
  if (window.matchMedia('(pointer: fine)').matches) {
    $$('.magnetic').forEach((btn) => {
      const strength = 0.28;
      const onMove = (e) => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, {
          x: (e.clientX - (r.left + r.width / 2)) * strength,
          y: (e.clientY - (r.top + r.height / 2)) * strength,
          duration: 0.5, ease: 'power3.out',
        });
      };
      const reset = () => gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      btn.addEventListener('pointermove', onMove);
      btn.addEventListener('pointerleave', reset);
      btn.addEventListener('blur', reset);
    });
  }

  return { refresh: () => ScrollTrigger.refresh() };
}

export { settle };
