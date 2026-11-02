/**
 * The full transcript table: search, sort, semester filter, group-by-semester,
 * and a toggle for withdrawn / in-progress rows.
 *
 * This table is also the chart "table view" — every value plotted above is
 * readable here as text, so no figure is gated behind a tooltip.
 */

import { $, el } from './util.js';
import { COURSES, SEMESTERS, GRADE_CODES, TOTALS } from '../data/transcript.js';

const COLUMNS = [
  { key: 'code', label: 'Code', sortable: true, cls: 'td-code' },
  { key: 'title', label: 'Course', sortable: true, cls: 'td-title' },
  { key: 'semester', label: 'Semester', sortable: true, cls: 'td-sem' },
  { key: 'units', label: 'Units', sortable: true, cls: 'td-num', numeric: true },
  { key: 'grade', label: 'Grade', sortable: true, cls: 'td-num', numeric: true },
];

const state = {
  q: '',
  semester: 'all',
  showAll: false,
  group: false,
  sort: { key: 'semester', dir: 'asc' },
};

/** Chronological rank, so "sort by semester" means time order, not alphabet. */
const semRank = new Map(SEMESTERS.map((s, i) => [s.id, i]));

function visibleRows() {
  const q = state.q.trim().toLowerCase();
  let rows = COURSES.filter((c) => {
    if (!state.showAll && !c.numeric) return false;
    if (state.semester !== 'all' && c.semesterId !== state.semester) return false;
    if (q && !(`${c.code} ${c.title} ${c.semesterLabel}`.toLowerCase().includes(q))) return false;
    return true;
  });

  const { key, dir } = state.sort;
  const sign = dir === 'asc' ? 1 : -1;
  rows = rows.slice().sort((a, b) => {
    let va, vb;
    if (key === 'semester') { va = semRank.get(a.semesterId); vb = semRank.get(b.semesterId); }
    else if (key === 'grade') {
      // Non-numeric codes sort to the end regardless of direction, so they
      // never push real grades off the top of the list.
      if (!a.numeric && !b.numeric) return a.title.localeCompare(b.title);
      if (!a.numeric) return 1;
      if (!b.numeric) return -1;
      va = a.grade; vb = b.grade;
    }
    else if (key === 'units') { va = a.units; vb = b.units; }
    else { va = String(a[key]).toLowerCase(); vb = String(b[key]).toLowerCase(); }
    if (va < vb) return -1 * sign;
    if (va > vb) return 1 * sign;
    return a.title.localeCompare(b.title);
  });

  // Grouping only makes sense in chronological order.
  if (state.group) {
    rows = rows.slice().sort((a, b) => {
      const d = semRank.get(a.semesterId) - semRank.get(b.semesterId);
      if (d !== 0) return d;
      const { key: k, dir: dd } = state.sort;
      const s = dd === 'asc' ? 1 : -1;
      if (k === 'grade') {
        if (!a.numeric) return 1;
        if (!b.numeric) return -1;
        return (a.grade - b.grade) * s;
      }
      if (k === 'units') return (a.units - b.units) * s;
      return String(a[k === 'semester' ? 'title' : k]).localeCompare(String(b[k === 'semester' ? 'title' : k])) * s;
    });
  }
  return rows;
}

function gradeCell(c) {
  if (!c.numeric) {
    const info = GRADE_CODES[c.grade];
    return el('td', { class: 'td-num' },
      el('span', { class: 'td-grade', 'data-code': c.grade, title: info ? info.note : '', text: info ? info.label : c.grade })
    );
  }
  const pct = (c.grade / 20) * 100;
  return el('td', { class: 'td-num' },
    el('span', { class: 'gradebar', 'aria-hidden': 'true' }, el('i', { style: `width:${pct}%` })),
    el('span', { class: 'td-grade', 'data-perfect': String(c.grade === 20), text: c.grade.toFixed(1) })
  );
}

function renderHead() {
  const head = $('#tHead');
  if (!head) return;
  head.replaceChildren(
    ...COLUMNS.map((col) => {
      const isSorted = state.sort.key === col.key;
      const th = el('th', {
        scope: 'col',
        style: col.numeric ? 'text-align:right' : '',
      });
      if (isSorted) th.setAttribute('aria-sort', state.sort.dir === 'asc' ? 'ascending' : 'descending');
      th.append(
        el('button', {
          type: 'button',
          onclick: () => {
            if (state.sort.key === col.key) state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
            else state.sort = { key: col.key, dir: col.numeric ? 'desc' : 'asc' };
            render();
          },
        },
          col.label,
          el('span', { class: 'sort-arrow', html: '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8V2M2.5 4.5L5 2l2.5 2.5"/></svg>' })
        )
      );
      return th;
    })
  );
}

function render() {
  renderHead();
  const body = $('#tBody');
  const count = $('#tCount');
  if (!body) return;

  const rows = visibleRows();

  if (!rows.length) {
    body.replaceChildren(
      el('tr', {}, el('td', { class: 'tempty', colspan: COLUMNS.length, text: 'No courses match that search.' }))
    );
  } else {
    const nodes = [];
    let lastSem = null;
    for (const c of rows) {
      if (state.group && c.semesterId !== lastSem) {
        lastSem = c.semesterId;
        const s = SEMESTERS.find((x) => x.id === c.semesterId);
        nodes.push(
          el('tr', { class: 'tgroup' },
            el('td', { colspan: COLUMNS.length },
              s.label,
              el('span', {
                text: s.semesterGpa !== null
                  ? `avg ${s.semesterGpa.toFixed(2)} · ${s.units} units · cumulative ${s.cumulativeGpa.toFixed(2)}`
                  : `${s.units} units · in progress`,
              })
            )
          )
        );
      }
      nodes.push(
        el('tr', { 'data-inactive': String(!c.numeric) },
          el('td', { class: 'td-code', text: c.code }),
          el('td', { class: 'td-title' },
            c.title,
            c.graduate ? el('span', { class: 'grad', title: 'Graduate-level course', text: 'Grad' }) : null
          ),
          el('td', { class: 'td-sem', text: c.semesterLabel }),
          el('td', { class: 'td-num', text: c.units ? String(c.units) : '—' }),
          gradeCell(c)
        )
      );
    }
    body.replaceChildren(...nodes);
  }

  if (count) {
    const units = rows.reduce((n, c) => n + (c.numeric ? c.units : 0), 0);
    count.textContent = `${rows.length} course${rows.length === 1 ? '' : 's'} · ${units} graded units`;
  }
}

function renderLegend() {
  const host = $('#tLegend');
  if (!host) return;
  host.replaceChildren(
    ...Object.entries(GRADE_CODES).map(([code, info]) =>
      el('div', {}, el('dt', { text: info.label }), el('dd', { text: info.note }))
    ),
    el('div', {},
      el('dt', { text: 'Totals' }),
      el('dd', { text: `${TOTALS.coursesGraded} graded courses · ${TOTALS.unitsEarned} units earned · ${TOTALS.perfectScores} perfect scores · ${TOTALS.unitsInProgress} units in progress` })
    )
  );
}

export function initTranscript() {
  const sel = $('#tSemester');
  if (sel) {
    sel.replaceChildren(
      el('option', { value: 'all', text: 'All semesters' }),
      ...SEMESTERS.map((s) => el('option', { value: s.id, text: s.label }))
    );
    sel.addEventListener('change', () => { state.semester = sel.value; render(); });
  }

  const search = $('#tSearch');
  if (search) search.addEventListener('input', () => { state.q = search.value; render(); });

  const all = $('#tAll');
  if (all) all.addEventListener('change', () => { state.showAll = all.checked; render(); });

  const group = $('#tGroup');
  if (group) group.addEventListener('change', () => { state.group = group.checked; render(); });

  renderLegend();
  render();
}
