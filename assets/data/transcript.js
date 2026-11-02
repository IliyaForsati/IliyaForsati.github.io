/**
 * Sharif University of Technology — academic record.
 * Transcribed from the official unofficial transcript (issued 2026-01-11),
 * student ID 402106297. Grades are on Iran's 0–20 scale; 10 is passing.
 *
 * `grade` is a number, or one of: "W" (withdrawn), "N" (not yet available,
 * i.e. in progress), "P_GO" (pass / good — ungraded pass-fail).
 * Courses with a non-numeric grade are excluded from every average.
 */

export const SCALE = { min: 0, max: 20, pass: 10 };

/** Cohort benchmarks printed on the transcript, for this class of students. */
export const BENCHMARKS = {
  department: 17.49,
  university: 16.12,
};

/**
 * Semesters in chronological order. `semesterGpa` / `cumulativeGpa` /
 * `unitsTotal` are the figures printed on the transcript, not recomputed —
 * the registrar's rounding is authoritative.
 */
export const SEMESTERS = [
  {
    id: 'f2023',
    label: 'Fall 2023–24',
    short: 'F23',
    term: 'FALL SEM 2023-2024',
    units: 16,
    semesterGpa: 16.70,
    cumulativeGpa: 16.70,
    unitsTotal: 16,
    courses: [
      { code: '22-015', title: 'General Mathematics 1', units: 4, grade: 17.1 },
      { code: '24-011', title: 'Physics 1', units: 3, grade: 17.5 },
      { code: '31-119', title: 'Introduction to Persian Literature', units: 3, grade: 14.5 },
      { code: '37-445', title: 'Islamic Thought 1', units: 2, grade: 14.0 },
      { code: '40-108', title: 'Computer Workshop', units: 1, grade: 17.8 },
      { code: '40-153', title: 'Introduction to Programming', units: 3, grade: 19.0 },
    ],
  },
  {
    id: 's2024',
    label: 'Spring 2023–24',
    short: 'S24',
    term: 'SPRING SEM 2023-2024',
    units: 15,
    semesterGpa: 18.64,
    cumulativeGpa: 17.64,
    unitsTotal: 31,
    courses: [
      { code: '22-016', title: 'General Mathematics 2', units: 4, grade: 17.1 },
      { code: '31-123', title: 'Foreign Language', units: 3, grade: 'W' },
      { code: '37-446', title: 'Islamic Thought 2', units: 2, grade: 19.5 },
      { code: '40-115', title: 'Discrete Structures', units: 3, grade: 18.6 },
      { code: '40-212', title: 'Logic Design', units: 3, grade: 18.8 },
      { code: '40-244', title: 'Advanced Programming', units: 3, grade: 20.0 },
    ],
  },
  {
    id: 'f2024',
    label: 'Fall 2024–25',
    short: 'F24',
    term: 'FALL SEM 2024-2025',
    units: 14,
    semesterGpa: 18.61,
    cumulativeGpa: 17.94,
    unitsTotal: 45,
    courses: [
      { code: '22-034', title: 'Differential Equations', units: 3, grade: 16.5 },
      { code: '24-002', title: 'Physics Laboratory 2', units: 1, grade: 16.4 },
      { code: '24-012', title: 'Physics 2', units: 3, grade: 20.0 },
      { code: '30-003', title: 'Physical Education', units: 1, grade: 19.8 },
      { code: '40-126', title: 'Computer Structure & Language', units: 3, grade: 18.8 },
      { code: '40-181', title: 'Engineering Probability & Statistics', units: 3, grade: 'W' },
      { code: '40-254', title: 'Data Structures & Algorithms', units: 3, grade: 19.5 },
    ],
  },
  {
    id: 's2025',
    label: 'Spring 2024–25',
    short: 'S25',
    term: 'SPRING SEM 2024-2025',
    units: 19,
    semesterGpa: 17.74,
    cumulativeGpa: 17.88,
    unitsTotal: 64,
    courses: [
      { code: '31-123', title: 'Foreign Language', units: 3, grade: 14.0 },
      { code: '33-018', title: 'General Workshop', units: 1, grade: 19.8 },
      { code: '37-127', title: 'Life Style', units: 2, grade: 20.0 },
      { code: '40-124', title: 'Fundamentals of Electric & Electronic Circuits', units: 3, grade: 17.6 },
      { code: '40-181', title: 'Engineering Probability & Statistics', units: 3, grade: 20.0 },
      { code: '40-206', title: 'Logic Design Laboratory', units: 1, grade: 18.3 },
      { code: '40-223', title: 'Digital Systems Design', units: 3, grade: 17.0 },
      { code: '40-323', title: 'Computer Architecture', units: 3, grade: 17.7 },
    ],
  },
  {
    id: 'f2025',
    label: 'Fall 2025–26',
    short: 'F25',
    term: 'FALL SEM 2025-2026',
    units: 12,
    semesterGpa: 18.68,
    cumulativeGpa: 18.01,
    unitsTotal: 76,
    courses: [
      { code: '40-282', title: 'Linear Algebra', units: 3, grade: 17.0 },
      { code: '40-384', title: 'Database Design', units: 3, grade: 'W' },
      { code: '40-417', title: 'Artificial Intelligence', units: 3, grade: 20.0 },
      { code: '40-477', title: 'Machine Learning', units: 3, grade: 19.2 },
      { code: '44-637', title: 'Startup Finance', units: 3, grade: 18.5 },
    ],
  },
  {
    id: 's2026',
    label: 'Spring 2025–26',
    short: 'S26',
    term: 'SPRING SEM 2025-2026 (ONLINE)',
    units: 16,
    semesterGpa: 20.00,
    cumulativeGpa: 18.35,
    unitsTotal: 92,
    note: 'Perfect semester — 20.00 across all 16 units.',
    courses: [
      { code: '37-489', title: 'Subject Interpretation of the Quran', units: 2, grade: 20.0 },
      { code: '40-211', title: 'Computer Technical English', units: 2, grade: 20.0 },
      { code: '40-354', title: 'Design of Algorithms', units: 3, grade: 20.0 },
      { code: '40-384', title: 'Database Design', units: 3, grade: 20.0 },
      { code: '40-419', title: 'Web Programming', units: 3, grade: 20.0 },
      { code: '44-714', title: 'Principles of Economics', units: 3, grade: 20.0 },
    ],
  },
  {
    id: 'su2026',
    label: 'Summer 2025–26',
    short: 'Su26',
    term: 'SUMMER 2025-2026',
    units: 2,
    semesterGpa: 18.30,
    cumulativeGpa: 18.35,
    unitsTotal: 94,
    courses: [
      { code: '40-107', title: 'Internet of Things Laboratory', units: 1, grade: 17.5 },
      { code: '40-203', title: 'Digital Systems Design Laboratory', units: 1, grade: 19.1 },
      { code: '40-450', title: 'Computer Engineering Internship', units: 0, grade: 'P_GO' },
    ],
  },
  {
    id: 'f2026',
    label: 'Fall 2026–27',
    short: 'F26',
    term: 'FALL SEM 2026-2027',
    units: 14,
    semesterGpa: null,
    cumulativeGpa: null,
    unitsTotal: 94,
    inProgress: true,
    courses: [
      { code: '40-221', title: 'Technical Presentation', units: 2, grade: 'N' },
      { code: '40-415', title: 'Theory of Machines & Languages', units: 3, grade: 'N' },
      { code: '40-424', title: 'Operating Systems', units: 3, grade: 'N' },
      { code: '40-443', title: 'Computer Networks', units: 3, grade: 'N' },
      { code: '40-816', title: 'Security & Privacy of Machine Learning', units: 3, grade: 'N', graduate: true },
    ],
  },
];

/** Grade codes that are not numeric scores. */
export const GRADE_CODES = {
  W: { label: 'Withdrawn', note: 'Withdrawn from the course; excluded from all averages.' },
  N: { label: 'In progress', note: 'Currently enrolled; grade not yet available.' },
  P_GO: { label: 'Pass — Good', note: 'Pass/fail course, graded “Good”; carries no numeric score.' },
};

/** Flat course list, each row carrying its semester. */
export const COURSES = SEMESTERS.flatMap((s) =>
  s.courses.map((c) => ({
    ...c,
    semesterId: s.id,
    semesterLabel: s.label,
    semesterShort: s.short,
    numeric: typeof c.grade === 'number',
  }))
);

/** The two series for the progression chart — graded semesters only. */
export const GPA_SERIES = SEMESTERS.filter((s) => s.semesterGpa !== null).map((s) => ({
  id: s.id,
  label: s.label,
  short: s.short,
  semester: s.semesterGpa,
  cumulative: s.cumulativeGpa,
  units: s.units,
  unitsTotal: s.unitsTotal,
}));

export const TOTALS = {
  unitsEarned: 94,
  unitsInProgress: 14,
  gradedSemesters: GPA_SERIES.length,
  coursesGraded: COURSES.filter((c) => c.numeric).length,
  perfectScores: COURSES.filter((c) => c.grade === 20).length,
};
