import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import PollMeta from '../models/PollMeta';
import User from '../models/User';
import { verifyPollCreationTx } from '../utils/ethereumRPC';

export const createPollMeta = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { txHash, contractAddress } = req.body;

        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        if (!txHash || !contractAddress) {
            res.status(400).json({ message: 'Missing RPC verification parameters' });
            return;
        }

        // Prevent duplicate transaction processing
        const existingMeta = await PollMeta.findOne({ txHash });
        if (existingMeta) {
            res.status(400).json({ message: 'Transaction already verified and synced' });
            return;
        }

        const user = await User.findById(req.user.id);
        if (!user || !user.walletAddress) {
            res.status(400).json({ message: 'Creator wallet address not registered on profile' });
            return;
        }

        const verification = await verifyPollCreationTx(txHash, contractAddress, user.walletAddress);

        if (!verification) {
            res.status(400).json({ message: 'RPC verification failed: could not verify transaction ownership.' });
            return;
        }

        const { pollId } = verification;

        const duplicatedPollId = await PollMeta.findOne({ pollId, contractAddress });
        if (duplicatedPollId) {
            res.status(400).json({ message: 'Poll ID already registered.' });
            return;
        }

        const pollMeta = await PollMeta.create({
            pollId,
            contractAddress,
            txHash,
            creatorId: req.user.id
        });

        res.status(201).json(pollMeta);
    } catch (error) {
        console.error('[Poll Sync] Server error during poll synchronisation:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
