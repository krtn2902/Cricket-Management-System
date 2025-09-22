import express from 'express';
import {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addPlayerToTeam,
  removePlayerFromTeam,
} from '../controllers/teamController-database';
import { authenticate, authorize } from '../middleware/auth-inmemory';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAllTeams);
router.get('/:id', getTeamById);
router.post('/', authorize(['admin', 'manager']), createTeam);
router.put('/:id', authorize(['admin', 'manager']), updateTeam);
router.delete('/:id', authorize(['admin', 'manager']), deleteTeam);
router.post('/:teamId/players/:playerId', authorize(['admin', 'manager']), addPlayerToTeam);
router.delete('/:teamId/players/:playerId', authorize(['admin', 'manager']), removePlayerFromTeam);

export default router;
