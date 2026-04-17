# Section-Wise Math Logic Guide

This guide breaks down the mathematical logic of the `BI_eTouch II_V05_Ver09.xlsb` workbook into logical sections for easier understanding.

## 1. Input Section (`Input` Sheet)
This section captures all user-provided data and initial selections.
- **Biographical Info**: Age, Gender, Smoker Category, Residence Status.
- **Policy Choices**: Plan Variant, Policy Term (PT), Premium Payment Term (PPT), Modal Frequency (Annual/Monthly).
- **Rider Selections**: Accidental Death Benefit (ADB), Critical Illness (CI), Care Plus, Family Protect (FPR).

## 2. Calculation Foundation (`Calc` & `CI Calc` Sheets)
This is where the core math happens, often hidden from the user.
- **Lookup Keys**: Formulas that concatenate inputs (e.g., `Age & Gender & Smoker`) to create unique keys for rate tables.
- **Rate Retrieval**: `VLOOKUP` functions that reach into the `Medical Rates`, `Non Medical Rates`, and `ADB Rates` sheets.
- **Factor Adjustments**: Modal factors (dividing annual rates into monthly) and discount factors (e.g., for online purchase or existing customers).

## 3. Base Premium Logic
Found primarily in `Calc` and then linked back to `Input` and `Output`.
- **Annual Premium**: `(Base Rate per 1000) * (Sum Assured / 1000)`
- **Instalment Premium**: `Annual Premium * Modal Factor`
- **TASA (Total Annualized Premium)**: Sum of all annualized premiums to check against income levels.

## 4. Rider Logic
Each rider has its own specific calculation logic:
- **Family Protect Rider (FPR)**: Based on `FPR_Base Rate` and adjusted for Spouse/Parental/Child selections.
- **Critical Illness (CI)**: A percentage of the base premium or a fixed rate per 1000 SA from the `CI Rates` sheet.
- **Care Plus Rider**: Uses specific rates from `Care Plus Rider Rates` based on the Prime/Selection variant.

## 5. Validation Section (`Input` & Validation Sheets)
Formulas that check if the inputs are valid before showing results.
- **Entry Age Limits**: Checks if `Age` is within the plan's minimum/maximum.
- **Maturity Limits**: `Age + PT` must not exceed the plan's maximum maturity age (e.g., 85).
- **Rider Caps**: Ensures rider Sum Assured doesn't exceed the base Sum Assured.

## 6. Output & GST Section (`Output` Sheet)
The final results presented to the customer.
- **GST Application**: 4.5% in the 1st year and 2.25% for renewal years (typically).
- **Total Premium**: `Instalment Premium + GST`.
- **Benefit Illustration**: Year-by-year projections of premiums and potential surrender values.

---
*For detailed formulas mapping to these sections, refer to the [Math Logic Report](math_logic_report.md).*
