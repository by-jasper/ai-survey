// questions.js — HR & AI Adoption Survey Questions
// 14 questions total: 7 AI Awareness + 7 AI Excitement, 4 options each (scored 0–3)
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

const AWARENESS_QUESTIONS = [
  {section:"Awareness",axis:"awareness",q:"How would you describe your overall awareness of AI tools that is applicable to your work?",o:["Not aware at all","Slightly aware, but limited understanding","Moderately aware and understand key tools","Highly aware and keep up with developments regularly"]},
  {section:"Awareness",axis:"awareness",q:"How would you describe your current utilisation of AI tools in your work?",o:["I do not use AI tools in my work","I rarely use AI tools in my work (once a month or less)","I use AI tools occasionally in my work (a few times a month)","I use AI tools frequently in my work (weekly or more)"]},
  {section:"Awareness",axis:"awareness",q:"When you come across a new AI tool, how do you typically respond?",o:["I ignore it — not relevant to me","I review basic information but rarely try it","I test it occasionally to assess its relevance","I actively explore and adopt it where applicable"]},
  {section:"Awareness",axis:"awareness",q:"Which HR tasks have you personally used AI to help with? (pick the most advanced)",o:["I have not used AI for any HR tasks","Basic administrative tasks (e.g. drafting emails, simple summaries)","Intermediate tasks (e.g. analysing survey results, preparing reports, drafting policies)","Advanced tasks (e.g. workforce planning insights, predictive analysis, decision support)"]},
  {section:"Awareness",axis:"awareness",q:"How well do you understand the risks of using AI in your work (e.g. bias, data privacy)?",o:["I have no understanding of these risks","I have a basic awareness of the risks","I have a good understanding and consider them in my work","I have a strong understanding and actively manage these risks in practice"]},
  {section:"Awareness",axis:"awareness",q:"How would you rate the support available to HR staff for learning AI skills?",o:["No support at all — we're on our own","Minimal — some resources exist but not structured","Moderate — there are programmes but gaps remain","Strong — clear learning pathways and active support"]},
  {section:"Awareness",axis:"awareness",q:"How much has AI changed the way your team operates day-to-day?",o:["Not at all — we work exactly as before","Slightly — one or two tools have been adopted","Noticeably — several workflows have changed","Significantly — AI is reshaping how we work"]}
];

const EXCITEMENT_QUESTIONS = [
  {section:"Excitement",axis:"excitement",q:"How do you feel if AI is being introduced into your work?",o:["Uncomfortable — I would prefer status quo","Cautious — I am open but have some concerns","Optimistic — I see more benefits than risks","Excited — I want to be at the front of this change"]},
  {section:"Excitement",axis:"excitement",q:"If you were allocated one hour per week to explore AI tools, how would you most likely use it?",o:["Prefer to use the time for regular work","I would review materials or observe demonstrations","I would experiment with AI tools for basic tasks","I would actively test and apply AI tools to improve my work processes"]},
  {section:"Excitement",axis:"excitement",q:"How motivated are you to upskill in AI-related competencies in the next 12 months?",o:["Not motivated — I don't see the value for my role","Slightly motivated — I would do it only if it was required","Motivated — I have a specific plan to upskill this year","Very motivated — I have already started and am making progress"]},
  {section:"Excitement",axis:"excitement",q:'To what extent do you agree with the statement: "AI will enhance my effectiveness at work rather than replace my role"?',o:["Strongly disagree — I think it threatens my role","Disagree — I am not convinced yet","Agree — I can see how it helps","Strongly Agree — I am already experiencing this"]},
  {section:"Excitement",axis:"excitement",q:"How confident are you that you will thrive in an AI-enabled work environment over the next 3 years?",o:["Not confident — I am worried about falling behind","Uncertain — I will manage but it will be a stretch","Fairly confident — I am actively building the right skills","Very confident — I am already ahead of where I need to be"]},
  {section:"Excitement",axis:"excitement",q:"Which statement best reflects your view on AI's impact on HR over the next 5 years?",o:["AI will disrupt HR in ways that worry me greatly","AI will bring changes I find mostly unsettling","AI will improve HR, though I have some reservations","AI will elevate HR into a far more strategic function"]},
  {section:"Excitement",axis:"excitement",q:"Complete this sentence: 'My role in SMRT's AI journey is…'",o:["…not something I have thought about","…to follow along and support what is decided","…to stay informed and contribute when I can","…to help lead, shape, and accelerate our AI adoption"]}
];

const SURVEY_SETS = {
  pre:[...AWARENESS_QUESTIONS, ...EXCITEMENT_QUESTIONS],
  post:[...AWARENESS_QUESTIONS, ...EXCITEMENT_QUESTIONS]
};

const QUESTIONS = SURVEY_SETS.pre;

const AWARENESS_CHANGE_EXPLANATION = {
  increase:"Awareness increased when post-game awareness score is higher than pre-game. This indicates stronger understanding of AI use cases, risk controls, and practical application confidence.",
  remain:"Awareness remained when post-game and pre-game scores are unchanged. This usually means the session reinforced existing understanding but did not yet shift confidence depth.",
  reduce:"Awareness reduced when post-game awareness score is lower than pre-game. This can happen when participants become more realistic about complexity; treat it as a signal for targeted follow-up coaching."
};

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
if (typeof module !== 'undefined') module.exports = { QUIZ_CONFIG, SURVEY_SETS, QUESTIONS, QUADRANTS, AWARENESS_CHANGE_EXPLANATION };
