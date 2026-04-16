# Excel Logic Viewer (Frontend)

This is a small, lightweight Vite-based frontend that displays the extracted Excel calculation logic and runs a simplified premium calculator in the browser.

Purpose
- Provide an interactive view of per-sheet formulas and simplified logic.
- Expose editable input fields (loaded from `extracted_data.json`) so you can experiment with the premium calculation in real time.

Quick start (Windows PowerShell)

1. From the repo root, install dependencies (first time only):

```powershell
npm install
```

2. Prepare data and start the dev server (copies JSON into `web/public` then runs Vite):

```powershell
npm run dev
```

3. Open the app in a browser: http://localhost:5173

What the app expects
- `web/public/extracted_data.json` — workbook Input/Output sheet values.
- `web/public/extracted_formulas_com.json` — extracted formulas and simplified logic.
- `web/public/named_ranges.json` — optional, used for label mapping.

These files are copied automatically by the `scripts/copy-data.js` preparer when you run `npm run dev` or `npm run build`.

Project layout (relevant files)
- `web/index.html` — app entry
- `web/main.js` — app bootstrap
- `web/src/app.js` — UI: sheet selector, table view, and interactive inputs
- `web/src/calc.js` — (if present) calculation engine used by the UI
- `web/public/*` — static JSON copies of extracted files

Extending the calculation
- Implement additional rules or the full Excel logic inside `web/src/calc.js` as pure JS functions that accept an inputs object and return the computed premium breakdown.
- Keep calculation pure and deterministic (no DOM). Unit-test with Node by importing the module and passing sample JSON inputs.

Troubleshooting
- If the app reports missing JSON, run:

```powershell
node scripts/copy-data.js
```

- If Vite fails to start, ensure Node >= 14 and `npm install` completed successfully.

Contact
- See the project root README.md for more context on extraction scripts and data sources.
