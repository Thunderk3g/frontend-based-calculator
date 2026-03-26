/**
 * Config Loader for Bajaj Life eTouch II
 * extracts all hardcoded constants from extracted_data.json and version_control.json
 */

export let CONFIG = {
    version: 'Unknown',
    updatedAt: 'Unknown',
    ratesLoadedCount: 0,
    modalFactors: {
        Annual: 1.0,
        'Half-Yearly': 0.51,
        Quarterly: 0.26,
        Monthly: 0.0875,
    },
    discounts: {
        online: 0.06,
        siso: 0.06,
        partner: 0.10,
        salaried: 0.05,
        insuranceForAll: 0.05,
        loyalty: 0.01,
        webAggregator: 0.06,
    },
    gst: {
        year1: 0,
        year2: 0,
    },
    ciLimits: {
        minSA: 50000,
        maxPT: 20,
        maxMaturityAge: 80,
    },
    fprBoundaries: {
        spouseMaxPT: 57,
        parentalMaxPT: 57,
        childMaxPT: 25,
        famCareMaxPT: 82,
    },
    constraints: {
        minAge: 18,
        maxAge: 65,
        maxMaturityAge: 85,
        minSA: 5000000,
    }
};

export async function loadConfig() {
    try {
        const [dataResp, versionResp] = await Promise.all([
            fetch('./extracted_data.json'),
            fetch('./version_control.json')
        ]);

        if (!dataResp.ok || !versionResp.ok) {
            console.warn('Failed to load config JSONs, using hardcoded defaults');
            return;
        }

        const data = await dataResp.json();
        const version = await versionResp.json();

        // 1. Version Info
        const lastEntry = Array.isArray(version) ? version[version.length - 1] : null;
        if (lastEntry) {
            CONFIG.version = `BI_eTouch II_V07_${lastEntry[2]}`;
            CONFIG.updatedAt = lastEntry[0] ? new Date((lastEntry[0] - 25569) * 86400 * 1000).toLocaleDateString() : new Date().toLocaleDateString();
        } else {
            CONFIG.version = version.tracker?.current_version || 'BI_eTouch II_V07_Ver0.2';
            CONFIG.updatedAt = version.tracker?.last_updated || new Date().toISOString();
        }

        // 2. Modal Factors from 'Calc' sheet
        const calcSheet = data['Calc'] || [];
        calcSheet.forEach(row => {
            const label = String(row[33] || '');
            const factor = parseFloat(row[35]);
            if (label && !isNaN(factor)) {
                if (label.includes('Yearly') && !label.includes('Half')) CONFIG.modalFactors.Annual = factor;
                if (label.includes('Half-yearly')) CONFIG.modalFactors['Half-Yearly'] = factor;
                if (label.includes('Quarterly')) CONFIG.modalFactors.Quarterly = factor;
                if (label.includes('Monthly')) CONFIG.modalFactors.Monthly = factor;
            }
        });

        // 3. Discounts from 'Calc' sheet
        calcSheet.forEach(row => {
            row.forEach(cell => {
                if (typeof cell === 'string') {
                    const match = cell.match(/(\d+)%/);
                    if (match) {
                        const val = parseInt(match[1]) / 100;
                        if (cell.includes('Online')) CONFIG.discounts.online = val;
                        if (cell.includes('SISO')) CONFIG.discounts.siso = val;
                        if (cell.includes('Partner')) CONFIG.discounts.partner = val;
                        if (cell.includes('Salaried')) CONFIG.discounts.salaried = val;
                        if (cell.includes('Insurance for All')) CONFIG.discounts.insuranceForAll = val;
                        if (cell.includes('Loyalty')) CONFIG.discounts.loyalty = val;
                        if (cell.includes('Web Aggregator')) CONFIG.discounts.webAggregator = val;
                    }
                }
            });
        });

        // 4. GST from 'Output' sheet
        const outputSheet = data['Output'] || [];
        outputSheet.forEach(row => {
            const label = String(row[5] || '');
            const value = parseFloat(row[7]);
            if (label.includes('GST Rate (First Year)')) CONFIG.gst.year1 = value;
            if (label.includes('GST Rate (Second Year Onwards)')) CONFIG.gst.year2 = value;
        });

        // 5. CI Limits from 'CI Calc' sheet
        const ciCalcSheet = data['CI Calc'] || [];
        ciCalcSheet.forEach(row => {
            const label = String(row[0] || '');
            const value = parseFloat(row[1]);
            if (label === 'Min SA') CONFIG.ciLimits.minSA = value;
            if (label === 'Max PT') CONFIG.ciLimits.maxPT = value;
            if (label === 'Max Maturity Age') CONFIG.ciLimits.maxMaturityAge = value;
        });

        // 6. FPR Boundaries from 'FPR_Boundary Conditions'
        const fprSheet = data['FPR_Boundary Conditions'] || [];
        const spouseRow = fprSheet.find(r => r[0] && r[0].includes('Spouse Care'));
        const parentalRow = fprSheet.find(r => r[0] && r[0].includes('Parental Care'));
        const childRow = fprSheet.find(r => r[0] && r[0].includes('Child Care'));
        const famRow = fprSheet.find(r => r[0] && r[0].includes('Fam Care'));

        CONFIG.fprBoundaries = {
            spouseMaxPT: parseFloat(spouseRow?.[1]) || 57,
            parentalMaxPT: parseFloat(parentalRow?.[1]) || 57,
            childMaxPT: parseFloat(childRow?.[1]) || 25,
            famCareMaxPT: parseFloat(famRow?.[1]) || 82
        };

        // 7. Care Plus Validations
        try {
            const cpResp = await fetch('./care_plus_validations.json');
            if (cpResp.ok) {
                const cpData = await cpResp.json();
                // Row 2, Col 13-14: Rider term 1, 20
                CONFIG.carePlusLimits = {
                    minPT: parseFloat(cpData[2][12]),
                    maxPT: parseFloat(cpData[2][13]),
                    minAge: parseFloat(cpData[0][12]),
                    maxAge: parseFloat(cpData[0][13]),
                    maxMaturityAge: parseFloat(cpData[1][13])
                };
            }
        } catch (e) {
            console.warn('Failed to load Care Plus validations', e);
        }

        console.log('CONFIG loaded from JSON:', CONFIG);
    } catch (err) {
        console.error('Error loading config:', err);
    }
}
