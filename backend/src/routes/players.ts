import express from 'express';
import {
  getAllPlayers,
  getPlayerById,
  getPlayersByTeam,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from '../controllers/playerController-database';
import { authenticate, authorize } from '../middleware/auth-inmemory';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAllPlayers);
router.get('/:id', getPlayerById);
router.get('/team/:teamId', getPlayersByTeam);
router.post('/', authorize(['admin', 'manager']), createPlayer);
router.put('/:id', authorize(['admin', 'manager']), updatePlayer);
router.delete('/:id', authorize(['admin', 'manager']), deletePlayer);

export default router;
