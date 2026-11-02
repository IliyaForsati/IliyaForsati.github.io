/** Renders every data-driven content block from assets/data/*.js. */

import { $, el, mailto, address, telHref, telText } from './util.js';
import {
  PROFILE, RESEARCH_INTERESTS, EDUCATION, RESEARCH_EXPERIENCE,
  PUBLICATIONS, TEACHING, SKILLS, REFERENCES,
} from '../data/resume.js';
import { BENCHMARKS } from '../data/transcript.js';

const icon = (path) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

function renderInterests() {
  const grid = $('#interestsGrid');
  if (!grid) return;
  grid.append(
    ...RESEARCH_INTERESTS.areas.map((a, i) =>
      el('article', { class: 'interest', 'data-primary': String(!!a.primary), 'data-reveal': 'fade', style: `--i:${i}` },
        el('h3', { class: 'interest__title', text: a.title }),
        el('p', { class: 'interest__blurb', text: a.blurb })
      )
    )
  );
}

function renderGpaTiles() {
  const host = $('#gpaTiles');
  if (!host) return;

  host.append(
    ...EDUCATION.gpas.map((g) => {
      const vsDept = g.value - BENCHMARKS.department;
      const tile = el('div', { class: 'tile', 'data-benchmark': String(!!g.benchmark) },
        el('p', { class: 'tile__label' },
          el('span', { class: 'tile__key', 'aria-hidden': 'true' }),
          g.label
        ),
        // data-count is read by counters.js; the text is the final value so
        // the number is correct even if the animation never runs.
        el('p', { class: 'tile__value' },
          el('span', { 'data-count': g.value.toFixed(2), text: g.value.toFixed(2) }),
          el('sub', { text: '/20' })
        ),
        !g.benchmark && vsDept > 0
          ? el('p', { class: 'tile__delta' },
              el('span', { html: icon('<path d="M12 19V5M6 11l6-6 6 6"/>') }),
              `+${vsDept.toFixed(2)} vs. department`)
          : null,
        el('p', { class: 'tile__note', text: g.note })
      );
      return tile;
    })
  );
}

function renderResearch() {
  const host = $('#researchBullets');
  if (!host) return;
  const role = RESEARCH_EXPERIENCE[0];
  host.append(
    ...role.bullets.map((b) =>
      el('li', { class: 'bullet', 'data-reveal': 'fade' },
        el('p', { class: 'bullet__lead', text: b.lead }),
        el('p', { class: 'bullet__text', html: b.text })
      )
    )
  );
}

function renderPublications() {
  const host = $('#pubList');
  if (!host) return;
  host.append(
    ...PUBLICATIONS.map((p) =>
      el('article', { class: 'pub', 'data-reveal': '' },
        el('div', { class: 'pub__tags' },
          el('span', { class: 'tag tag--wip', text: p.status }),
          el('span', { class: 'tag', text: p.venue })
        ),
        el('h3', { class: 'pub__title' },
          p.title, ' ',
          el('span', { text: `(${p.titleNote})` })
        ),
        el('p', { class: 'pub__meta', text: p.authors })
      )
    )
  );
}

function renderTeaching() {
  const host = $('#teachingList');
  if (!host) return;
  host.append(
    ...TEACHING.map((t) =>
      el('li', { class: 'course', 'data-reveal': 'fade' },
        el('div', { class: 'course__head' },
          el('h3', { class: 'course__name', text: t.course }),
          el('span', { class: 'course__role', text: t.role }),
          el('span', { class: 'offerings', text: `${t.offerings} offerings` })
        ),
        el('p', { class: 'course__when', text: t.period }),
        el('div', { class: 'course__body' },
          ...t.bullets.map((b) => el('p', { class: 'course__note', text: b })),
          el('ul', { class: 'course__instructors', 'aria-label': 'Instructors' },
            ...t.instructors.map((n) => el('li', { text: n }))
          )
        )
      )
    )
  );
}

function renderSkills() {
  const host = $('#skillsList');
  if (!host) return;
  host.append(
    ...SKILLS.map((s) =>
      el('div', { class: 'skillrow', 'data-reveal': 'fade' },
        el('h3', { class: 'skillrow__label', text: s.group }),
        el('ul', { class: 'skillrow__items' }, ...s.items.map((i) => el('li', { text: i })))
      )
    )
  );
}

function contactRow(key, valueNode) {
  return el('div', { class: 'contact__row' },
    el('span', { class: 'contact__key', text: key }),
    el('span', { class: 'contact__val' }, valueNode)
  );
}

function renderContact() {
  const host = $('#contactList');
  if (!host) return;
  host.append(
    contactRow('Email', el('a', { class: 'link', href: mailto(PROFILE.email), text: address(PROFILE.email) })),
    contactRow('Phone', el('a', { class: 'link', href: telHref(PROFILE.phone), text: telText(PROFILE.phone) })),
    contactRow('GitHub', el('a', { class: 'link', href: `https://github.com/${PROFILE.github}`, rel: 'me noopener', text: `github.com/${PROFILE.github}` })),
    contactRow('Based in', el('span', { text: PROFILE.location }))
  );

  const refs = $('#refsList');
  if (!refs) return;
  refs.append(
    ...REFERENCES.map((r) =>
      el('div', { class: 'ref' },
        el('p', { class: 'ref__name' },
          r.name,
          r.relation ? el('span', { class: 'ref__badge', text: r.relation }) : null
        ),
        el('p', { class: 'ref__affil', text: r.affiliation }),
        el('a', { class: 'ref__email link', href: mailto(r.email), text: address(r.email) })
      )
    )
  );
}

export function renderAll() {
  renderInterests();
  renderGpaTiles();
  renderResearch();
  renderPublications();
  renderTeaching();
  renderSkills();
  renderContact();
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
}
