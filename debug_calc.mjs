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
    const inputs = {
        age: 26,
        gender: 'Male',
        smoker: 'Non Smoker',
        variant: 'Life Shield',
        pt: 59,
        ppt: 10,
        sa: 9000000,
        mode: 'Annual',
        medicalCategory: 'Medical',
        residence: 'Resident Indian',
        sisoEnabled: false,
        adbSA: 0,
        ciEnabled: false,
        carePlusEnabled: false,
        gstYear1Rate: 0.045,
        gstYear2Rate: 0.0225
    };
    const r = calculatePremium(inputs);
    console.log('REPLY_START');
    console.log(JSON.stringify(r, null, 2));
    console.log('REPLY_END');
}

run();
