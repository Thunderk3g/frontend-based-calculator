import { loadRateData, calculatePremium } from '../web/src/calc.js';
import fs from 'fs';
import path from 'path';

// Mock browser fetch for NodeJS
global.fetch = async (url) => {
    const filename = url.replace(/^\//, '').split('/').pop();
    const filePath = path.join(process.cwd(), 'web', 'public', filename);
    if (!fs.existsSync(filePath)) return { ok: false, status: 404 };
    const content = fs.readFileSync(filePath, 'utf8');
    return { ok: true, json: async () => JSON.parse(content) };
};

// Config parameters
const TARGET_CASES = 30000;
const ages = [18, 25, 30, 42, 55, 60, 65];
const genders = ['Male', 'Female'];
const smokers = ['Non Smoker', 'Smoker', 'Non Smoker Preferred'];
const residencies = ['Resident Indian', 'NRI'];
const variants = ['Life Shield', 'Life Shield ROP'];
const modes = ['Annual', 'Half-Yearly', 'Quarterly', 'Monthly'];
const isMedicals = [true, false];
const sums = [5000000, 7500000, 10000000, 15000000, 20000000, 50000000];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDiscounts() {
    return {
        online: Math.random() > 0.5,
        siso: Math.random() > 0.5,
        salaried: Math.random() > 0.8,
        ifa: Math.random() > 0.8,
        prime: Math.random() > 0.9,
        existing: Math.random() > 0.8
    };
}

function getRandomRiders() {
    const hasADB = Math.random() > 0.5;
    const hasCI = Math.random() > 0.5;
    const hasCarePlus = Math.random() > 0.7;

    // Family Care is complex, generate valid states
    const hasFamCare = Math.random() > 0.8;
    const hasSpouse = hasFamCare && Math.random() > 0.3;
    const hasChild = hasFamCare && Math.random() > 0.3;
    const hasParents = hasFamCare && Math.random() > 0.3;

    return {
        adb: { enabled: hasADB, sumAssured: hasADB ? getRandomItem([500000, 1000000, 2000000]) : 0 },
        ci: { enabled: hasCI, sumAssured: hasCI ? getRandomItem([500000, 1000000]) : 0, type: getRandomItem(['Comprehensive', 'Critical', 'Enhanced']) },
        carePlus: { enabled: hasCarePlus, configured: true, plan: getRandomItem(['Prime', 'Pro', 'Ultra', 'Prestige', 'Optima']) },
        famCare: { enabled: hasFamCare, configured: true },
        spouseCare: { enabled: hasSpouse, configured: true, age: getRandomInt(18, 65), sumAssured: getRandomItem([1000000, 2500000]) },
        childCare: hasChild ? [{ age: getRandomInt(1, 15), gender: 'Male', sumAssured: 1000000, pt: 10, ppt: 10 }] : [],
        parentalCare: { enabled: hasParents, configured: true, selection: 'Both Parents', fatherAge: 55, motherAge: 50, sumAssured: 1000000 }
    };
}

async function runFuzzer() {
    console.log(`🚀 Booting 30K Fuzzer & Loading Rules Engine...`);
    await loadRateData();
    console.log(`✅ Engine core loaded.\n`);

    let passed = 0;        // Successfully computed premium without error arrays
    let validRejects = 0;  // Rejected safely via rules (e.g., SA > limits, PT > Max Age)
    let crashes = 0;       // Engine crashed/threw raw exceptions
    let totalTime = 0;

    console.log(`Starting ${TARGET_CASES.toLocaleString()} intense combinatorial testcases...`);
    const startTime = Date.now();

    for (let i = 0; i < TARGET_CASES; i++) {
        const input = {
            age: getRandomItem(ages),
            gender: getRandomItem(genders),
            smoker: getRandomItem(smokers),
            residency: getRandomItem(residencies),
            planVariant: getRandomItem(variants),
            policyTerm: getRandomInt(5, 60),
            ppt: getRandomInt(5, 60),
            sumAssured: getRandomItem(sums),
            mode: getRandomItem(modes),
            isMedical: getRandomItem(isMedicals),
            discounts: getRandomDiscounts(),
            riders: getRandomRiders()
        };

        // Fix PPT <= PT constraint casually to focus on deep logic
        if (input.ppt > input.policyTerm) input.ppt = input.policyTerm;

        try {
            const startNode = performance.now ? performance.now() : Date.now();
            const result = calculatePremium(input);
            const endNode = performance.now ? performance.now() : Date.now();
            totalTime += (endNode - startNode);

            if (result.success && result.totalInstalmentWithGSTYear1 > 0) {
                passed++;
            } else {
                // Calculator cleanly rejected the params natively
                validRejects++; if (validRejects <= 5) console.log(result.errors);
            }
        } catch (e) {
            crashes++;
            if (crashes <= 5) { // Log first few crashes
                console.error(`💥 CRASH #${crashes} at iteration ${i}:`, e.message);
                console.error(`Inputs causing crash:`, input);
            }
        }

        if ((i + 1) % 5000 === 0) {
            console.log(`   Processed ${(i + 1).toLocaleString()} / ${TARGET_CASES.toLocaleString()}... (Crashes: ${crashes})`);
        }
    }

    const elapsed = (Date.now() - startTime) / 1000;

    console.log('\n===============================================');
    console.log(`🎯 30,000 TEST RUN SUMMARY`);
    console.log('===============================================');
    console.log(`Total Cases      : ${TARGET_CASES.toLocaleString()}`);
    console.log(`Engine Successes : ${passed.toLocaleString()}  (Calculated valid premium)`);
    console.log(`Engine Rejections: ${validRejects.toLocaleString()}  (Safely caught an invalid combination)`);
    console.log(`Engine Crashes   : ${crashes.toLocaleString()}  (Raw JS exceptions thrown)`);
    console.log(`Time Elapsed     : ${elapsed.toFixed(2)} seconds`);
    console.log(`Avg Calc Time    : ${(totalTime / TARGET_CASES).toFixed(3)} ms / payload`);
    console.log('===============================================');

    if (crashes > 0) process.exit(1);
}

runFuzzer().catch(console.error);
