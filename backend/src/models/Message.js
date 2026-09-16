import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  versionKey: false
});

messageSchema.index({ sender: 1, receiver: 1, createdAt: 1 });

export default mongoose.model('Message', messageSchema);