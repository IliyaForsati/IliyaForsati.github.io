/** Small shared helpers. */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const reduceMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Build an element from a tag, props, and children. */
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

/**
 * Contact details are stored in parts and joined here, so the address never
 * appears as a harvestable literal in the served HTML. It still renders as
 * ordinary, selectable, clickable text for people.
 */
export const mailto = ({ user, domain }) => `mailto:${user}@${domain}`;
export const address = ({ user, domain }) => `${user}@${domain}`;
export const telHref = ({ cc, parts }) => `tel:${cc}${parts.join('')}`;
export const telText = ({ cc, parts }) => `${cc} ${parts.join(' ')}`;

/** Clamp a number into a range. */
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Linear interpolation. */
export const lerp = (a, b, t) => a + (b - a) * t;

/** Format a 0–20 grade the way the transcript does. */
export const fmtGrade = (g) => (typeof g === 'number' ? g.toFixed(g % 1 === 0 ? 1 : 1) : g);

/** rAF-throttle a handler so scroll/resize work stays off the critical path. */
export function throttleFrame(fn) {
  let queued = false;
  let lastArgs;
  return (...args) => {
    lastArgs = args;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn(...lastArgs);
    });
  };
}

/** Resolve once an image either loads or fails. */
export function imageLoads(img) {
  return new Promise((resolve) => {
    if (img.complete) return resolve(img.naturalWidth > 0);
    img.addEventListener('load', () => resolve(img.naturalWidth > 0), { once: true });
    img.addEventListener('error', () => resolve(false), { once: true });
  });
}
