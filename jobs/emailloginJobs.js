// import cron from 'node-cron';
// import moment from 'moment';
// import { sendIndividualReports } from '../controllers/mailattendanceController.js';

// const executeIndividualReports = async () => {
//     console.log(`\n${'='.repeat(60)}`);
//     console.log(`[${moment().format('DD-MM-YYYY HH:mm:ss')}] 🚀 Sending individual reports to all employees...`);
//     console.log(`${'='.repeat(60)}\n`);
    
//     try {
//         // Send individual reports for 2 days ago
//         await sendIndividualReports({ user: null }, null, 2);
        
//         console.log(`\n${'='.repeat(60)}`);
//         console.log(`[${moment().format('DD-MM-YYYY HH:mm:ss')}] ✅ All individual reports sent successfully`);
//         console.log(`${'='.repeat(60)}\n`);
//     } catch (error) {
//         console.error(`\n${'='.repeat(60)}`);
//         console.error(`[${moment().format('DD-MM-YYYY HH:mm:ss')}] ❌ Failed:`, error.message);
//         console.error(`${'='.repeat(60)}\n`);
//     }
// };

// export const initializeScheduledJobs = () => {
//     // Send individual reports at 6:00 PM IST every day
//     cron.schedule('14 20 * * *', executeIndividualReports, {
//         timezone: "Asia/Kolkata"
//     });

//     console.log('\n📧 Scheduled Jobs Initialized:');
//     console.log('   ✓ Individual Reports: Every day at 6:00 PM IST');
//     console.log('   ✓ Report shows: Data from 2 days before');
//     console.log('   ✓ Sent to: Each employee individually');
//     console.log('   ✓ Timezone: Asia/Kolkata (IST)\n');
// };


import cron from 'node-cron';
import moment from 'moment';
import { sendIndividualReports } from '../controllers/mailattendanceController.js';

const getPreviousWorkingDay = () => {
    let daysAgo = 1;
    let previousDay = moment().subtract(daysAgo, 'days');
    
    // If today is Monday (1), get Friday's report (3 days ago)
    if (moment().isoWeekday() === 1) {
        daysAgo = 3;
    }
    // If today is Sunday (7), get Friday's report (2 days ago)
    else if (moment().isoWeekday() === 7) {
        daysAgo = 2;
    }
    // For any other day, just get yesterday
    else {
        daysAgo = 1;
    }
    
    return daysAgo;
};

const executeIndividualReports = async () => {
    const daysAgo = getPreviousWorkingDay();
    const reportDate = moment().subtract(daysAgo, 'days').format('DD-MM-YYYY');
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[${moment().format('DD-MM-YYYY HH:mm:ss')}] 🚀 Sending individual reports...`);
    console.log(`📅 Report Date: ${reportDate} (${daysAgo} day(s) ago)`);
    console.log(`${'='.repeat(60)}\n`);
    
    try {
        await sendIndividualReports({ user: null }, null, daysAgo);
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`[${moment().format('DD-MM-YYYY HH:mm:ss')}] ✅ All individual reports sent successfully`);
        console.log(`${'='.repeat(60)}\n`);
    } catch (error) {
        console.error(`\n${'='.repeat(60)}`);
        console.error(`[${moment().format('DD-MM-YYYY HH:mm:ss')}] ❌ Failed:`, error.message);
        console.error(`${'='.repeat(60)}\n`);
    }
};

export const initializeScheduledJobs = () => {
    // Send individual reports at 6:00 PM IST every day (Monday to Friday only)
    cron.schedule(' 05 13 * * 1-5', executeIndividualReports, {
        timezone: "Asia/Kolkata"
    });

    console.log('\n📧 Scheduled Jobs Initialized:');
    console.log('   ✓ Individual Reports: Monday-Friday at 6:00 PM IST');
    console.log('   ✓ Report Logic:');
    console.log('      - Monday: Shows Friday report');
    console.log('      - Tuesday-Friday: Shows previous day report');
    console.log('   ✓ Sent to: Each employee individually');
    console.log('   ✓ Timezone: Asia/Kolkata (IST)\n');
};
