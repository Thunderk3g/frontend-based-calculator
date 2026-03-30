import { calculatePremium, loadRateData } from './web/src/calc.js';
import fs from 'fs';

async function run() {
    // Mock the fetch API since we are in node
    global.fetch = async (url) => {
        const path = './web/public/' + url.split('/').pop();
        const data = fs.readFileSync(path, 'utf8');
        return {
            ok: true,
            json: async () => JSON.parse(data)
        };
    };

    // Performance mock
    global.performance = { now: () => Date.now() };

    await loadRateData();
    const r = calculatePremium({
        age: 26, gender: 'Male', smoker: 'Non Smoker', variant: 'Life Shield',
        pt: 59, ppt: 10, sa: 5000000, mode: 'Monthly',
        discounts: { online: true },
        medicalCategory: 'Medical', residence: 'Resident Indian'
    });
    console.log('REPLY_START');
    console.log(JSON.stringify(r, null, 2));
    console.log('REPLY_END');
}

run();
