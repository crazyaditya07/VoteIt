"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPollMeta = void 0;
const PollMeta_1 = __importDefault(require("../models/PollMeta"));
const createPollMeta = async (req, res) => {
    try {
        const { contractPollId } = req.body;
        // User attached from `protect` middleware
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const pollMetaExists = await PollMeta_1.default.findOne({ contractPollId });
        if (pollMetaExists) {
            res.status(400).json({ message: 'Poll tracking already exists' });
            return;
        }
        const pollMeta = await PollMeta_1.default.create({
            contractPollId,
            creatorId: req.user.id
        });
        res.status(201).json(pollMeta);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createPollMeta = createPollMeta;
