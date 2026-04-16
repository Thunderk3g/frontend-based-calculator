/**
 * Config Loader for Bajaj Life Goal Assure IV (ULIP)
 */

const ASSET_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || './';

export let CONFIG = {
    version: 'Unknown',
    updatedAt: 'Unknown',
    ratesLoadedCount: 0,
    charges: {
        allocation: {
            web: [],
            other: []
        },
        pac: {},
        pacInflationRate: 0.05,
        fmc: {}
    },
    saMultipliers: {
        below45: 10,
        above45: 10
    },
    constraints: {
        minAge: 0, // Age 0 is allowed for proposer
        maxAge: 60,
        maxMaturityAge: 75,
        minPremium: 25000
    }
};

export async function loadConfig() {
    try {
        const [dataResp, chargesResp, versionResp] = await Promise.all([
            fetch(`${ASSET_BASE}extracted_data.json`),
            fetch(`${ASSET_BASE}charges.json`),
            fetch(`${ASSET_BASE}version_control.json`)
        ]);

        if (!dataResp.ok || !chargesResp.ok) {
            console.warn('Failed to load JSONs, using hardcoded defaults');
            return;
        }

        const data = await dataResp.json();
        const chargesData = await chargesResp.json();
        let version = null;
        if (versionResp.ok) {
            version = await versionResp.json();
        }

        // 1. Version Info
        const lastEntry = Array.isArray(version) && version.length > 0 ? version[version.length - 1] : null;
        if (lastEntry) {
            CONFIG.version = `BI_Goal Assure IV_V01_${lastEntry[2] || 'ver18'}`;
            // Convert Excel date to JS if needed, fallback to logic
            CONFIG.updatedAt = lastEntry[0] ? new Date((lastEntry[0] - 25569) * 86400 * 1000).toLocaleDateString() : new Date().toLocaleDateString();
        }

        // 2. Charges
        if (chargesData) {
            CONFIG.charges = chargesData;
        }

        // 3. Extract SA Multipliers from Input sheet
        const inputSheet = data['Input'] || [];
        // From inspection, row 39 contains the "Sum Assured Factor"
        // Min SA = 10, Max SA = 20 (for age < 45 usually)
        for (let row of inputSheet) {
            if (row[0] === 'Sum Assured Factor') {
                // Typically fixed or varied by age
                CONFIG.saMultipliers.min = parseFloat(row[3]) || 7;
                CONFIG.saMultipliers.max = parseFloat(row[5]) || 20;
                CONFIG.saMultipliers.default = parseFloat(row[3]) || 10;
                break;
            }
        }

        console.log('CONFIG loaded from JSON:', CONFIG);
    } catch (err) {
        console.error('Error loading config:', err);
    }
}
