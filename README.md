# AI Survey

Quick AI Awareness Survey for HR professionals.

- Open `/` for participants to take the survey.
- Open `/facilitator` for the organiser dashboard.

## Employee ID uniqueness

Participants must enter both their name and Employee ID before starting the survey. The survey checks the Google Apps Script API before showing the first question:

```text
GET ?action=checkEmployeeId&employeeId=E123456
```

If the Employee ID already exists, the participant is warned that continuing will overwrite the previous survey response. Final submission sends `employeeId` with the response payload, and the Google Apps Script backend must upsert by Employee ID so the Google Sheet stores only one current response per Employee ID.

## Google Apps Script update

The Apps Script source to paste into the Google Sheet's Apps Script editor is in [`apps-script/code.gs`](apps-script/code.gs).

After updating Apps Script:

1. Open the response Google Sheet.
2. Go to **Extensions > Apps Script**.
3. Replace `Code.gs` with `apps-script/code.gs`.
4. Go to **Deploy > Manage deployments**.
5. Edit the existing web app deployment, choose **New version**, and deploy.
6. Keep the same access settings as the current deployment so the existing survey pages can call the API.
7. Open the web app URL with `?action=setup` once, for example `https://script.google.com/macros/s/.../exec?action=setup`. This creates or repairs the `Employee ID` column in the actual response sheet and reports any duplicate Employee IDs already present.
8. If `setup` reports duplicate Employee IDs from earlier test/live submissions, open the web app URL with `?action=dedupeEmployeeIds` once. This keeps the latest row for each Employee ID and removes older duplicate rows.

The script uses the existing response sheet where possible instead of silently creating a new empty sheet. It inserts `Employee ID` immediately after `Timestamp` when that column is missing, then uses that column to update an existing row rather than append a duplicate row for the same Employee ID. If duplicate rows already exist for the same Employee ID, a future submit for that ID updates the latest row and removes the older duplicates.

Required API actions:

- `GET ?action=setup`
- `GET ?action=dedupeEmployeeIds`
- `GET ?action=getMode`
- `GET ?action=getAll`
- `GET ?action=checkEmployeeId&employeeId=...`
- `POST { action: 'submit', employeeId, name, quad, quadLabel, score, timestamp, surveySet, answers }`
- `POST { action: 'reset' }`
- Optional: `POST { action: 'setMode', mode: 'pre' | 'post' }`

The response sheet uses these columns:

1. `Timestamp`
2. `Employee ID`
3. `Name`
4. `Survey Set`
5. `Quadrant`
6. `Quadrant Label`
7. `Score`
8. `Answers JSON`
