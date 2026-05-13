/**
 * Employee ID maintenance follow-up for the live AI Survey Apps Script.
 *
 * Use this file only when the earlier Employee ID upsert PR is already live.
 * It avoids touching index.html, README.md, or the live Code.gs in this PR so the
 * branch can merge cleanly after the earlier PR has already been merged.
 *
 * To apply to the live Google Apps Script project:
 * 1. Copy the functions below into the live Apps Script project that already has:
 *    - getResponseSheet_()
 *    - getColumnIndexes_(sheet)
 *    - normalizeEmployeeId_(value)
 *    - jsonResponse(obj)
 * 2. Add this route to doGet(e):
 *    if (action === 'dedupeEmployeeIds') return jsonResponse(dedupeEmployeeIds_());
 * 3. Optionally update setupSheet_() to include duplicateEmployeeIds:
 *    const col = getColumnIndexes_(sheet);
 *    const duplicateEmployeeIds = getDuplicateEmployeeIds_(sheet, col.employeeId);
 *    return { ok: true, sheetName: sheet.getName(), headers, duplicateEmployeeIds };
 * 4. Deploy a new Apps Script web app version.
 * 5. Visit /exec?action=setup. If duplicateEmployeeIds is non-empty, visit
 *    /exec?action=dedupeEmployeeIds once to keep the latest row for each ID.
 */

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
