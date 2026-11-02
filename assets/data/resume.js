/**
 * Résumé content, transcribed from cv.pdf (assets/cv.pdf).
 * Edit text here — never in index.html or the render modules.
 */

export const PROFILE = {
  firstName: 'Iliya',
  lastName: 'Forsati',
  fullName: 'Iliya Forsati',
  role: 'B.Sc. Student in Computer Engineering',
  institution: 'Sharif University of Technology',
  location: 'Tehran, Iran',
  // Assembled at runtime so naive scrapers don't lift these verbatim from the HTML.
  email: { user: 'iliya.forsati84', domain: 'sharif.edu' },
  phone: { cc: '+98', parts: ['915', '367', '5903'] },
  github: 'IliyaForsati',
  cv: 'assets/cv.pdf',
  tagline:
    'Trustworthy and secure machine learning — probing where large language models break, and building the methods that find it first.',
};

export const RESEARCH_INTERESTS = {
  statement:
    'Trustworthy and secure machine learning, with a focus on large language models: backdoor attacks and defenses, trigger inversion, adversarial robustness, jailbreak attacks and safety alignment, red-teaming, and the security of LLM-based agents.',
  areas: [
    {
      title: 'Backdoor Attacks & Defenses',
      blurb:
        'Hidden behaviours planted in a model during training that stay dormant until a specific trigger appears — and the scanners that detect them before deployment.',
      primary: true,
    },
    {
      title: 'Trigger Inversion',
      blurb:
        'Recovering the exact input that activates a backdoor, rather than only flagging that one exists. Knowing the trigger is what makes a finding actionable.',
      primary: true,
    },
    {
      title: 'Adversarial Robustness',
      blurb:
        'How models behave under inputs crafted to break them, and what it takes for that behaviour to stay reliable under pressure.',
    },
    {
      title: 'Jailbreaks & Safety Alignment',
      blurb:
        'The gap between a model’s stated guardrails and its actual refusal behaviour, and how alignment holds up against adaptive attacks.',
    },
    {
      title: 'Red-Teaming',
      blurb:
        'Adversarial evaluation as a discipline — systematically searching for failure modes instead of waiting for them to surface in production.',
    },
    {
      title: 'Security of LLM-Based Agents',
      blurb:
        'Models that call tools and act on the world inherit a far larger attack surface than models that only emit text.',
    },
  ],
};

export const EDUCATION = {
  institution: 'Sharif University of Technology',
  degree: 'B.Sc. in Computer Engineering',
  location: 'Tehran, Iran',
  start: 'Sep 2023',
  end: 'Jun 2028',
  endNote: 'expected',
  gpas: [
    {
      key: 'overall',
      value: 18.35,
      label: 'Overall GPA',
      note: 'All 94 units earned across seven graded semesters.',
    },
    {
      key: 'major',
      value: 18.93,
      label: 'Major GPA',
      note: 'Computer Engineering coursework only.',
    },
    {
      key: 'ai',
      value: 19.28,
      label: 'AI Coursework',
      note: 'The six AI, ML and theory courses most relevant to the research.',
    },
    {
      key: 'department',
      value: 17.49,
      label: 'Department Average',
      note: 'Cohort benchmark printed on the transcript — not an individual score.',
      benchmark: true,
    },
  ],
  /** Course codes that make up the AI-coursework figure, in CV order. */
  aiCoursework: [
    { code: '40-417', title: 'Artificial Intelligence', grade: 20.0 },
    { code: '40-181', title: 'Engineering Probability & Statistics', grade: 20.0 },
    { code: '40-354', title: 'Design of Algorithms', grade: 20.0 },
    { code: '40-254', title: 'Data Structures & Algorithms', grade: 19.5 },
    { code: '40-477', title: 'Machine Learning', grade: 19.2 },
    { code: '40-282', title: 'Linear Algebra', grade: 17.0 },
  ],
  inProgress: {
    label: 'In progress — Fall 2026',
    course: 'Security and Privacy of Machine Learning',
    note: 'Graduate course',
  },
};

export const RESEARCH_EXPERIENCE = [
  {
    lab: 'RIML Lab',
    institution: 'Sharif University of Technology',
    title: 'Undergraduate Researcher',
    advisor: 'Dr. Mohammad Hossein Rohban',
    location: 'Tehran, Iran',
    start: 'May 2026',
    end: 'present',
    bullets: [
      {
        lead: 'Method',
        text:
          'Developing a search-based method that detects backdoored LLMs and recovers both the <em>trigger</em> and the attacker’s <em>target</em>, using only the model’s output distribution.',
      },
      {
        lead: 'Results',
        text:
          'Evaluated on 128 models (TrojAI, the BAIT model zoo, and a harder set of stealthily poisoned models); matches or outperforms BAIT (Shen et al., IEEE S&amp;P 2025) on all sets and, unlike BAIT, also recovers the trigger.',
      },
      {
        lead: 'Role',
        text:
          'Contribute to method design, implementation, and experiments, and review related work to compare against prior scanners, working closely with senior graduate students in the lab.',
      },
    ],
  },
];

export const PUBLICATIONS = [
  {
    title: 'Black-Box Backdoor Scanning and Trigger Inversion for Large Language Models',
    titleNote: 'working title',
    authors: 'With M. H. Rohban and members of the RIML Lab.',
    status: 'Work in progress',
    venue: 'Planned submission to ICML 2027',
  },
];

export const TEACHING = [
  {
    course: 'Artificial Intelligence',
    role: 'Teaching Assistant',
    offerings: 4,
    period: 'Spring 2026 – Fall 2026',
    instructors: [
      'Dr. A. Marioriyad',
      'Dr. M. Soleymani',
      'Dr. E. Tanghatari',
      'Dr. A. Marioriyad and Dr. M. Fereydooni (co-taught)',
    ],
    bullets: ['Responsible for designing the practical and theoretical assignments.'],
  },
  {
    course: 'Machine Learning',
    role: 'Teaching Assistant',
    offerings: 3,
    period: 'Spring 2026 – Fall 2026',
    instructors: ['Dr. M. Motahari', 'Dr. M. Soleymani', 'Dr. A. Marioriyad'],
    bullets: ['Responsible for designing the practical assignments.'],
  },
  {
    course: 'Fundamentals & Advanced Programming',
    role: 'Head TA and TA',
    offerings: 3,
    period: 'Spring 2025 – Fall 2025',
    instructors: ['Dr. Zarei', 'Dr. Sadri', 'Dr. Najimi'],
    bullets: [
      'As head TA, led the TA team and designed the programming projects for more than 100 first-year students.',
    ],
    highlight: true,
  },
];

export const HONORS = [
  {
    title: 'Iranian University Entrance Exam',
    year: 2023,
    figure: 32,
    figureSuffix: 'nd',
    figureLabel: 'nationally',
    detail:
      'Ranked <strong>32nd nationally</strong> (21st in quota region) among more than 150,000 participants in the Mathematics and Physics track.',
    pool: 150000,
    quotaRank: 21,
  },
];

export const SKILLS = [
  {
    group: 'Machine Learning',
    items: ['PyTorch', 'Hugging Face Transformers', 'PEFT / LoRA', 'vLLM', 'scikit-learn'],
  },
  {
    group: 'Programming',
    items: ['Python', 'C/C++', 'SQL', 'Linux', 'Git', 'Docker', 'Kubernetes'],
  },
  {
    group: 'Languages',
    items: ['Persian (native)', 'English (fluent)'],
  },
];

export const REFERENCES = [
  {
    name: 'Dr. M. H. Rohban',
    affiliation: 'Department of Computer Engineering, Sharif University of Technology',
    email: { user: 'rohban', domain: 'sharif.edu' },
    relation: 'Research advisor',
  },
  {
    name: 'Dr. M. A. Abam',
    affiliation: 'Department of Computer Engineering, Sharif University of Technology',
    email: { user: 'abam', domain: 'sharif.edu' },
  },
  {
    name: 'Hossein Mirzaei',
    affiliation: 'EPFL, Switzerland',
    email: { user: 'hossein.mirzaeisadeghlou', domain: 'epfl.ch' },
  },
];

/** Nav + scroll-spy order. `id` must match the section element id. */
export const SECTIONS = [
  { id: 'top', label: 'Top', nav: false },
  { id: 'research', label: 'Research' },
  { id: 'education', label: 'Education' },
  { id: 'experience', label: 'Experience' },
  { id: 'publications', label: 'Publications' },
  { id: 'teaching', label: 'Teaching' },
  { id: 'honors', label: 'Honors' },
  { id: 'skills', label: 'Skills' },
  { id: 'transcript', label: 'Transcript' },
  { id: 'contact', label: 'Contact' },
];
