import express from 'express';
import {
  getAllTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  addTeamToTournament,
  removeTeamFromTournament,
} from '../controllers/tournamentController';
import { authenticate, authorize } from '../middleware/auth-inmemory';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAllTournaments);
router.get('/:id', getTournamentById);
router.post('/', authorize(['admin', 'manager']), createTournament);
router.put('/:id', authorize(['admin', 'manager']), updateTournament);
router.delete('/:id', authorize(['admin', 'manager']), deleteTournament);
router.post('/:id/teams/:teamId', authorize(['admin', 'manager']), addTeamToTournament);
router.delete('/:id/teams/:teamId', authorize(['admin', 'manager']), removeTeamFromTournament);

export default router;
