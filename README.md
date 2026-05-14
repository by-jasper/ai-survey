# AI Survey

Quick AI Awareness and Excitement Survey for HR professionals.

- Open `/` for participants to take the survey.
- Open `/facilitator` for the organiser dashboard. If your host does not support extensionless routes, open `/facilitator.html` directly.

## Survey scoring

The participant survey has 14 scored questions split evenly across two axes:

- 7 **AI Awareness** questions covering current use, AI literacy, governance/risk understanding, and organisational/team readiness.
- 7 **AI Excitement** questions covering enthusiasm, confidence, motivation to upskill, and adoption energy.

Each answer scores 0–3 (A=0, B=1, C=2, D=3). The participant result card and facilitator dashboard show:

1. `excitementScore` / **AI Excitement Score** — excitement-axis total as a percentage of 21 possible points.
2. `awarenessScore` / **AI Awareness Score** — awareness-axis total as a percentage of 21 possible points.
3. `score` / **Score** — overall total as a percentage of 42 possible points.

Quadrants still use the same 50% split on each axis: high/low awareness for the X-axis and high/low excitement for the Y-axis.

## Employee ID uniqueness

Participants must enter both their name and Employee ID before starting the survey. The survey checks the Google Apps Script API before showing the first question:

```text
GET ?action=checkEmployeeId&employeeId=E123456
```

If the Employee ID already exists, the participant is warned that continuing will overwrite the previous survey response. Final submission sends `employeeId` with the response payload, and the Google Apps Script backend upserts by Employee ID so the Google Sheet stores only one current response per Employee ID.

## Google Apps Script update

The Apps Script source to paste into the Google Sheet's Apps Script editor is in [`apps-script/code.gs`](apps-script/code.gs).

After updating Apps Script:

1. Open the response Google Sheet.
2. Go to **Extensions > Apps Script**.
3. Replace `Code.gs` with `apps-script/code.gs`.
4. Go to **Deploy > Manage deployments**.
5. Edit the existing web app deployment, choose **New version**, and deploy.
6. Keep the same access settings as the current deployment so the existing survey pages can call the API.

Required API actions:

- `GET ?action=getMode`
- `GET ?action=getAll`
- `GET ?action=checkEmployeeId&employeeId=...`
- `POST { action: 'submit', employeeId, name, quad, quadLabel, excitementScore, awarenessScore, score, timestamp, surveySet, answers }`
- `POST { action: 'reset' }`
- Optional: `POST { action: 'setMode', mode: 'pre' | 'post' }`

### Existing response sheets

You do **not** need to delete old response rows or manually insert the new headers. When the updated Apps Script runs, it repairs the response sheet automatically by:

- Renaming legacy headers (`Quad` → `Quadrant`, `Quad Label` → `Quadrant Label`, `Answers` → `Answers JSON`).
- Inserting blank `Employee ID` and `Survey Set` columns for older rows that did not collect those fields yet.
- Inserting `AI Excitement Score` and `AI Awareness Score` immediately before `Score`.
- Backfilling the two axis-score cells for older rows when the stored answers contain per-question scores and axis/section metadata.
- Preserving old row data in place so the dashboard can continue using stored `Score`, `Quadrant`, and answer JSON where available.

Older rows will only keep blank axis-score cells if their stored answers do not contain enough per-question detail to reconstruct the two axes. New submissions will populate both axis-score columns automatically.

The response sheet uses these columns:

1. `Timestamp`
2. `Employee ID`
3. `Name`
4. `Survey Set`
5. `Quadrant`
6. `Quadrant Label`
7. `AI Excitement Score`
8. `AI Awareness Score`
9. `Score`
10. `Answers JSON`

The dashboard API returns `excitementScore` and `awarenessScore` for rows that have those columns. New submissions store both scores explicitly, and the Apps Script backend recalculates them from the submitted answer payload if the client ever omits or sends invalid axis scores. For older rows without explicit axis-score values, the dashboard recalculates axis scores from stored answer data when available.
