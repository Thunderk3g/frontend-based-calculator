# Bajaj Allianz Life Goal Assure IV - ULIP Calculator

A comprehensive web-based calculator for the **Goal Assure IV** Unit Linked Insurance Plan (ULIP). This tool provides detailed month-by-month projections, benefit illustrations, and rider premium calculations based on the official product spreadsheets.

## Key Features

- **Projection Engine**: Real-time monthly projections for 4%, 8%, and Custom growth scenarios.
- **Rider Support**: Calculates premiums for Accidental Death Benefit (ADB), Critical Illness (CI), and Life Care Plus riders.
- **Interactive ULIP Logic**:
    - Fund Management Charges (FMC) based on portfolio allocation.
    - Policy Administration Charges (PAC) and Mortality charges.
    - Premium Allocation Charges (multi-channel support: Web/Other).
- **Benefit Illustration**: Detailed year-by-year table mirroring official BI documents.
- **Data-Driven**: Logic and rates are extracted directly from the source Excel workbook (`.xlsb`).

## Project Structure

```text
├── BI_Goal Assure IV_V01_ver18.xlsb  # Source of truth (Excel)
├── scripts/
│   ├── extract_all.py               # Python script to extract JSON rates/charges
│   └── copy-data.cjs                # Node script to prepare web assets
├── web/                             # Vite-based frontend
│   ├── src/
│   │   ├── calc.js                  # Core calculation logic
│   │   ├── ui.js                    # UI and rendering logic
│   │   └── config.js                # Shared constants and constraints
│   ├── public/                      # Static assets and extracted JSON data
│   └── tests/                       # JS test suite
└── package.json                     # Main project configuration
```

## Getting Started

### Prerequisites

- **Node.js**: v14 or higher (v18+ recommended)
- **Python**: 3.8+ (required for data extraction)
- **Pyxlsb**: `pip install pyxlsb` (for reading the Excel file)

### Installation

1.  Clone the repository and install dependencies:
    ```bash
    npm install
    ```

2.  Ensure Python dependencies are installed:
    ```bash
    pip install pyxlsb
    ```

### Development

To start the development server:
```bash
npm run dev
```
*Note: This will first run data preparation via `copy-data.cjs` and then start Vite.*

### Build for Production

To create a production build:
```bash
npm run build
```
The output will be generated in `web-dist/`.

## Data Pipeline

The calculator relies on JSON data extracted from the `BI_Goal Assure IV_V01_ver18.xlsb` workbook.

### Updating Rates and Charges
If the source Excel workbook is updated, run the extraction script to refresh the JSON data:

```bash
python scripts/extract_all.py
```

This script extracts:
- Mortality and Rider rates (`apr_rates.json`, `ci_rates.json`, etc.)
- Charge tables (`charges.json`)
- Validation metadata (`extracted_data.json`)

## Technical Details

### Calculation Engine
The `web/src/calc.js` module performs a month-by-month iteration to simulate fund value growth. It deducts charges (FMC, PAC, MORT) in the correct sequence and calculates death/maturity benefits according to product specifications.

### Testing
Automated tests are located in `web/tests/`. To run them (if configured with a test runner):
```bash
# Example test run (adjust based on actual runner like Vitest or Jest)
npm run test
```

## License

Private / Internal Use Only (Bajaj Allianz Life Insurance).
