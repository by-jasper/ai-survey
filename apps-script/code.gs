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

const HEADERS = [
  'Timestamp',
  'Employee ID',
  'Name',
  'Survey Set',
  'Quadrant',
  'Quadrant Label',
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
  row[col.timestamp - 1] = timestamp;
  row[col.employeeId - 1] = employeeId;
  row[col.name - 1] = String(payload.name || '').trim();
  row[col.surveySet - 1] = normalizeSurveyMode_(payload.surveySet);
  row[col.quadrant - 1] = String(payload.quad || '').trim();
  row[col.quadrantLabel - 1] = String(payload.quadLabel || '').trim();
  row[col.score - 1] = payload.score === '' || payload.score === null || payload.score === undefined ? '' : Number(payload.score);
  row[col.answersJson - 1] = JSON.stringify(Array.isArray(payload.answers) ? payload.answers : []);
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
  const existing = sheet.getLastColumn() ? sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), HEADERS.length)).getValues()[0] : [];
  const missing = HEADERS.filter(header => existing.indexOf(header) === -1);

  if (sheet.getLastRow() === 0 || existing.every(cell => cell === '')) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    return;
  }

  if (missing.length) {
    sheet.getRange(1, existing.length + 1, 1, missing.length).setValues([missing]);
  }
}

function getColumnIndexes_(sheet) {
  ensureHeaders_(sheet);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const indexOf = header => headers.indexOf(header) + 1;
  return {
    timestamp: indexOf('Timestamp'),
    employeeId: indexOf('Employee ID'),
    name: indexOf('Name'),
    surveySet: indexOf('Survey Set'),
    quadrant: indexOf('Quadrant'),
    quadrantLabel: indexOf('Quadrant Label'),
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
