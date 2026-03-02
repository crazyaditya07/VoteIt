import mongoose, { Document, Schema } from 'mongoose';

export interface IPollMeta extends Document {
    pollId: number;
    contractAddress: string;
    txHash: string;
    creatorId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const PollMetaSchema: Schema = new Schema({
    pollId: { type: Number, required: true, unique: true },
    contractAddress: { type: String, required: true },
    txHash: { type: String, required: true, unique: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPollMeta>('PollMeta', PollMetaSchema);
