import express from 'express';
import {
    getAllHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday
} from '../controllers/holidayController.js';
import { protect } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';

const router = express.Router();

router.get('/', protect, getAllHolidays);
router.post('/', protect, checkPermission('holidays', 'create'), createHoliday);
router.put('/:id', protect, checkPermission('holidays', 'edit'), updateHoliday);
router.delete('/:id', protect, checkPermission('holidays', 'delete'), deleteHoliday);

export default router;
