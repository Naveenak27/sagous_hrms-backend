import cron from 'node-cron';
import { creditMonthlyLeaves } from '../controllers/leaveBalanceController.js';

// Run on 1st of every month at 00:01 AM
export const startLeaveBalanceCron = () => {
    cron.schedule('1 0 1 * *', async () => {
        console.log('🔄 Running monthly leave credit job...');
        try {
            const req = {};
            const res = {
                json: (data) => console.log('✅ Leave credit result:', data),
                status: () => ({ json: (data) => console.error('❌ Leave credit error:', data) })
            };
            await creditMonthlyLeaves(req, res);
        } catch (error) {
            console.error('Cron job error:', error);
        }
    });
    console.log('✅ Monthly leave credit cron job started');
};
