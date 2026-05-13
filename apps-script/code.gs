/**
 * Google Apps Script backend for the AI Survey.
 *
 * Deployment:
 * 1. Open the Google Sheet that stores responses.
 * 2. Extensions > Apps Script.
 * 3. Replace Code.gs with this file.
 * 4. Deploy > Manage deployments > Edit web app > New version > Deploy.
 * 5. Visit the web app URL with ?action=setup once to create/repair columns.
 */
const PREFERRED_RESPONSE_SHEET_NAME = 'Responses';
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

const HEADER_ALIASES = {
  'Timestamp': ['timestamp', 'time submitted', 'submitted at'],
  'Employee ID': ['employee id', 'employeeid', 'employee no', 'employee number', 'staff id', 'staffid'],
  'Name': ['name', 'participant', 'participant name', 'full name'],
  'Survey Set': ['survey set', 'surveyset', 'mode', 'survey mode'],
  'Quadrant': ['quadrant', 'quad'],
  'Quadrant Label': ['quadrant label', 'quadlabel', 'quad label', 'profile', 'persona'],
  'Score': ['score', 'total score'],
  'Answers JSON': ['answers json', 'answers', 'answersjson', 'response json']
};

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || '').trim();

  if (action === 'setup') return jsonResponse(setupSheet_());
  if (action === 'dedupeEmployeeIds') return jsonResponse(dedupeEmployeeIds_());
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
    const rowNumbers = findEmployeeRows_(sheet, col.employeeId, employeeId);

    if (rowNumbers.length) {
      const rowNumber = rowNumbers[rowNumbers.length - 1];
      sheet.getRange(rowNumber, 1, 1, rowValues.length).setValues([rowValues]);
      const removed = deleteRowsExcept_(sheet, rowNumbers, rowNumber);
      return jsonResponse({ ok: true, action: 'updated', employeeId, row: rowNumber, duplicateRowsRemoved: removed });
    }

    sheet.appendRow(rowValues);
    return jsonResponse({ ok: true, action: 'created', employeeId, row: sheet.getLastRow(), duplicateRowsRemoved: 0 });
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

function setupSheet_() {
  const sheet = getResponseSheet_();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const col = getColumnIndexes_(sheet);
  const duplicateEmployeeIds = getDuplicateEmployeeIds_(sheet, col.employeeId);
  return { ok: true, sheetName: sheet.getName(), headers, duplicateEmployeeIds };
}

function dedupeEmployeeIds_() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const sheet = getResponseSheet_();
    const col = getColumnIndexes_(sheet);
    const duplicateEmployeeIds = getDuplicateEmployeeIds_(sheet, col.employeeId);
    let removed = 0;

    duplicateEmployeeIds.forEach(employeeId => {
      const rows = findEmployeeRows_(sheet, col.employeeId, employeeId);
      if (rows.length > 1) removed += deleteRowsExcept_(sheet, rows, rows[rows.length - 1]);
    });

    return { ok: true, sheetName: sheet.getName(), duplicateEmployeeIds, duplicateRowsRemoved: removed };
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
  const rows = findEmployeeRows_(sheet, employeeIdColumn, employeeId);
  return rows.length ? rows[0] : null;
}

function findEmployeeRows_(sheet, employeeIdColumn, employeeId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const rows = [];
  const ids = sheet.getRange(2, employeeIdColumn, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (normalizeEmployeeId_(ids[i][0]) === employeeId) rows.push(i + 2);
  }
  return rows;
}

function getDuplicateEmployeeIds_(sheet, employeeIdColumn) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const counts = {};
  const ids = sheet.getRange(2, employeeIdColumn, lastRow - 1, 1).getValues();
  ids.forEach(row => {
    const employeeId = normalizeEmployeeId_(row[0]);
    if (employeeId) counts[employeeId] = (counts[employeeId] || 0) + 1;
  });
  return Object.keys(counts).filter(employeeId => counts[employeeId] > 1);
}

function deleteRowsExcept_(sheet, rowNumbers, keepRowNumber) {
  let removed = 0;
  rowNumbers
    .filter(rowNumber => rowNumber !== keepRowNumber)
    .sort((a, b) => b - a)
    .forEach(rowNumber => {
      sheet.deleteRow(rowNumber);
      removed++;
    });
  return removed;
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
  const preferred = ss.getSheetByName(PREFERRED_RESPONSE_SHEET_NAME);
  // Prefer a sheet that already contains survey data/headers, even if it is not named "Responses".
  // This prevents the script from writing to a newly-created blank Responses sheet while the
  // organiser is looking at the original response sheet.
  const sheet = findExistingSurveySheet_(ss) || preferred || ss.getActiveSheet() || ss.getSheets()[0];
  ensureHeaders_(sheet);
  return sheet;
}

function findExistingSurveySheet_(ss) {
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    if (sheet.getLastRow() < 1 || sheet.getLastColumn() < 1) continue;
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(normalizeHeader_);
    const hasSurveyHeaders = headers.includes('name') && (headers.includes('quadrant') || headers.includes('quad') || headers.includes('score'));
    if (hasSurveyHeaders) return sheet;
  }
  return null;
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    return;
  }

  let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (headers.every(cell => String(cell).trim() === '')) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    return;
  }

  renameKnownHeaders_(sheet);
  headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  if (findHeaderColumn_(headers, 'Employee ID') === 0) {
    const timestampCol = findHeaderColumn_(headers, 'Timestamp') || 1;
    sheet.insertColumnAfter(timestampCol);
    sheet.getRange(1, timestampCol + 1).setValue('Employee ID');
  }

  headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  HEADERS.forEach(header => {
    if (findHeaderColumn_(headers, header) === 0) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
      headers.push(header);
    }
  });
}

function renameKnownHeaders_(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  HEADERS.forEach(canonical => {
    const col = findHeaderColumn_(headers, canonical);
    if (col && headers[col - 1] !== canonical) sheet.getRange(1, col).setValue(canonical);
  });
}

function getColumnIndexes_(sheet) {
  ensureHeaders_(sheet);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return {
    timestamp: requireHeaderColumn_(headers, 'Timestamp'),
    employeeId: requireHeaderColumn_(headers, 'Employee ID'),
    name: requireHeaderColumn_(headers, 'Name'),
    surveySet: requireHeaderColumn_(headers, 'Survey Set'),
    quadrant: requireHeaderColumn_(headers, 'Quadrant'),
    quadrantLabel: requireHeaderColumn_(headers, 'Quadrant Label'),
    score: requireHeaderColumn_(headers, 'Score'),
    answersJson: requireHeaderColumn_(headers, 'Answers JSON')
  };
}

function requireHeaderColumn_(headers, canonical) {
  const col = findHeaderColumn_(headers, canonical);
  if (!col) throw new Error('Missing required header: ' + canonical);
  return col;
}

function findHeaderColumn_(headers, canonical) {
  const aliases = HEADER_ALIASES[canonical] || [canonical];
  const normalizedAliases = aliases.map(normalizeHeader_);
  for (let i = 0; i < headers.length; i++) {
    if (normalizedAliases.includes(normalizeHeader_(headers[i]))) return i + 1;
  }
  return 0;
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

function normalizeHeader_(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeSurveyMode_(value) {
  return String(value || '').trim().toLowerCase() === 'post' ? 'post' : 'pre';
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
