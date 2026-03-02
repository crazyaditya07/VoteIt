import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import PollMeta from '../models/PollMeta';

export const createPollMeta = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { contractPollId } = req.body;

        // User attached from `protect` middleware
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const pollMetaExists = await PollMeta.findOne({ contractPollId });
        if (pollMetaExists) {
            res.status(400).json({ message: 'Poll tracking already exists' });
            return;
        }

        const pollMeta = await PollMeta.create({
            contractPollId,
            creatorId: req.user.id
        });

        res.status(201).json(pollMeta);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
