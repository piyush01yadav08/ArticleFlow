import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    article: {
      type: String,
      ref: 'Article',
      required: false
    },
    type: {
      type: String,
      enum: ['APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'SUBMITTED', 'PUBLISHED', 'LIKED', 'FOLLOWED'],
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

export default mongoose.model('Notification', notificationSchema)
