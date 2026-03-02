import express from 'express';
import { registerUser, loginUser, linkWallet } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/wallet', protect, linkWallet);

export default router;
