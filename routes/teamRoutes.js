import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getAllTeams,
    getTeamMembers,
    getMyTeam,
    assignEmployee,
    removeFromTeam
} from '../controllers/teamController.js';

const router = express.Router();

router.use(protect); // All routes require authentication

// Get all teams
router.get('/', getAllTeams);

// Get specific team members
router.get('/:managerId/members', getTeamMembers);

// Get my team
router.get('/my-team', getMyTeam);

// Assign employee (HR only)
router.post('/assign', assignEmployee);

// Remove from team (HR only)
router.post('/remove', removeFromTeam);

export default router;
