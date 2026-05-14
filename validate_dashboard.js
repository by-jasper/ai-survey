#!/usr/bin/env node
const fs = require('fs');

function assertContains(text, needle, label){
  if(!text.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const fac = fs.readFileSync('facilitator.html','utf8');
const idx = fs.readFileSync('index.html','utf8');
const gas = fs.readFileSync('apps-script/code.gs','utf8');
const route = fs.readFileSync('facilitator/index.html','utf8');

// Facilitator scatter essentials
assertContains(fac, 'id="page-dashboard"', 'dashboard page');
assertContains(fac, 'id="scatter-canvas"', 'scatter canvas');
assertContains(fac, "function drawScatter()", 'drawScatter function');
assertContains(fac, "function loadData(fb)", 'loadData function');
assertContains(route, '../facilitator.html', 'extensionless facilitator route redirect');
assertContains(fac, "page-dashboard').classList.contains('active')) drawScatter()", 'loadData draw call');
assertContains(fac, "(1 - 0.50) * CH", '50% excitement threshold');
assertContains(fac, "fillText('E=50%'", 'E=50 axis label');
assertContains(fac, 'id="avg-excitement-score"', 'average excitement score card');
assertContains(fac, 'id="avg-awareness-score"', 'average awareness score card');
assertContains(fac, 'function calcRowAxisScores(r)', 'dashboard axis score fallback');
assertContains(fac, 'r.awarenessScore', 'dashboard awarenessScore field');
assertContains(fac, 'r.excitementScore', 'dashboard excitementScore field');
assertContains(fac, 'if(shouldBeHighE  && eRaw < 0.50) eRaw = 0.52;', 'scatter excitement high-side guard');
assertContains(fac, 'if(!shouldBeHighE && eRaw >= 0.50) eRaw = 0.48;', 'scatter excitement low-side guard');

// Survey axis-based quadrant essentials
assertContains(idx, 'function getSurveyQuestions(mode)', 'survey set question selector');
assertContains(idx, 'refreshSurveyMeta();', 'survey metadata refresh after mode load');
assertContains(idx, 'function getAxisScores()', 'getAxisScores function');
assertContains(idx, 'function calcQuad()', 'calcQuad function');
assertContains(idx, 'id="r-excitement-score"', 'participant excitement result row');
assertContains(idx, 'id="r-awareness-score"', 'participant awareness result row');
assertContains(idx, 'id="r-overall-score"', 'participant overall result row');
assertContains(idx, 'excitementScore,awarenessScore,score:tot', 'submission payload axis score order');
assertContains(idx, "return eScore>=0.5?(aScore>=0.5?'TR':'TL'):(aScore>=0.5?'BR':'BL');", '50% quadrant split logic');

assertContains(gas, "'AI Excitement Score',", 'Apps Script excitement header');
assertContains(gas, "'AI Awareness Score',", 'Apps Script awareness header');
assertContains(gas, 'excitementScore: row[col.excitementScore - 1]', 'Apps Script dashboard excitement return');
assertContains(gas, 'awarenessScore: row[col.awarenessScore - 1]', 'Apps Script dashboard awareness return');
assertContains(gas, 'function normalizeLegacyHeaders_(sheet)', 'Apps Script legacy header normalization');
assertContains(gas, "'Quad': 'Quadrant'", 'Apps Script Quad legacy alias');
assertContains(gas, "'Answers': 'Answers JSON'", 'Apps Script Answers legacy alias');
assertContains(gas, 'function ensureHeaderOrder_(sheet)', 'Apps Script header ordering repair');
assertContains(gas, 'function backfillAxisScores_(sheet)', 'Apps Script axis score backfill');
assertContains(gas, 'function normalizeAnswers_(answers)', 'Apps Script answer normalization');
assertContains(gas, 'const calculatedAxisScores = calculateAxisScoresFromAnswers_(answers);', 'Apps Script server-side axis fallback');
assertContains(gas, 'function calculateAxisScoresFromAnswers_(answersJson)', 'Apps Script answer-based axis calculation');

console.log('Dashboard validation passed');
