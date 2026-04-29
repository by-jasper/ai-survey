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

const SURVEY_SETS = {
  pre:[
    {section:"AI Awareness & Current Use",axis:"awareness",q:"How would you describe your current use of AI tools in your HR work?",o:["I don't use any AI tools at all","I've tried one or two tools but not regularly","I use AI tools a few times a week","AI is a core part of how I work every day"]},
    {section:"AI Awareness & Current Use",axis:"awareness",q:"How confident are you explaining what generative AI can do for HR tasks?",o:["Not confident","Slightly confident","Fairly confident","Very confident"]},
    {section:"AI Awareness & Current Use",axis:"awareness",q:"How well do you understand risks of AI in HR (bias, privacy, compliance)?",o:["I haven't thought about this much","I know risks exist but not details","I understand the main risks and precautions","I can identify and mitigate risks confidently"]},
    {section:"Organisational Readiness",axis:"awareness",q:"How clearly has SMRT communicated its AI direction to HR staff?",o:["Not clear at all","Somewhat vague","Generally clear","Very clear with clear role expectations"]},
    {section:"Organisational Readiness",axis:"awareness",q:"How clear are your team's AI usage guidelines?",o:["No guidelines I know of","Some informal guidance","Formal guidelines but unevenly applied","Clear and consistently applied"]},
    {section:"Organisational Readiness",axis:"awareness",q:"How much support exists for learning AI skills in HR?",o:["No support","Limited support","Moderate support","Strong, structured support"]},
    {section:"Organisational Readiness",axis:"awareness",q:"How prepared do you feel to apply AI responsibly in your role today?",o:["Not prepared","Slightly prepared","Mostly prepared","Highly prepared"]},
    {section:"Attitude & Acceptance",axis:"excitement",q:"How do you feel about AI being introduced into your HR role?",o:["Uncomfortable","Cautious but open","Optimistic","Excited"]},
    {section:"Attitude & Acceptance",axis:"excitement",q:"When a new AI tool is rolled out at work, your instinct is to…",o:["Wait and see","Use only if required","Try when time allows","Dive in and share learnings"]},
    {section:"Attitude & Acceptance",axis:"excitement",q:"How much do you agree: AI will make me better at my HR job?",o:["Strongly disagree","Somewhat disagree","Somewhat agree","Strongly agree"]},
    {section:"Future Outlook & Confidence",axis:"excitement",q:"How confident are you that you will thrive in an AI-enabled HR environment?",o:["Not confident","Uncertain","Fairly confident","Very confident"]},
    {section:"Future Outlook & Confidence",axis:"excitement",q:"How motivated are you to upskill in AI competencies this year?",o:["Not motivated","Slightly motivated","Motivated","Very motivated"]},
    {section:"Future Outlook & Confidence",axis:"excitement",q:"How likely are you to recommend or introduce an AI tool to your team?",o:["Very unlikely","Unlikely","Likely","Very likely"]},
    {section:"Future Outlook & Confidence",axis:"excitement",q:"My role in SMRT's AI journey is…",o:["Not something I've thought about","To follow and support decisions","To stay informed and contribute","To help lead and accelerate adoption"]}
  ],
  post:[
    {section:"AI Practice & Reflection",axis:"awareness",q:"After the game, how clearly can you explain practical AI use cases for HR?",o:["Still unclear","Somewhat clearer","Mostly clear","Very clear and specific"]},
    {section:"AI Practice & Reflection",axis:"awareness",q:"How confident are you now in writing effective prompts for HR tasks?",o:["Not confident","Slightly confident","Fairly confident","Very confident"]},
    {section:"AI Practice & Reflection",axis:"awareness",q:"How strong is your understanding of AI risk controls after the session?",o:["Still weak","Basic awareness","Good working understanding","Strong and actionable understanding"]},
    {section:"AI Practice & Reflection",axis:"awareness",q:"How ready are you to apply one AI workflow in your role this week?",o:["Not ready","Need more guidance","Ready with some support","Ready to execute independently"]},
    {section:"AI Governance & Team",axis:"awareness",q:"How clear are you on when to escalate AI-related risk or ethics concerns?",o:["Not clear","Somewhat clear","Clear in most cases","Very clear in all common cases"]},
    {section:"AI Governance & Team",axis:"awareness",q:"How well can your team distinguish between AI outputs to trust vs verify?",o:["Poorly","Inconsistently","Generally well","Very well and consistently"]},
    {section:"AI Governance & Team",axis:"awareness",q:"How prepared is your team to embed AI into current HR SOPs?",o:["Not prepared","Slightly prepared","Moderately prepared","Highly prepared"]},
    {section:"Adoption Energy",axis:"excitement",q:"How energised are you to continue experimenting with AI after this game?",o:["Not energised","Mildly energised","Energised","Highly energised"]},
    {section:"Adoption Energy",axis:"excitement",q:"How willing are you to mentor a colleague on one AI use case?",o:["Not willing","Only if asked","Willing","Very willing"]},
    {section:"Adoption Energy",axis:"excitement",q:"How much do you believe responsible AI can improve HR outcomes at SMRT?",o:["Very little","Some improvement","Clear improvement","Major improvement"]},
    {section:"Adoption Energy",axis:"excitement",q:"How comfortable are you discussing AI concerns openly with your team?",o:["Not comfortable","Somewhat comfortable","Comfortable","Very comfortable"]},
    {section:"Action Intent",axis:"excitement",q:"How committed are you to complete one AI-enabled HR task in the next 7 days?",o:["Not committed","Somewhat committed","Committed","Highly committed"]},
    {section:"Action Intent",axis:"excitement",q:"How likely are you to propose one AI improvement in your next team meeting?",o:["Very unlikely","Unlikely","Likely","Very likely"]},
    {section:"Action Intent",axis:"excitement",q:"Compared with before the game, your readiness now is…",o:["Lower","About the same","Higher","Much higher"]}
  ]
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
