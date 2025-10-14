import express from 'express';
import {
    getAllRoles,
    getRolePermissions,
    createRole,
    updateRolePermissions,
    getModulesAndPermissions
} from '../controllers/roleController.js';
import { protect } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';

const router = express.Router();

router.get('/', protect, getAllRoles);
router.get('/modules-permissions', protect, getModulesAndPermissions);
router.get('/:id/permissions', protect, getRolePermissions);
router.post('/', protect, checkPermission('roles', 'create'), createRole);
router.put('/:id/permissions', protect, checkPermission('roles', 'edit'), updateRolePermissions);

export default router;
