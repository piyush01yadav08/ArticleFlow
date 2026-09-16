import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    articleId: {
      type: String,
      required: true,
      ref: 'Article',
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1000,
    },

    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },

    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

commentSchema.index({ articleId: 1, createdAt: -1 });

export default mongoose.model('Comment', commentSchema);