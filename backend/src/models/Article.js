import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // custom article slug/id
  title: { type: String, required: true, trim: true },
  excerpt: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  category: { type: String, required: true, trim: true },
  tags: { type: [String], default: [] },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true, trim: true },
  status: { 
    type: String, 
    enum: ['Draft', 'Pending', 'Approved', 'Published', 'Rejected', 'Changes Requested'], 
    default: 'Draft' 
  },
  coverImage: { type: String },
  readMinutes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0, min: 0 },
  publishedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date }
}, { 
  timestamps: true, 
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Map virtual id to string _id
articleSchema.virtual('id').get(function() {
  return this._id;
});

// Text index for full-text search
articleSchema.index({ title: 'text', excerpt: 'text' });

export default mongoose.model('Article', articleSchema);
