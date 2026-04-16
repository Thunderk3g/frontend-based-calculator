import { calculatePremium, loadRateData } from '../src/calc.js';
import { CONFIG } from '../src/config.js';
// Mock fetch for the environment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

global.fetch = async (url) => {
    let filename = url.replace('./', '');
    let filepath = path.join(PUBLIC_DIR, filename);
    if (!fs.existsSync(filepath)) {
        return { ok: false };
    }
    const data = fs.readFileSync(filepath, 'utf8');
    return {
        ok: true,
        json: async () => JSON.parse(data)
    };
};

async function runTest() {
    // 1. Manually load config logic from config.js since it's browser-bound
    const [dataStr, chargesStr] = [
        fs.readFileSync(path.join(PUBLIC_DIR, 'extracted_data.json'), 'utf8'),
        fs.readFileSync(path.join(PUBLIC_DIR, 'charges.json'), 'utf8')
    ];

    // Inject charges
    CONFIG.charges = JSON.parse(chargesStr);

    // 2. Load rates
    await loadRateData();

    // 3. Test setup (Age 28, 20 PT, 10 PPT, 1M Premium)
    const inputs = {
        age: 28,
        gender: 'Male',
        smoker: 'Non Smoker',
        yearlyPremium: 1000000,
        mode: 'Annual',
        pt: 20,
        ppt: 10,
        saFactor: 10,
        channel: 'web',
        fundAllocations: {
            'Equity Growth Fund II': 50,
            'Bond Fund': 50
        },
        addons: { adb: false, ci: false, carePlus: false }
    };

    // 4. Run calculation
    console.log("Running calculation engine...");
    const res = calculatePremium(inputs);

    if (!res.success) {
        console.error("Calculation failed!", res.errors);
        process.exit(1);
    }

    console.log("\n--- RESULT SUMMARY ---");
    console.log("Base Premium:", res.basePremium);
    console.log("Total Annual with riders & GST:", res.totalAnnualWithGST);
    console.log("\n--- SCENARIO 1 (4%) ---");
    const s4Details = res.projections.scenario4;
    console.log("Total Net Premiums (after alloc charge):", s4Details.totalNetPremiums);
    console.log("Total Alloc Charges:", s4Details.totalCharges.allocation);
    console.log("Total FMC:", s4Details.totalCharges.fmc);
    console.log(`Final Fund Value (End of Year ${inputs.pt}):`, s4Details.finalFundValue);

    console.log("\n--- SCENARIO 2 (8%) ---");
    const s8Details = res.projections.scenario8;
    console.log(`Final Fund Value (End of Year ${inputs.pt}):`, s8Details.finalFundValue);

    console.log("\n--- Year 1 snapshot (8%) ---");
    console.log(s8Details.yearlyDetails[0]);

    console.log("\nVerification Complete.");
}

runTest().catch(console.error);
