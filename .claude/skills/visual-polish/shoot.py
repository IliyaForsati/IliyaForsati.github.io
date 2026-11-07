#!/usr/bin/env python3
"""
Screenshot the site at desktop + mobile, light + dark, and report problems.

    python3 .claude/skills/visual-polish/shoot.py --out DIR
        [--url http://localhost:8000/] [--section ID] [--full]
        [--reduced-motion] [--no-motion-libs]
        [--only desktop|mobile] [--theme light|dark] [--dpr 1] [--wait 2200]

Reports console errors/warnings, uncaught page errors, failed requests and
elements that stick out past the viewport horizontally. Exits 1 if any error,
failed request or overflow was found.

Requires Python Playwright:
    pip install playwright && python3 -m playwright install chromium
"""
import argparse
import pathlib
import sys

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit(
        "Python Playwright is not installed.\n"
        "  pip install playwright && python3 -m playwright install chromium"
    )

VIEWPORTS = {"desktop": (1440, 900), "mobile": (390, 844)}
THEMES = ("light", "dark")

# Elements wider than the viewport, ignoring ones inside an intentional
# horizontal scroller (chart / table wrappers) and fixed decorative layers.
OVERFLOW_JS = """
() => {
  const vw = document.documentElement.clientWidth;
  const out = [];
  for (const el of document.body.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.right <= vw + 1) continue;
    let p = el.parentElement, clipped = false;
    while (p && p !== document.body) {
      if (getComputedStyle(p).overflowX !== 'visible') { clipped = true; break; }
      p = p.parentElement;
    }
    if (clipped) continue;
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' && el.closest('[aria-hidden="true"]')) continue;
    const cls = typeof el.className === 'string' && el.className.trim()
      ? '.' + el.className.trim().split(/\\s+/).join('.') : '';
    out.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls} right=${Math.round(r.right)}px > ${vw}px`);
    if (out.length >= 10) break;
  }
  return out;
}
"""

SCROLL_TO_SECTION_JS = """
([id, extra]) => {
  const el = document.getElementById(id);
  if (!el) return false;
  const nav = document.getElementById('nav');
  const top = window.scrollY + el.getBoundingClientRect().top - (nav ? nav.offsetHeight : 0);
  window.scrollTo(0, Math.max(0, top + extra));
  return true;
}
"""


def run_through(page):
    """Step through the whole page so once-only ScrollTrigger reveals fire."""
    vh = page.viewport_size["height"]
    y = 0
    while True:
        height = page.evaluate("document.documentElement.scrollHeight")
        if y >= height:
            break
        page.evaluate("y => window.scrollTo(0, y)", y)
        page.wait_for_timeout(140)
        y += int(vh * 0.7)
    page.wait_for_timeout(1500)
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(600)


def shoot(browser, args, vname, size, scheme, out):
    w, h = size
    ctx = browser.new_context(
        viewport={"width": w, "height": h},
        device_scale_factor=args.dpr,
        color_scheme=scheme,
        reduced_motion="reduce" if args.reduced_motion else "no-preference",
    )
    page = ctx.new_page()
    errors, warnings = [], []

    def on_console(msg):
        if args.no_motion_libs and "/vendor/" in (msg.location or {}).get("url", ""):
            return  # the console echo of a request we blocked on purpose
        if msg.type == "error":
            errors.append(f"console.error: {msg.text}")
        elif msg.type == "warning":
            warnings.append(f"console.warn: {msg.text}")

    def on_failed(req):
        if args.no_motion_libs and "/vendor/" in req.url:
            return  # blocked on purpose
        errors.append(f"request failed: {req.url} ({req.failure})")

    page.on("console", on_console)
    page.on("pageerror", lambda e: errors.append(f"page error: {e}"))
    page.on("requestfailed", on_failed)
    if args.no_motion_libs:
        page.route("**/vendor/*.js", lambda route: route.abort())

    page.goto(args.url, wait_until="networkidle")
    page.evaluate("document.fonts.ready.then(() => true)")
    page.wait_for_timeout(args.wait)  # let the hero timeline finish

    if args.full or args.section:
        run_through(page)

    if args.section:
        # Overshoot then come back up, so the hide-on-scroll-down nav is showing.
        if not page.evaluate(SCROLL_TO_SECTION_JS, [args.section, 80]):
            errors.append(f"no element with id={args.section!r}")
        page.wait_for_timeout(250)
        page.evaluate(SCROLL_TO_SECTION_JS, [args.section, 0])
        page.wait_for_timeout(1200)

    overflow = page.evaluate(OVERFLOW_JS)

    suffix = []
    if args.section:
        suffix.append(args.section)
    if args.full:
        suffix.append("full")
    if args.reduced_motion:
        suffix.append("reduced")
    if args.no_motion_libs:
        suffix.append("nolibs")
    name = "-".join([vname, scheme, *suffix]) + ".png"
    path = out / name
    page.screenshot(path=str(path), full_page=args.full)
    ctx.close()

    status = "OK" if not (errors or overflow) else "ISSUES"
    print(f"[{status}] {path}")
    for line in errors + [f"horizontal overflow: {o}" for o in overflow] + warnings:
        print(f"    {line}")
    return bool(errors or overflow)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", required=True, help="directory for PNGs (keep it outside the repo)")
    ap.add_argument("--url", default="http://localhost:8000/")
    ap.add_argument("--section", help="element id to frame, e.g. education")
    ap.add_argument("--full", action="store_true", help="full-page screenshot")
    ap.add_argument("--reduced-motion", action="store_true")
    ap.add_argument("--no-motion-libs", action="store_true", help="block vendor/*.js (GSAP, Lenis)")
    ap.add_argument("--only", choices=list(VIEWPORTS), help="just one viewport")
    ap.add_argument("--theme", choices=THEMES, help="just one colour scheme")
    ap.add_argument("--dpr", type=float, default=1)
    ap.add_argument("--wait", type=int, default=2200, help="ms to wait after load")
    args = ap.parse_args()

    out = pathlib.Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    viewports = {args.only: VIEWPORTS[args.only]} if args.only else VIEWPORTS
    themes = (args.theme,) if args.theme else THEMES

    bad = False
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for vname, size in viewports.items():
            for scheme in themes:
                bad |= shoot(browser, args, vname, size, scheme, out)
        browser.close()
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
