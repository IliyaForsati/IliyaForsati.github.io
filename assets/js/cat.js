/**
 * The site cat — a small hand-drawn SVG companion that sits in the corner of the
 * viewport for the whole page and, once the footer arrives, sits on top of it.
 *
 *  - The tail is a simulated chain of segments that always sways a little and
 *    swishes harder the faster the page is scrolling; it also drags behind the
 *    scroll direction a touch, like it has weight.
 *  - Scrolling bobs the body, flattens the ears and widens the pupils.
 *  - The eyes (and a slight head tilt) follow the pointer; without one, the cat
 *    glances around on its own.
 *  - Left alone for a while it dozes off; any scroll or pointer movement wakes it.
 *  - Hover for a happy squint; click or tap for a hop and a heart.
 *
 * Purely decorative (aria-hidden, conveys nothing), no dependencies, one rAF
 * loop that stops whenever the tab is hidden. Footer perching is CSS
 * `position: sticky`, so it tracks the scroll on the compositor with no JS.
 * Under prefers-reduced-motion the cat is drawn once, at rest.
 */

import { clamp, reduceMotion } from './util.js';

/* ---- tuning ------------------------------------------------------------- */
const TAIL_ROOT = [84, 108];          // behind the right haunch (SVG units)
const TAIL_SEGS = 10;
const TAIL_SEG_LEN = 6.2;
const TAIL_HALF_W = [4.4, 2.1];       // half-width at root, at tip
const SCROLL_FULL = 1600;             // px/s of scroll that counts as "full excitement"
const SLEEP_AFTER = 14;               // seconds of no scroll/pointer before dozing
const POINTER_FRESH = 4;              // seconds a pointer position stays interesting

/* Head and eye anchors, shared by the markup and the rig. */
const HEAD = { x: 60, y: 44, pivotY: 64 };
const EYES = [50, 70];
const EYE_Y = 44;
const VIEW = { x: 8, y: 2, w: 136, h: 120 };

const deg = (d) => (d * Math.PI) / 180;
const REST = Array.from({ length: TAIL_SEGS }, (_, i) => deg(5 - i * 13));

const eye = (x) => `
  <g class="cat__eye" transform="translate(${x} ${EYE_Y})">
    <ellipse class="cat__iris" rx="6" ry="6.6"/>
    <g clip-path="url(#cat-eye-clip)">
      <g class="cat__look">
        <ellipse class="cat__pupil" rx="2.2" ry="5"/>
        <circle class="cat__glint" cx="1.9" cy="-2.6" r="1.3"/>
      </g>
    </g>
  </g>`;

const MARKUP = `
<svg class="cat__svg" viewBox="${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}" focusable="false">
  <defs><clipPath id="cat-eye-clip"><ellipse rx="6" ry="6.6"/></clipPath></defs>
  <g class="cat__rig">
    <path class="cat__fur cat__tail"/>
    <circle class="cat__fur cat__tail-tip" r="${TAIL_HALF_W[1]}"/>
    <g class="cat__body">
      <ellipse class="cat__fur" cx="35" cy="104" rx="11" ry="12"/>
      <ellipse class="cat__fur" cx="85" cy="104" rx="11" ry="12"/>
      <path class="cat__fur" d="M46 63 C36 74 28 92 31 108 C32 113 36 117 42 117 L78 117 C84 117 88 113 89 108 C92 92 84 74 74 63 Z"/>
      <ellipse class="cat__fur" cx="51" cy="116" rx="7.5" ry="4"/>
      <ellipse class="cat__fur" cx="69" cy="116" rx="7.5" ry="4"/>
      <path class="cat__line cat__line--soft" d="M60 99 L60 115.5"/>
    </g>
    <g class="cat__head">
      <g class="cat__ear cat__ear--l">
        <path class="cat__fur cat__ear-shape" d="M37 36 L37 12 L54 26 Z"/>
        <path class="cat__inner" d="M40.5 30 L40.5 18.5 L49.5 26 Z"/>
      </g>
      <g class="cat__ear cat__ear--r">
        <path class="cat__fur cat__ear-shape" d="M83 36 L83 12 L66 26 Z"/>
        <path class="cat__inner" d="M79.5 30 L79.5 18.5 L70.5 26 Z"/>
      </g>
      <ellipse class="cat__fur" cx="${HEAD.x}" cy="${HEAD.y}" rx="25" ry="21"/>
      <g class="cat__whiskers cat__whiskers--l"><path class="cat__whisker" d="M39 51 L17 47 M39 54.5 L16 55.5 M40 58 L19 63"/></g>
      <g class="cat__whiskers cat__whiskers--r"><path class="cat__whisker" d="M81 51 L103 47 M81 54.5 L104 55.5 M80 58 L101 63"/></g>
      <g class="cat__eyes">${EYES.map(eye).join('')}</g>
      <path class="cat__happy" d="M44.5 46 Q50 40 55.5 46 M64.5 46 Q70 40 75.5 46"/>
      <path class="cat__nose" d="M57.4 52.2 L62.6 52.2 L60 55.2 Z"/>
      <path class="cat__line" d="M60 55.2 Q58.6 58 55.8 57.2 M60 55.2 Q61.4 58 64.2 57.2"/>
    </g>
    <g class="cat__zzz"><text x="88" y="24">z</text><text x="96" y="13">z</text></g>
  </g>
  <g class="cat__fx"></g>
</svg>`;

/* ---- tail geometry ------------------------------------------------------- */
const f = (n) => n.toFixed(2);

/** Smooth open path through points (quadratic through midpoints). */
function through(pts, cmd) {
  let d = `${cmd}${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    d += ` Q${f(x)} ${f(y)} ${f((x + pts[i + 1][0]) / 2)} ${f((y + pts[i + 1][1]) / 2)}`;
  }
  const end = pts[pts.length - 1];
  return `${d} L${f(end[0])} ${f(end[1])}`;
}

/** A tapered outline around the segment chain, plus where the tip ends up. */
function tailShape(angles) {
  const pts = [TAIL_ROOT];
  let [x, y] = TAIL_ROOT;
  for (const a of angles) {
    x += Math.cos(a) * TAIL_SEG_LEN;
    y += Math.sin(a) * TAIL_SEG_LEN;
    pts.push([x, y]);
  }
  const left = [], right = [];
  const n = pts.length - 1;
  for (let k = 0; k <= n; k++) {
    const dir = (angles[Math.max(0, k - 1)] + angles[Math.min(n - 1, k)]) / 2;
    const hw = TAIL_HALF_W[0] + (TAIL_HALF_W[1] - TAIL_HALF_W[0]) * (k / n);
    const nx = -Math.sin(dir) * hw, ny = Math.cos(dir) * hw;
    left.push([pts[k][0] + nx, pts[k][1] + ny]);
    right.push([pts[k][0] - nx, pts[k][1] - ny]);
  }
  return { d: `${through(left, 'M')} ${through(right.reverse(), 'L')} Z`, tip: pts[n] };
}

/* ---- the cat -------------------------------------------------------------- */
export function initCat() {
  const main = document.querySelector('main');
  if (!main || document.querySelector('.cat')) return () => {};

  const host = document.createElement('div');
  host.className = 'cat';
  host.setAttribute('aria-hidden', 'true');
  host.innerHTML = MARKUP;
  // Last child of <main>: sticky-bottom keeps it on screen for the whole page and
  // lets it come to rest on the footer's top edge, where <main> ends.
  main.append(host);

  const $ = (s) => host.querySelector(s);
  const rig = $('.cat__rig');
  const head = $('.cat__head');
  const tail = $('.cat__tail');
  const tip = $('.cat__tail-tip');
  const earL = $('.cat__ear--l');
  const earR = $('.cat__ear--r');
  const whL = $('.cat__whiskers--l');
  const whR = $('.cat__whiskers--r');
  const eyesG = $('.cat__eyes');
  const happyEyes = $('.cat__happy');
  const zzz = $('.cat__zzz');
  const fx = $('.cat__fx');
  const eyes = [...host.querySelectorAll('.cat__eye')].map((g, i) => ({
    g, x: EYES[i], look: g.querySelector('.cat__look'), pupil: g.querySelector('.cat__pupil'),
  }));

  const s = {
    t: 0, phase: 0, swing: 0.16, drag: 0,
    vel: 0, lastY: window.scrollY,
    look: [0, 0], lookTarget: [0, 0], nextGlance: 1.5,
    pointer: null, pointerAge: Infinity,
    blinkT: -1, nextBlink: 2 + Math.random() * 3,
    idle: 0, sleep: 0,
    hover: false, happy: 0, joy: 0,
    hopY: 0, hopV: 0, land: 0,
    twitch: [0, 0], twitchT: [-1, -1], nextTwitch: 4 + Math.random() * 4,
    bob: 0, excite: 0,
  };

  const draw = () => {
    const angles = REST.map((a, i) => {
      const u = i / (TAIL_SEGS - 1);
      return a + s.swing * Math.sin(s.phase - i * 0.55) * (0.15 + 0.85 * u) + s.drag * u;
    });
    const shape = tailShape(angles);
    tail.setAttribute('d', shape.d);
    tip.setAttribute('cx', f(shape.tip[0]));
    tip.setAttribute('cy', f(shape.tip[1]));

    // Body: breathing, scroll bob, hop, landing squash. Scaled about the paws.
    const breathe = Math.sin(s.t * (2.2 - s.sleep * 0.9)) * (0.012 + s.sleep * 0.01);
    const squash = s.land * 0.08;
    const sy = 1 + breathe - squash + (s.hopV < 0 ? 0.04 : 0);
    const sx = 1 - breathe * 0.5 + squash * 0.6;
    const purr = s.happy * Math.sin(s.t * 70) * 0.22;
    rig.setAttribute('transform',
      `translate(${f(purr)} ${f(s.hopY + s.bob)}) translate(60 119) scale(${f(sx)} ${f(sy)}) translate(-60 -119)`);

    // Head: follow the look a little, react to scroll direction, droop when asleep.
    const tilt = s.look[0] * 6 - clamp(s.vel / 2000, -1, 1) * 3 + s.sleep * 7;
    head.setAttribute('transform', `translate(0 ${f(s.sleep * 2.5)}) rotate(${f(tilt)} ${HEAD.x} ${HEAD.pivotY})`);

    const flat = s.excite * 16 + s.sleep * 6;
    earL.setAttribute('transform', `rotate(${f(-(flat + s.twitch[0]))} 44 32)`);
    earR.setAttribute('transform', `rotate(${f(flat + s.twitch[1])} 76 32)`);
    const wh = Math.sin(s.t * 1.3) * 1.2 + s.excite * 4;
    whL.setAttribute('transform', `rotate(${f(wh)} 39 54)`);
    whR.setAttribute('transform', `rotate(${f(-wh)} 81 54)`);

    // Eyes: blink, sleep, happy squint, pupils that follow and dilate.
    let open = 1 - 0.9 * s.sleep;
    if (s.blinkT >= 0) open = Math.min(open, 1 - Math.sin(Math.PI * clamp(s.blinkT / 0.16, 0, 1)) * 0.92);
    const px = s.look[0] * 2.4, py = s.look[1] * 2.2;
    const rx = 2.2 + s.excite * 1.6;
    for (const e of eyes) {
      e.g.setAttribute('transform', `translate(${e.x} ${EYE_Y}) scale(1 ${f(Math.max(open, 0.06))})`);
      e.look.setAttribute('transform', `translate(${f(px)} ${f(py)})`);
      e.pupil.setAttribute('rx', f(rx));
    }
    eyesG.style.opacity = f(1 - s.happy);
    happyEyes.style.opacity = f(s.happy);
    zzz.style.opacity = f(clamp((s.sleep - 0.6) / 0.4, 0, 1));
  };

  draw();

  if (reduceMotion()) {
    host.classList.add('is-in');
    return () => host.remove();
  }

  /* ---- input ------------------------------------------------------------ */
  const wake = () => {
    if (s.sleep > 0.5) { s.twitchT = [0, 0.05]; s.hopV = -60; }
    s.idle = 0;
  };
  const onPointer = (e) => {
    s.pointer = [e.clientX, e.clientY];
    s.pointerAge = 0;
    wake();
  };
  const onEnter = () => { s.hover = true; wake(); };
  const onLeave = () => { s.hover = false; };
  const onPet = () => {
    wake();
    if (s.hopY === 0) s.hopV = -110;
    s.joy = 1.4;
    heart();
  };
  const heart = () => {
    const h = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    h.setAttribute('class', 'cat__heart');
    h.setAttribute('d', 'M0 3.2 C-6.5 -1 -4.2 -6.6 0 -3.2 C4.2 -6.6 6.5 -1 0 3.2 Z');
    h.style.setProperty('--dx', `${Math.round((Math.random() - 0.5) * 16)}px`);
    fx.append(h);
    h.addEventListener('animationend', () => h.remove(), { once: true });
  };

  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('pointerdown', onPointer, { passive: true });
  rig.addEventListener('pointerenter', onEnter);
  rig.addEventListener('pointerleave', onLeave);
  rig.addEventListener('click', onPet);

  /* ---- loop ------------------------------------------------------------- */
  let raf = null;
  let last = 0;
  let headPos = null; // cached screen position of the head; refreshed on demand

  const measure = () => {
    const r = host.getBoundingClientRect();
    headPos = [
      r.left + ((HEAD.x - VIEW.x) / VIEW.w) * r.width,
      r.top + ((HEAD.y - VIEW.y) / VIEW.h) * r.height,
    ];
  };

  const ease = (cur, target, rate, dt) => cur + (target - cur) * (1 - Math.exp(-rate * dt));

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    s.t += dt;

    // Scroll velocity (px/s), smoothed so a single wheel tick doesn't spike it.
    const y = window.scrollY;
    const v = (y - s.lastY) / dt;
    s.lastY = y;
    s.vel = ease(s.vel, v, 8, dt);
    if (Math.abs(v) > 4) { wake(); headPos = null; }
    const sp = clamp(Math.abs(s.vel) / SCROLL_FULL, 0, 1);
    s.excite = ease(s.excite, sp, 6, dt);

    // Sleep: drift off slowly, wake fast.
    s.idle += dt;
    s.sleep = ease(s.sleep, s.idle > SLEEP_AFTER ? 1 : 0, s.idle > SLEEP_AFTER ? 0.5 : 7, dt);

    // Happy: while hovered, and briefly after a pet.
    s.joy = Math.max(0, s.joy - dt);
    s.happy = ease(s.happy, s.hover || s.joy > 0 ? 1 : 0, 9, dt);

    // Where to look: the pointer if it moved recently, else glance around.
    s.pointerAge += dt;
    if (s.pointer && s.pointerAge < POINTER_FRESH) {
      if (!headPos) measure();
      const dx = s.pointer[0] - headPos[0], dy = s.pointer[1] - headPos[1];
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 140);
      s.lookTarget = [(dx / d) * k, (dy / d) * k];
    } else if ((s.nextGlance -= dt) <= 0) {
      s.nextGlance = 1.8 + Math.random() * 2.6;
      s.lookTarget = Math.random() < 0.35 ? [0, 0] : [Math.random() * 1.6 - 0.8, Math.random() * 1.2 - 0.5];
    }
    // While scrolling, it watches the page go by.
    const scrollLook = [0, Math.sign(s.vel) * 0.85];
    const tx = s.lookTarget[0] + (scrollLook[0] - s.lookTarget[0]) * s.excite;
    const ty = s.lookTarget[1] + (scrollLook[1] - s.lookTarget[1]) * s.excite;
    s.look = [ease(s.look[0], tx, 14, dt), ease(s.look[1], ty, 14, dt)];

    // Tail: amplitude and speed rise with scroll speed; drag trails the scroll.
    const swing = (0.16 + 0.44 * s.excite + 0.1 * s.happy) * (1 - 0.75 * s.sleep);
    s.swing = ease(s.swing, swing, 4, dt);
    s.phase += (1.7 + 6.5 * s.excite + 1.2 * s.happy - 0.9 * s.sleep) * dt;
    s.drag = ease(s.drag, clamp(s.vel / 1800, -1, 1) * 0.35, 5, dt);

    // Bob while the page moves.
    s.bob = -Math.abs(Math.sin(s.t * 11)) * 3.2 * s.excite;

    // Hop with gravity; squash a little on landing.
    if (s.hopV !== 0 || s.hopY < 0) {
      s.hopV += 560 * dt;
      s.hopY += s.hopV * dt;
      if (s.hopY >= 0) { s.hopY = 0; s.hopV = 0; s.land = 1; }
    }
    s.land = Math.max(0, s.land - dt * 6);

    // Blinks, sometimes doubled; ear twitches.
    if (s.blinkT >= 0) {
      s.blinkT += dt;
      if (s.blinkT > 0.16) s.blinkT = -1;
    } else if ((s.nextBlink -= dt) <= 0) {
      s.blinkT = 0;
      s.nextBlink = Math.random() < 0.2 ? 0.22 : 2.5 + Math.random() * 3.5;
    }
    if ((s.nextTwitch -= dt) <= 0 && s.sleep < 0.5) {
      s.twitchT[Math.random() < 0.5 ? 0 : 1] = 0;
      s.nextTwitch = 4 + Math.random() * 6;
    }
    for (let i = 0; i < 2; i++) {
      if (s.twitchT[i] < 0) { s.twitch[i] = 0; continue; }
      s.twitchT[i] += dt;
      const u = s.twitchT[i] / 0.32;
      s.twitch[i] = u >= 1 ? 0 : Math.sin(u * Math.PI * 2) * 14 * (1 - u);
      if (u >= 1) s.twitchT[i] = -1;
    }

    draw();
  }

  const start = () => { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } };
  const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };
  const onVisibility = () => (document.hidden ? stop() : start());
  const onResize = () => { headPos = null; };

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('resize', onResize, { passive: true });
  start();

  // Enter once the hero has had its moment.
  setTimeout(() => host.classList.add('is-in'), 1200);

  return () => {
    stop();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('pointerdown', onPointer);
    host.remove();
  };
}
