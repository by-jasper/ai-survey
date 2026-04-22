// questions.js — HR & AI Adoption Survey Questions
// 20 questions across 4 themes, 4 options each (scored 0–3)
// Edit this file to update questions without touching index.html or facilitator.html

const QUIZ_CONFIG = {
  title: "HR & AI Adoption Survey",
  subtitle: "Help us understand where we stand on AI — honest answers only!",
  org: "SMRT Corporation · HR Department",
  estimatedMinutes: 6
};

// Scoring axes:
// AWARENESS sections  → used to plot X-axis (left = low, right = high)
// EXCITEMENT sections → used to plot Y-axis (top = high, bottom = low)

const QUESTIONS = [

  // ── THEME 1: AI Awareness & Current Use (AWARENESS) ──
  {
    section: "AI Awareness & Current Use",
    axis: "awareness",
    q: "How would you describe your current use of AI tools in your HR work?",
    o: [
      "I don't use any AI tools at all",
      "I've tried one or two tools but not regularly",
      "I use AI tools a few times a week",
      "AI is a core part of how I work every day"
    ]
  },
  {
    section: "AI Awareness & Current Use",
    axis: "awareness",
    q: "When you hear about a new AI tool for HR, what do you typically do?",
    o: [
      "I ignore it — not relevant to me",
      "I read about it but rarely try it",
      "I explore it and test it out",
      "I actively evaluate it and share findings with my team"
    ]
  },
  {
    section: "AI Awareness & Current Use",
    axis: "awareness",
    q: "How confident are you explaining what generative AI (e.g. ChatGPT, Copilot) can do for HR tasks?",
    o: [
      "Not confident — I'm not sure what it does",
      "Slightly confident — I have a basic idea",
      "Fairly confident — I can explain the key uses",
      "Very confident — I can guide others on using it"
    ]
  },
  {
    section: "AI Awareness & Current Use",
    axis: "awareness",
    q: "Which HR tasks have you personally used AI to help with? (Pick the most advanced)",
    o: [
      "None yet",
      "Writing or editing documents (JDs, emails, policies)",
      "Analysing data, summarising feedback, or generating reports",
      "End-to-end workflows like screening, onboarding, or chatbot queries"
    ]
  },
  {
    section: "AI Awareness & Current Use",
    axis: "awareness",
    q: "How well do you understand the risks of using AI in HR (e.g. bias, data privacy)?",
    o: [
      "I haven't thought about this much",
      "I'm aware risks exist but don't know the details",
      "I understand the main risks and take precautions",
      "I can identify, discuss, and mitigate AI risks confidently"
    ]
  },

  // ── THEME 2: Attitude & Acceptance (EXCITEMENT) ──
  {
    section: "Attitude & Acceptance",
    axis: "excitement",
    q: "How do you feel about AI being introduced into your HR role?",
    o: [
      "Uncomfortable — I'd rather things stay as they are",
      "Cautious — I'm open but have real concerns",
      "Optimistic — I see more benefits than risks",
      "Excited — I want to be at the front of this change"
    ]
  },
  {
    section: "Attitude & Acceptance",
    axis: "excitement",
    q: "When a new AI tool is rolled out at work, your instinct is to…",
    o: [
      "Wait and see — let others test it first",
      "Use it only when required to",
      "Try it out when I have time",
      "Dive in immediately and share what I learn"
    ]
  },
  {
    section: "Attitude & Acceptance",
    axis: "excitement",
    q: "How much do you agree: 'AI will make me better at my HR job, not replace it'?",
    o: [
      "Strongly disagree — I think it threatens my role",
      "Somewhat disagree — I'm not convinced yet",
      "Somewhat agree — I can see how it helps",
      "Strongly agree — I'm already experiencing this"
    ]
  },
  {
    section: "Attitude & Acceptance",
    axis: "excitement",
    q: "How do you feel about employees interacting with AI chatbots for HR queries instead of a human?",
    o: [
      "Very uncomfortable — HR should always be human",
      "Uncomfortable for most situations",
      "Fine for routine queries, humans for complex issues",
      "Fully supportive — it frees HR for more strategic work"
    ]
  },
  {
    section: "Attitude & Acceptance",
    axis: "excitement",
    q: "If your team were given one hour a week to experiment with AI tools, you would…",
    o: [
      "Prefer to use that time for regular work",
      "Participate but without much expectation",
      "Join in and try to find something useful",
      "Come prepared with ideas and lead experiments"
    ]
  },

  // ── THEME 3: Organisational Readiness (AWARENESS) ──
  {
    section: "Organisational Readiness",
    axis: "awareness",
    q: "How clearly has SMRT communicated its AI strategy to HR staff?",
    o: [
      "I have no idea what the AI strategy is",
      "I've heard something but it's vague",
      "I have a general understanding of the direction",
      "I clearly understand the strategy and my role in it"
    ]
  },
  {
    section: "Organisational Readiness",
    axis: "awareness",
    q: "How would you rate the support available to HR staff for learning AI skills?",
    o: [
      "No support at all — we're on our own",
      "Minimal — some resources exist but not structured",
      "Moderate — there are programmes but gaps remain",
      "Strong — clear learning pathways and active support"
    ]
  },
  {
    section: "Organisational Readiness",
    axis: "awareness",
    q: "How much has AI already changed the way your HR team operates day-to-day?",
    o: [
      "Not at all — we work exactly as before",
      "Slightly — one or two tools have been adopted",
      "Noticeably — several workflows have changed",
      "Significantly — AI is reshaping how we work"
    ]
  },
  {
    section: "Organisational Readiness",
    axis: "awareness",
    q: "Does your HR department have clear guidelines on how AI tools should be used ethically and safely?",
    o: [
      "No guidelines exist that I'm aware of",
      "Some informal guidance but nothing formal",
      "Guidelines exist but aren't widely known",
      "Clear, accessible guidelines are in place and communicated"
    ]
  },
  {
    section: "Organisational Readiness",
    axis: "awareness",
    q: "How effective is HR leadership at modelling and championing AI adoption?",
    o: [
      "Not effective — leadership hasn't engaged with this",
      "Slightly effective — some interest but little action",
      "Moderately effective — visible effort but inconsistent",
      "Very effective — leaders actively use and promote AI"
    ]
  },

  // ── THEME 4: Future Outlook & Confidence (EXCITEMENT) ──
  {
    section: "Future Outlook & Confidence",
    axis: "excitement",
    q: "How confident are you that you will thrive in an AI-enabled HR environment over the next 3 years?",
    o: [
      "Not confident — I'm worried about falling behind",
      "Somewhat unsure — I'll adapt but it will be difficult",
      "Fairly confident — I'm developing the right skills",
      "Very confident — I'm ready and actively preparing"
    ]
  },
  {
    section: "Future Outlook & Confidence",
    axis: "excitement",
    q: "How motivated are you to upskill in AI-related competencies in the next 12 months?",
    o: [
      "Not motivated — I don't see the value",
      "Slightly motivated — I'd do it if required",
      "Motivated — I plan to pursue this proactively",
      "Very motivated — I've already started upskilling"
    ]
  },
  {
    section: "Future Outlook & Confidence",
    axis: "excitement",
    q: "Which statement best reflects your view on AI's impact on HR over the next 5 years?",
    o: [
      "AI will disrupt HR in ways that concern me greatly",
      "AI will change HR but most of it makes me uneasy",
      "AI will transform HR mostly for the better",
      "AI will elevate HR into a far more strategic function"
    ]
  },
  {
    section: "Future Outlook & Confidence",
    axis: "excitement",
    q: "How likely are you to recommend an AI tool to a colleague if you found it useful?",
    o: [
      "Unlikely — I prefer people find their own way",
      "Possibly — if they specifically asked me",
      "Likely — I'd mention it naturally in conversation",
      "Very likely — I'd actively share and demonstrate it"
    ]
  },
  {
    section: "Future Outlook & Confidence",
    axis: "excitement",
    q: "Complete this sentence: 'My role in SMRT's AI journey is…'",
    o: [
      "…not something I've thought about",
      "…to support whatever is decided for me",
      "…to adapt, learn, and contribute as changes happen",
      "…to help lead, shape, and accelerate our AI adoption"
    ]
  }

];

// Matrix quadrant definitions
const QUADRANTS = {
  TR: {
    name: "AI Advocates",
    tagline: "High awareness · High enthusiasm",
    color: "#E6F1FB",
    textColor: "#042C53",
    praise: "You are among the most ready in the room. Your combination of hands-on AI experience and genuine enthusiasm makes you a natural change agent.",
    suggestion: "Step up as an AI Ambassador — run lunch-and-learns, mentor colleagues, and help shape SMRT's AI governance guidelines."
  },
  TL: {
    name: "Enthusiastic Learners",
    tagline: "High enthusiasm · Growing awareness",
    color: "#E1F5EE",
    textColor: "#085041",
    praise: "Your energy and openness toward AI is exactly what the team needs. You bring the right mindset — the knowledge will follow.",
    suggestion: "Channel your enthusiasm into structured learning. Sign up for an AI literacy course and pair up with an AI Advocate to accelerate your growth."
  },
  BR: {
    name: "Informed Sceptics",
    tagline: "High awareness · Thoughtful caution",
    color: "#FAECE7",
    textColor: "#4A1B0C",
    praise: "Your critical thinking and awareness of AI's complexities is a real asset. Every team needs someone who asks the hard questions.",
    suggestion: "Your voice matters in shaping responsible AI adoption. Get involved in governance discussions and help build the ethical guardrails the team needs."
  },
  BL: {
    name: "Cautious Observers",
    tagline: "Building awareness · Exploring confidence",
    color: "#FAEEDA",
    textColor: "#412402",
    praise: "You are in good company — many people are at this stage. Taking a measured approach to change is completely valid and shows sound judgement.",
    suggestion: "Start small and safe: try one AI tool for a task you do daily. Curiosity is the first step. The HR team's AI journey has room for everyone."
  }
};

// Export for use in index.html and facilitator.html
if (typeof module !== 'undefined') module.exports = { QUIZ_CONFIG, QUESTIONS, QUADRANTS };
