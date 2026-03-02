import mongoose, { Document, Schema } from 'mongoose';

export interface IPollMeta extends Document {
    contractPollId: number;
    creatorId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const PollMetaSchema: Schema = new Schema({
    contractPollId: { type: Number, required: true, unique: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPollMeta>('PollMeta', PollMetaSchema);
