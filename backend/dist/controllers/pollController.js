"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPollMeta = void 0;
const PollMeta_1 = __importDefault(require("../models/PollMeta"));
const User_1 = __importDefault(require("../models/User"));
const ethereumRPC_1 = require("../utils/ethereumRPC");
const createPollMeta = async (req, res) => {
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
        // Prevent duplicate processing
        const existingMeta = await PollMeta_1.default.findOne({ txHash });
        if (existingMeta) {
            res.status(400).json({ message: 'Transaction already verified and synced' });
            return;
        }
        const user = await User_1.default.findById(req.user.id);
        if (!user || !user.walletAddress) {
            res.status(400).json({ message: 'Creator wallet address not registered on profile' });
            return;
        }
        // --- ENFORCE TRUST BOUNDARY OVER RPC ---
        const verification = await (0, ethereumRPC_1.verifyPollCreationTx)(txHash, contractAddress, user.walletAddress);
        if (!verification) {
            console.error(`[Poll Sync] RPC verification failed securely masking tx: ${txHash}`);
            res.status(400).json({ message: 'RPC Validation Failed: Could not securely verify block ownership mapping.' });
            return;
        }
        // RPC extracted the poll id decoupled natively from params
        const { pollId } = verification;
        // Double check pollId collision natively too
        const duplicatedPollId = await PollMeta_1.default.findOne({ pollId, contractAddress });
        if (duplicatedPollId) {
            res.status(400).json({ message: 'Poll ID collision securely tracked.' });
            return;
        }
        const pollMeta = await PollMeta_1.default.create({
            pollId,
            contractAddress,
            txHash,
            creatorId: req.user.id
        });
        res.status(201).json(pollMeta);
    }
    catch (error) {
        console.error('[Poll Sync] Native server failure mapped correctly inside wrapper.', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createPollMeta = createPollMeta;
