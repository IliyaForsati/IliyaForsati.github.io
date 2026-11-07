/**
 * Sticky nav: section links, a sliding active indicator, scroll progress,
 * hide-on-scroll-down, the mobile panel, and the theme toggle.
 */

import { $, $$, el, throttleFrame, clamp } from './util.js';
import { SECTIONS } from '../data/resume.js';

const LINKS = SECTIONS.filter((s) => s.nav !== false);

export function initNav({ scrollTo }) {
  const nav = $('#nav');
  let lastY = window.scrollY;
  const list = $('#navList');
  const indicator = $('#navIndicator');
  const panel = $('#navPanel');
  const toggle = $('#navToggle');
  const progress = $('#navProgress');

  /* ---- build links ------------------------------------------------------ */
  const mk = (s, i) =>
    el('a', {
      class: 'nav__link',
      href: `#${s.id}`,
      'data-section': s.id,
      'data-scroll': '',
    }, s.label);

  if (list) list.append(...LINKS.map(mk));

  if (panel) {
    panel.append(
      ...LINKS.map((s, i) =>
        el('a', { href: `#${s.id}`, 'data-section': s.id, 'data-scroll': '' },
          s.label,
          el('span', { class: 'mono', text: String(i + 1).padStart(2, '0') })
        )
      )
    );
  }

  const desktopLinks = list ? $$('.nav__link', list) : [];
  const panelLinks = panel ? $$('a', panel) : [];
  const allLinks = [...desktopLinks, ...panelLinks];

  /* ---- mobile panel ----------------------------------------------------- */
  const setPanel = (open) => {
    if (!panel || !toggle) return;
    panel.dataset.open = String(open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.documentElement.classList.toggle('lenis-stopped', open);
  };
  toggle?.addEventListener('click', () => setPanel(panel.dataset.open !== 'true'));
  panel?.addEventListener('click', (e) => { if (e.target.closest('a')) setPanel(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel?.dataset.open === 'true') { setPanel(false); toggle?.focus(); }
  });

  /* ---- anchor jumps route through the smooth-scroll engine -------------- */
  /**
   * Set while a programmatic jump is running. Without it, scrolling *down* to a
   * section would trip the hide-on-scroll-down rule and the bar would slide away
   * underneath the user mid-jump — they clicked it, so it has to stay put.
   */
  let jumping = 0;
  const holdNav = () => {
    clearTimeout(jumping);
    if (nav) nav.dataset.hidden = 'false';
    jumping = setTimeout(() => { jumping = 0; lastY = window.scrollY; }, 1400);
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-scroll]');
    if (!a) return;
    const id = a.getAttribute('href')?.slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    holdNav();
    scrollTo(target);
    // Keep the URL shareable without letting the browser also jump.
    history.replaceState(null, '', `#${id}`);
  });

  /* ---- active section + indicator --------------------------------------- */
  let activeId = null;

  const moveIndicator = (link) => {
    if (!indicator || !list || !link) return;
    const lr = list.getBoundingClientRect();
    const r = link.getBoundingClientRect();
    indicator.style.width = `${r.width}px`;
    // Horizontal only: the CSS `translate: 0 -50%` already centres it vertically,
    // and the two compose — repeating -50% here lifted the pill above the text.
    indicator.style.transform = `translateX(${r.left - lr.left}px)`;
    indicator.style.opacity = '1';
  };

  const setActive = (id) => {
    if (id === activeId) return;
    activeId = id;
    allLinks.forEach((a) => {
      const on = a.dataset.section === id;
      if (on) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    moveIndicator(desktopLinks.find((a) => a.dataset.section === id));
  };

  /**
   * Scroll spy. Chooses the section whose top is closest to just under the nav
   * bar — more stable near section boundaries than IntersectionObserver ratios,
   * and it still resolves the last section when the page bottoms out.
   */
  const sections = LINKS.map((s) => document.getElementById(s.id)).filter(Boolean);

  const spy = throttleFrame(() => {
    const navH = nav ? nav.offsetHeight : 0;
    const line = navH + 24;
    const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;

    let current = null;
    if (atBottom) {
      current = sections[sections.length - 1];
    } else {
      for (const sec of sections) {
        if (sec.getBoundingClientRect().top <= line) current = sec;
      }
    }
    // Above the first section (still in the hero) nothing is current.
    setActive(current ? current.id : null);
    if (!current && indicator) indicator.style.opacity = '0';
  });

  /* ---- progress + hide-on-scroll ---------------------------------------- */

  const onScroll = throttleFrame(() => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.setProperty('--progress', String(max > 0 ? clamp(y / max, 0, 1) : 0));

    if (nav) {
      nav.dataset.elevated = String(y > 8);
      const goingDown = y > lastY;
      const panelOpen = panel?.dataset.open === 'true';
      nav.dataset.hidden = String(!jumping && goingDown && y > 420 && !panelOpen);
    }
    lastY = y;
  });

  window.addEventListener('scroll', () => { onScroll(); spy(); }, { passive: true });
  window.addEventListener('resize', () => {
    spy();
    moveIndicator(desktopLinks.find((a) => a.dataset.section === activeId));
  });

  onScroll();
  spy();

  /* ---- theme toggle ------------------------------------------------------ */
  const themeBtn = $('#themeToggle');
  themeBtn?.addEventListener('click', () => {
    const root = document.documentElement;
    const explicit = root.getAttribute('data-theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentlyDark = explicit ? explicit === 'dark' : systemDark;
    const next = currentlyDark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
  });

  return { setActive };
}
