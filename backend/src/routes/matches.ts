import express from 'express';
import {
  getAllMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
  updateMatchScore,
} from '../controllers/matchController';
import { authenticate, authorize } from '../middleware/auth-inmemory';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAllMatches);
router.get('/:id', getMatchById);
router.post('/', authorize(['admin', 'manager']), createMatch);
router.put('/:id', authorize(['admin', 'manager']), updateMatch);
router.patch('/:id/score', authorize(['admin', 'manager']), updateMatchScore);
router.delete('/:id', authorize(['admin', 'manager']), deleteMatch);

export default router;
