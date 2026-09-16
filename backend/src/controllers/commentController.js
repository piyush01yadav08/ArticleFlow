import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Article from '../models/Article.js';

// Get all comments for an article
export async function getCommentsByArticle(req, res) {
  try {
    const { articleId } = req.params;

    const comments = await Comment.find({ articleId })
      .populate('userId', 'name username profilePhoto')
      .sort({ createdAt: 1 });

    return res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({
      message: 'Failed to load comments.',
    });
  }
}

// Create a new comment
export async function createComment(req, res) {
  try {
    const { articleId, content } = req.body;

    if (!articleId || !content?.trim()) {
      return res.status(400).json({
        message: 'Article ID and comment content are required.',
      });
    }

    // Existing Article documents use MongoDB ObjectId values.
    // Check both ObjectId and String IDs so the comment module
    // works with the existing database without changing Article.js.
    let article = null;

    if (mongoose.Types.ObjectId.isValid(articleId)) {
      article = await Article.collection.findOne({
        _id: new mongoose.Types.ObjectId(articleId),
      });
    }

    if (!article) {
      article = await Article.collection.findOne({
        _id: articleId,
      });
    }

    if (!article) {
      return res.status(404).json({
        message: 'Article not found.',
      });
    }

    const comment = await Comment.create({
      articleId: String(articleId),
      userId: req.user._id,
      content: content.trim(),
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'name username profilePhoto');

    return res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({
      message: 'Failed to create comment.',
    });
  }
}

// Reply to a comment
export async function replyToComment(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        message: 'Reply content is required.',
      });
    }

    const parentComment = await Comment.findById(id);

    if (!parentComment) {
      return res.status(404).json({
        message: 'Comment not found.',
      });
    }

    const reply = await Comment.create({
      articleId: parentComment.articleId,
      userId: req.user._id,
      content: content.trim(),
      parentCommentId: parentComment._id,
    });

    const populatedReply = await Comment.findById(reply._id)
      .populate('userId', 'name username profilePhoto');

    return res.status(201).json(populatedReply);
  } catch (error) {
    console.error('Reply comment error:', error);
    return res.status(500).json({
      message: 'Failed to create reply.',
    });
  }
}

// Like or unlike a comment
export async function toggleCommentLike(req, res) {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        message: 'Comment not found.',
      });
    }

    const userId = req.user._id.toString();

    const alreadyLiked = comment.likes.some(
      (likeId) => likeId.toString() === userId
    );

    if (alreadyLiked) {
      comment.likes = comment.likes.filter(
        (likeId) => likeId.toString() !== userId
      );
    } else {
      comment.likes.push(req.user._id);
    }

    await comment.save();

    return res.json({
      liked: !alreadyLiked,
      likesCount: comment.likes.length,
    });
  } catch (error) {
    console.error('Toggle comment like error:', error);
    return res.status(500).json({
      message: 'Failed to update comment like.',
    });
  }
}