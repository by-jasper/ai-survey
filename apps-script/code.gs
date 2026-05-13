/**
 * Google Apps Script backend for the AI Survey.
 *
 * Deployment:
 * 1. Open the Google Sheet that stores responses.
 * 2. Extensions > Apps Script.
 * 3. Replace Code.gs with this file.
 * 4. Deploy > Manage deployments > Edit web app > New version > Deploy.
 * 5. Keep access as the setting already used by the current survey web app.
 */
const RESPONSE_SHEET_NAME = 'Responses';
const MODE_PROPERTY_KEY = 'surveyMode';
const AWARENESS_SECTION_NAMES = new Set([
  'AI Awareness & Current Use',
  'Organisational Readiness',
  'AI Practice & Reflection',
  'AI Governance & Team'
]);

const HEADERS = [
  'Timestamp',
  'Employee ID',
  'Name',
  'Survey Set',
  'Quadrant',
  'Quadrant Label',
  'AI Excitement Score',
  'AI Awareness Score',
  'Score',
  'Answers JSON'
];

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || '').trim();

  if (action === 'getAll') return jsonResponse({ data: getAllResponses_() });
  if (action === 'getMode') return jsonResponse({ mode: getSurveyMode_() });
  if (action === 'checkEmployeeId') {
    const employeeId = normalizeEmployeeId_(e.parameter.employeeId);
    return jsonResponse({ exists: employeeId ? employeeIdExists_(employeeId) : false });
  }

  return jsonResponse({ ok: true, message: 'AI Survey API is running.' });
}

function doPost(e) {
  let payload = {};
  try {
    payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return jsonResponse({ ok: false, error: 'Invalid JSON payload.' });
  }

  const action = String(payload.action || '').trim();
  if (action === 'submit') return submitResponse_(payload);
  if (action === 'reset') return resetResponses_();
  if (action === 'setMode') return setSurveyMode_(payload.mode);

  return jsonResponse({ ok: false, error: 'Unknown action.' });
}

function submitResponse_(payload) {
  const employeeId = normalizeEmployeeId_(payload.employeeId);
  if (!employeeId) return jsonResponse({ ok: false, error: 'Employee ID is required.' });

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const sheet = getResponseSheet_();
    const col = getColumnIndexes_(sheet);
    const rowValues = buildResponseRow_(sheet, col, payload, employeeId);
    const rowNumber = findEmployeeRow_(sheet, col.employeeId, employeeId);

    if (rowNumber) {
      sheet.getRange(rowNumber, 1, 1, rowValues.length).setValues([rowValues]);
      return jsonResponse({ ok: true, action: 'updated', employeeId });
    }

    sheet.appendRow(rowValues);
    return jsonResponse({ ok: true, action: 'created', employeeId });
  } finally {
    lock.releaseLock();
  }
}

function resetResponses_() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const sheet = getResponseSheet_();
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);
    return jsonResponse({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function getAllResponses_() {
  const sheet = getResponseSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const col = getColumnIndexes_(sheet);
  return values.slice(1).filter(row => row.some(cell => cell !== '')).map(row => {
    let answers = [];
    const answersJson = row[col.answersJson - 1];
    if (answersJson) {
      try { answers = JSON.parse(answersJson); } catch (err) { answers = []; }
    }

    return {
      timestamp: row[col.timestamp - 1],
      name: row[col.name - 1],
      surveySet: row[col.surveySet - 1],
      quad: row[col.quadrant - 1],
      quadLabel: row[col.quadrantLabel - 1],
      excitementScore: row[col.excitementScore - 1],
      awarenessScore: row[col.awarenessScore - 1],
      score: row[col.score - 1],
      answers
    };
  });
}

function employeeIdExists_(employeeId) {
  const sheet = getResponseSheet_();
  const col = getColumnIndexes_(sheet);
  return !!findEmployeeRow_(sheet, col.employeeId, employeeId);
}

function findEmployeeRow_(sheet, employeeIdColumn, employeeId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  const ids = sheet.getRange(2, employeeIdColumn, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (normalizeEmployeeId_(ids[i][0]) === employeeId) return i + 2;
  }
  return null;
}

function buildResponseRow_(sheet, col, payload, employeeId) {
  const row = new Array(sheet.getLastColumn()).fill('');
  const timestamp = payload.timestamp ? new Date(payload.timestamp) : new Date();
  const answers = normalizeAnswers_(payload.answers);
  const calculatedAxisScores = calculateAxisScoresFromAnswers_(answers);
  const excitementScore = toOptionalNumber_(payload.excitementScore);
  const awarenessScore = toOptionalNumber_(payload.awarenessScore);
  const overallScore = toOptionalNumber_(payload.score);

  row[col.timestamp - 1] = timestamp;
  row[col.employeeId - 1] = employeeId;
  row[col.name - 1] = String(payload.name || '').trim();
  row[col.surveySet - 1] = normalizeSurveyMode_(payload.surveySet);
  row[col.quadrant - 1] = String(payload.quad || '').trim();
  row[col.quadrantLabel - 1] = String(payload.quadLabel || '').trim();
  row[col.excitementScore - 1] = isValidNumber_(excitementScore) ? excitementScore : (calculatedAxisScores ? calculatedAxisScores.excitementScore : '');
  row[col.awarenessScore - 1] = isValidNumber_(awarenessScore) ? awarenessScore : (calculatedAxisScores ? calculatedAxisScores.awarenessScore : '');
  row[col.score - 1] = isValidNumber_(overallScore) ? overallScore : calculateOverallScoreFromAnswers_(answers);
  row[col.answersJson - 1] = JSON.stringify(answers);
  return row;
}

function getResponseSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(RESPONSE_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(RESPONSE_SHEET_NAME);
  ensureHeaders_(sheet);
  return sheet;
}

function ensureHeaders_(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const existing = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];

  if (sheet.getLastRow() === 0 || existing.every(cell => cell === '')) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    return;
  }

  normalizeLegacyHeaders_(sheet);
  ensureHeaderOrder_(sheet);
  backfillAxisScores_(sheet);
}

function normalizeLegacyHeaders_(sheet) {
  const aliases = {
    'Quad': 'Quadrant',
    'Quad Label': 'Quadrant Label',
    'Answers': 'Answers JSON'
  };
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  headers.forEach((header, index) => {
    const normalized = aliases[String(header || '').trim()];
    if (normalized) sheet.getRange(1, index + 1).setValue(normalized);
  });
}

function ensureHeaderOrder_(sheet) {
  HEADERS.forEach((header, index) => {
    const targetColumn = index + 1;
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const currentColumn = headers.indexOf(header) + 1;

    if (!currentColumn) {
      if (targetColumn <= sheet.getLastColumn()) {
        sheet.insertColumnBefore(targetColumn);
      } else {
        sheet.insertColumnAfter(sheet.getLastColumn());
      }
      sheet.getRange(1, targetColumn).setValue(header);
      return;
    }

    if (currentColumn !== targetColumn) {
      sheet.moveColumns(sheet.getRange(1, currentColumn, sheet.getMaxRows(), 1), targetColumn);
    }
  });
}

function backfillAxisScores_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const col = getColumnIndexesFromHeaders_(headers);
  const values = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  let changed = false;

  values.forEach(row => {
    const hasExcitement = row[col.excitementScore - 1] !== '' && row[col.excitementScore - 1] !== null;
    const hasAwareness = row[col.awarenessScore - 1] !== '' && row[col.awarenessScore - 1] !== null;
    if (hasExcitement && hasAwareness) return;

    const axisScores = calculateAxisScoresFromAnswers_(row[col.answersJson - 1]);
    if (!axisScores) return;

    if (!hasExcitement) {
      row[col.excitementScore - 1] = axisScores.excitementScore;
      changed = true;
    }
    if (!hasAwareness) {
      row[col.awarenessScore - 1] = axisScores.awarenessScore;
      changed = true;
    }
  });

  if (changed) sheet.getRange(2, 1, values.length, sheet.getLastColumn()).setValues(values);
}


function normalizeAnswers_(answers) {
  if (!Array.isArray(answers)) return [];
  return answers.map(answer => {
    const entry = answer || {};
    const score = toOptionalNumber_(entry.score);
    const normalized = {
      section: String(entry.section || '').trim(),
      axis: getAnswerAxis_(entry),
      question: String(entry.question || '').trim(),
      answer: String(entry.answer || '').trim(),
      score: isValidNumber_(score) ? score : 0
    };
    return normalized;
  });
}

function calculateOverallScoreFromAnswers_(answers) {
  if (!Array.isArray(answers) || !answers.length) return '';
  const total = answers.reduce((sum, answer) => sum + Number(answer.score || 0), 0);
  return Math.round(total / (answers.length * 3) * 100);
}

function calculateAxisScoresFromAnswers_(answersJson) {
  if (!answersJson) return null;

  let answers = [];
  try {
    answers = typeof answersJson === 'string' ? JSON.parse(answersJson) : answersJson;
  } catch (err) {
    return null;
  }
  if (!Array.isArray(answers) || !answers.length) return null;

  let awarenessTotal = 0;
  let awarenessCount = 0;
  let excitementTotal = 0;
  let excitementCount = 0;

  answers.forEach(answer => {
    const axis = getAnswerAxis_(answer);
    const score = Number(answer.score || 0);
    if (axis === 'awareness') {
      awarenessTotal += score;
      awarenessCount++;
    }
    if (axis === 'excitement') {
      excitementTotal += score;
      excitementCount++;
    }
  });

  if (!awarenessCount || !excitementCount) return null;
  return {
    awarenessScore: Math.round(awarenessTotal / (awarenessCount * 3) * 100),
    excitementScore: Math.round(excitementTotal / (excitementCount * 3) * 100)
  };
}

function getAnswerAxis_(answer) {
  const entry = answer || {};
  if (entry.axis === 'awareness' || entry.axis === 'excitement') return entry.axis;
  return AWARENESS_SECTION_NAMES.has(entry.section) ? 'awareness' : 'excitement';
}

function getColumnIndexes_(sheet) {
  ensureHeaders_(sheet);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return getColumnIndexesFromHeaders_(headers);
}

function getColumnIndexesFromHeaders_(headers) {
  const indexOf = header => headers.indexOf(header) + 1;
  return {
    timestamp: indexOf('Timestamp'),
    employeeId: indexOf('Employee ID'),
    name: indexOf('Name'),
    surveySet: indexOf('Survey Set'),
    quadrant: indexOf('Quadrant'),
    quadrantLabel: indexOf('Quadrant Label'),
    excitementScore: indexOf('AI Excitement Score'),
    awarenessScore: indexOf('AI Awareness Score'),
    score: indexOf('Score'),
    answersJson: indexOf('Answers JSON')
  };
}

function getSurveyMode_() {
  return normalizeSurveyMode_(PropertiesService.getScriptProperties().getProperty(MODE_PROPERTY_KEY) || 'pre');
}

function setSurveyMode_(mode) {
  const normalized = normalizeSurveyMode_(mode);
  PropertiesService.getScriptProperties().setProperty(MODE_PROPERTY_KEY, normalized);
  return jsonResponse({ ok: true, mode: normalized });
}

function toOptionalNumber_(value) {
  return value === '' || value === null || value === undefined ? '' : Number(value);
}

function isValidNumber_(value) {
  return value !== '' && value !== null && value !== undefined && !isNaN(Number(value));
}

function normalizeEmployeeId_(value) {
  return String(value || '').trim().toUpperCase();
}

function normalizeSurveyMode_(value) {
  return String(value || '').trim().toLowerCase() === 'post' ? 'post' : 'pre';
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
