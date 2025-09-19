import express from 'express';
import { register, login, getProfile } from '../controllers/authController-inmemory';
import { authenticate } from '../middleware/auth-inmemory';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticate, getProfile);

export default router;
