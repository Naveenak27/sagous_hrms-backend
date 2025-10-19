// routes/announcements.js
import express from 'express';
import { sendBulkAnnouncement } from '../utils/emailService.js';

const router = express.Router();

// Send bulk announcement email
router.post('/send-bulk', async (req, res) => {
    try {
        const { subject, content, recipients, priority } = req.body;

        if (!subject || !content || !recipients || recipients.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Subject, content, and recipients are required'
            });
        }

        const result = await sendBulkAnnouncement({
            subject,
            content,
            recipients,
            priority: priority || 'normal'
        });

        res.json({
            success: true,
            sentCount: result.successCount,
            failedCount: result.failedCount,
            details: result.details
        });
    } catch (error) {
        console.error('Error sending bulk announcement:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send bulk announcement',
            error: error.message
        });
    }
});

// Get announcement history
router.get('/history', async (req, res) => {
    try {
        // Add your database query here to fetch announcement history
        res.json({ success: true, data: [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
