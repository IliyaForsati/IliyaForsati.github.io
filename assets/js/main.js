/**
 * Boot sequence.
 *
 * Content renders first and unconditionally. The animation libraries are loaded
 * afterwards and are entirely optional: if any of them fail (blocked, offline,
 * stale cache) the page still renders, still scrolls, and still reads — it just
 * stops moving. Nothing below `renderAll()` is load-bearing for the résumé.
 */

import { $, reduceMotion, imageLoads } from './util.js';
import { PROFILE } from '../data/resume.js';
import { renderAll } from './render.js';
import { initCharts } from './charts.js';
import { initTranscript } from './transcript.js';
import { initNav } from './nav.js';
import { initMotion, settle } from './motion.js';
import { initLattice } from './lattice.js';

/** Load a classic script, resolving false rather than throwing on failure. */
const loadScript = (src) =>
  new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = src;
    s.defer = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.append(s);
  });

/**
 * Insert the portrait only when one is configured, and only keep it once the
 * image actually decodes — a missing or broken file leaves the monogram
 * standing rather than an empty frame. With PROFILE.portrait null, no request
 * is made at all.
 */
async function initPortrait() {
  const fig = $('#heroPortrait');
  if (!fig || !PROFILE.portrait) return;

  const img = new Image();
  img.id = 'portraitImg';
  img.src = PROFILE.portrait;
  img.alt = PROFILE.fullName;
  img.decoding = 'async';
  fig.prepend(img);

  const ok = await imageLoads(img);
  fig.dataset.empty = String(!ok);
  if (!ok) img.remove();
}

/** Lenis smooth scroll, with a native fallback when it isn't available. */
function initScroll() {
  const native = (target) => {
    const nav = $('#nav');
    const top = window.scrollY + target.getBoundingClientRect().top - (nav ? nav.offsetHeight : 0);
    window.scrollTo({ top, behavior: reduceMotion() ? 'auto' : 'smooth' });
  };

  if (!window.Lenis || reduceMotion()) return { scrollTo: native };

  const lenis = new window.Lenis({
    duration: 1.05,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6,
  });

  // Drive Lenis from GSAP's ticker when GSAP is present, so scroll-linked
  // animations and the scroll position advance on the same frame.
  if (window.gsap) {
    window.gsap.ticker.add((time) => lenis.raf(time * 1000));
    window.gsap.ticker.lagSmoothing(0);
    if (window.ScrollTrigger) lenis.on('scroll', window.ScrollTrigger.update);
  } else {
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  return {
    scrollTo: (target) => {
      const nav = $('#nav');
      lenis.scrollTo(target, { offset: -(nav ? nav.offsetHeight : 0), duration: 1.1 });
    },
    lenis,
  };
}

async function boot() {
  // 1. Content — never gated on anything external.
  renderAll();
  initTranscript();
  initCharts();
  initPortrait();

  // 2. Optional libraries.
  const wantsMotion = !reduceMotion();
  let loaded = false;
  if (wantsMotion) {
    const [g] = await Promise.all([
      loadScript('vendor/gsap.min.js'),
      loadScript('vendor/lenis.min.js'),
    ]);
    if (g) {
      await Promise.all([
        loadScript('vendor/ScrollTrigger.min.js'),
        loadScript('vendor/SplitText.min.js'),
      ]);
    }
    loaded = !!g;
  }

  // 3. Behaviour.
  const scroll = initScroll();
  initNav(scroll);

  if (loaded && wantsMotion) {
    const motion = initMotion();
    initLattice($('#lattice'));
    // Charts re-render on resize; let ScrollTrigger re-measure afterwards.
    window.addEventListener('resize', () => motion.refresh(), { passive: true });
    // Fonts landing late changes layout, which moves every trigger.
    if (document.fonts?.ready) document.fonts.ready.then(() => motion.refresh());
  } else {
    settle();
  }

  // Honour a deep link once everything has settled into place.
  if (location.hash.length > 1) {
    const target = document.getElementById(location.hash.slice(1));
    if (target) requestAnimationFrame(() => scroll.scrollTo(target));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
