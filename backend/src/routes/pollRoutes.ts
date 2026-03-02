import express from 'express';
import { createPollMeta } from '../controllers/pollController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/', protect, createPollMeta);

export default router;
