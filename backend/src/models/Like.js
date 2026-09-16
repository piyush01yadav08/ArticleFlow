import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  article: { type: String, ref: 'Article', required: true },
}, { timestamps: true, versionKey: false });

likeSchema.index({ user: 1, article: 1 }, { unique: true });

export default mongoose.model('Like', likeSchema);