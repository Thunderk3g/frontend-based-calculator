# Calculation Engine — Full Specification (Sections 1–8)

This file is a structured, DOC-style extraction of the premium calculation logic. Each section is expressed as formulas, matrices, and exact pseudo-code. Where workbook cells or numeric table values are not present in the supplied extraction, the item is marked "Not found in provided material".

SECTION 1 – VARIABLE DEFINITIONS

Symbols and domains (use these symbols in formulas below):

- Age ∈ Z, Age_last_birthday (years). Domain: 18 ≤ Age ≤ 65 (eligibility).
- Gender ∈ {M, F, T}.
- Smk ∈ {0,1} where Smk = 1 if Smoker = Yes else 0.
- PT ∈ R+ (Policy Term in years). Constraint: Age + PT ≤ 85.
- PPT ∈ R+ ∪ {SpecialAliases} (Premium Payment Term).
- SA ∈ R+ (Sum Assured, ₹). Constraint: SA ≥ 5,000,000 (Noted in docs).
- Variant ∈ String (plan variant identifier, e.g., LS, LSP, ROP).
- Mode ∈ {Annual, HalfYearly, Quarterly, Monthly}.
- SISO ∈ {0,1} (SISO discount eligible flag).
- TASA ∈ {0,1} (TASA eligibility flag).
- Rider flags and amounts: ADB_flag ∈ {0,1}, ADB_SA ∈ R+; CI_flag, CI_SA; Care_flag, Care_SA; etc.
- AnnualIncome ∈ R+ (used for TASA eligibility).
- MedicalCategory ∈ {Medical, NonMedical} (selected table source).

Parameter symbols (used for loadings/discounts/taxes):

- L_smoker ≥ 1 (smoker multiplicative loading) — Not found as numeric in provided material.
- L_term_high ≥ 1 (term-based loading multiplier) — Not found as numeric.
- D_SISO = 0.06 if SISO=1 else 0 (SISO discount percent as documented).
- T_GST1 = 0.045 (GST Year 1); T_GSTn = 0.0225 (GST Year 2+).
- Modal factors: M_Annual = 1.0000, M_HalfYearly = 0.5100, M_Quarterly = 0.2600, M_Monthly = 0.0875.

Table function names (referenced functions):

- R_med(K) := rate-per-1000 returned from Medical_Rates for key K.
- R_nonmed(K) := rate-per-1000 returned from Non_Medical_Rates for key K.
- R_ADB(K_adb) := ADB rate returned from ADB_Rates (units: per 1000 unless stated otherwise).
- R_CI(K_ci) := CI rate returned from CI_Rates (units vary; see Section 2 notes).

Helper:

- Band(SA) := piecewise banding used in lookup key (50L→5,000,000; ≥1Cr→10,000,000).
- Key K := concat(Age, Gender, PT, PPT, Variant, SmkFlag, Band(SA)) (exact concatenation order follows workbook conventions; example given in docs "26M5910LSNSR").


SECTION 2 – BASE PREMIUM FORMULA

Notation: R(·) returns a rate in rupees per 1000 of SA unless otherwise indicated.

2.1 Lookup key and table selection

K := concat(Age, Gender, PT, PPT, Variant, Smk, Band(SA))

If MedicalCategory == "Medical" then

	BaseRate := R_med(K)

else

	BaseRate := R_nonmed(K)

end

2.2 Annualized base premium (mathematical)

	P_base_annual = (BaseRate / 1000) × SA

Units: rupees (₹) per annum.

2.3 Smoker handling

Option A (workbook uses smoker in key): Smk is embedded in K; BaseRate already reflects smoker loading.

Option B (multiplicative loading applied):

	P_base_annual := (BaseRate / 1000) × SA × L_smoker   where L_smoker > 1 when Smk = 1

Note: Numeric L_smoker not found in provided material.

2.4 Band(SA) piecewise definition

	Band(SA) =
	  { 5_000_000  if 5,000,000 ≤ SA < 10,000,000
	  {10_000_000  if SA ≥ 10,000,000

This band value is used in K and causes slab-based rate selection.


SECTION 3 – ADJUSTMENT MATRIX

Define annual component vector X:

	X = [P_base_annual, P_ADB_annual, P_CI_annual, P_Care_annual, ...]^T

Where each rider component j is:

	P_ADB_annual = (R_ADB(K_adb) / 1000) × ADB_SA    (if ADB_flag = 1 else 0)
	P_CI_annual  = R_CI(K_ci) × CI_SA                 (if CI_flag = 1 else 0)
	P_Care_annual= R_Care(K_care) × Care_SA           (if Care_flag = 1 else 0)

3.1 Modal factor matrix M1 (diagonal)

	M1 = diag(M_mode, M_mode, M_mode, ...)

where M_mode =
	{ M_Annual      if Mode = Annual
	{ M_HalfYearly  if Mode = HalfYearly
	{ M_Quarterly   if Mode = Quarterly
	{ M_Monthly     if Mode = Monthly

3.2 Loading matrix M2 (diagonal of multiplicative loadings)

	M2 = diag(L_base, L_ADB, L_CI, L_Care, ...)

L_base = Π applicable multipliers for base premium (term-loading, medical-loading, smoker-loading if multiplicative, commission-loading if embedded). Example:

	L_base = (1 + loading_term) × (1 + loading_medical) × (1 + loading_commission) × ...

Numeric loadings: Not found in provided material (mark as missing).

3.3 Discount matrix M3 (diagonal)

	M3 = diag( (1 - D_base), (1 - D_ADB), ... )

Typical discount: D_base = 0.06 if SISO = 1 else 0.

3.4 Combined transform

	Y = M1 × M2 × M3 × X

Installment pre-tax amount (single-period installment):

	P_installment_preGST = sum(Y)


SECTION 4 – CONDITIONAL RULES (PSEUDO-CODE & NESTED IFs)

The following pseudo-code is a deterministic translation of workbook logic. Replace missing numeric constants by reading the rate tables.

-- Eligibility checks
IF Age < 18 THEN RETURN ERROR("Age below minimum")
IF Age > 65 THEN RETURN ERROR("Age above maximum")
IF Age + PT > 85 THEN RETURN ERROR("Maturity age exceeds 85")
IF SA < 5_000_000 THEN RETURN ERROR("SA below minimum")

-- Build lookup band
IF SA >= 10_000_000 THEN band := 10_000_000
ELSE IF SA >= 5_000_000 THEN band := 5_000_000
ELSE band := SA  // fallback

K := concat(Age, Gender, PT, PPT, Variant, Smk, band)

-- Table selection
IF MedicalCategory == "Medical" THEN
	BaseRate := R_med(K)
ELSE
	BaseRate := R_nonmed(K)
END IF

-- Smoker treatment
IF Smk == 1 AND (workbook uses multiplicative smoker loading) THEN
	BaseRate := BaseRate × L_smoker
END IF

-- Calculate annual components
P_base_annual := (BaseRate / 1000) × SA

IF ADB_flag == 1 THEN
	P_ADB_annual := (R_ADB(K_adb) / 1000) × ADB_SA
ELSE
	P_ADB_annual := 0
END IF

IF CI_flag == 1 THEN
	P_CI_annual := R_CI(K_ci) × CI_SA
ELSE
	P_CI_annual := 0
END IF

-- High-term loading
IF PT > PT_threshold THEN
	L_term := 1 + loading_value   // numeric missing
ELSE
	L_term := 1
END IF

-- Discount application
IF SISO == 1 THEN
	D_base := 0.06
ELSE
	D_base := 0
END IF

-- Compose matrices and compute
X := [P_base_annual, P_ADB_annual, P_CI_annual, ...]^T
M1 := diag(M_mode,...)
M2 := diag(L_base × L_term × ..., ...)
M3 := diag(1 - D_base, ...)
Y := M1 × M2 × M3 × X
P_installment_preGST := sum(Y)

-- GST
IF Year == 1 THEN T_gst := 0.045 ELSE T_gst := 0.0225 END IF
P_installment_withGST := P_installment_preGST × (1 + T_gst)

-- Rounding & minimums
// Rounding rules: Not found in provided material. Apply rupee/paise rounding as per business rules.
// Minimum premium constraints: Not found explicitly; enforce if present in rate rules.


SECTION 5 – CORRELATION MAPPING (DEPENDENCY TREE)

Premium ← {
	BaseRateTable (R_med or R_nonmed) ← {Age, Gender, PT, PPT, Variant, Smk, Band(SA)},
	ModalFactor ← Mode,
	Loadings ← {smoker loading, term loading, medical loading, commission loading},
	Discounts ← {SISO, other discounts},
	RiderPremiums ← {ADB, CI, CarePlus, ...},
	GST ← {Year1: T_GST1, Year2+: T_GSTn},
	RoundingRules,
	EligibilityChecks ← {Age, SA, Age+PT}
}

Graph edges (concise):

- Age, PT, PPT, Variant, Smk, Band(SA) → BaseRateTable → BaseRate
- BaseRate, SA → P_base_annual
- Rider flags + rider SAs → Rider Tables → P_j_annual
- Mode → M1
- Loadings, Discounts → M2, M3
- (X, M1, M2, M3) → P_installment_preGST → GST → FinalInstallment


SECTION 6 – NON-LINEAR COMPONENTS

6.1 Slab-based pricing (Band(SA))

- Band(SA) creates a step function in K; BaseRate = R(...,Band(SA)) ⇒ piecewise constant changes at SA slab boundaries.

6.2 Age & term non-linearity

- Rates R(·) are typically non-linear with Age and PT; shape is table-driven (not continuous). This produces non-linear and discontinuous premium behavior as Age/PT cross table breakpoints.

6.3 Caps/floors and discrete toggles

- Rider addition is a discrete increment; toggling a rider creates a step in premium.
- Eligibility caps (Age+PT ≤ 85) produce hard discontinuities (reject cases).

6.4 Rounding / floor rules

- Not found in provided material: exact rounding (nearest rupee, up to next rupee, paise rounding) and minimum premium floors must be supplied.


SECTION 7 – FINAL END-TO-END FORMULA (EXACT FORM)

Define:

- Rb := BaseRate = R_med(K) or R_nonmed(K)
- Pb := P_base_annual = (Rb / 1000) × SA
- For rider j: Pj := P_j_annual (as defined in Section 3)
- X := Pb + Σ_j Pj
- M := M_mode (modal scalar)
- L := L_total (product of multiplicative loadings)
- D := D_total (product of (1 - discounts))
- T := GST rate for given year

Then the installment for a given year is:

	P_installment_withGST = [ (X) × M × L × D ] × (1 + T)

If component-level loadings/discounts apply, expand as:

	P_installment_withGST = Σ_i [ (P_i × M × L_i × (1 - D_i)) ] × (1 + T)

Where i indexes components (base, ADB, CI, ...).

Notes: Replace P_i with the per-component definitions: Pb = (Rb/1000)×SA; P_ADB = (R_ADB/1000)×ADB_SA; etc.


SECTION 8 – SENSITIVITY DIRECTION (PARTIALS)

State sign/shape of partial derivatives (direction only):

- ∂Premium/∂Age > 0  (positive; typically increasing at an accelerating rate depending on rate table slope)
- ∂Premium/∂PT  > 0  (positive; longer PT often → higher premium; stepwise if table-driven)
- ∂Premium/∂SA  > 0  (positive; linear within slab: Premium ∝ SA × (Rb/1000); slab boundary causes slope change)
- ∂Premium/∂PPT  = depends on R table; sign can be ± (not fixed)
- ∂Premium/∂Smk  > 0  (positive: smoker increases premium via higher R or multiplicative L_smoker)
- ∂Premium/∂Gender = sign depends on table (male vs female rate differences)
- ∂Premium/∂Mode = affects installment via M_mode; monthly installments larger nominally due to modal factors (Mode does not change annualized X unless modal loading implicit in rate tables)
- ∂Premium/∂RiderFlag > 0 (adds component Pj)
- ∂Premium/∂SISO < 0 (SISO reduces base by 6% when applicable)


MISSING / NOT FOUND (explicit numeric constants and rules)

- Exact numeric values: L_smoker, L_term thresholds/values, commission loading values — Not found in provided material.
- Exact rounding rules (paise/rupee rounding, rounding direction) — Not found.
- Full column/row definitions of Medical_Rates, Non_Medical_Rates, ADB_Rates (exact numeric grids) — Not provided in attachments here; rate tables exist in the workbook but were not included as numeric extracts.

If you provide the rate tables (CSV/JSON extracts) or the cell ranges used in lookups, I will convert them into explicit functions R_med(·), R_ADB(·), etc. and substitute numeric values into the formulas above.

---

End of specification.

