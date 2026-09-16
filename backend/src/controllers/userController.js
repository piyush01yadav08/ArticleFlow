import User from '../models/User.js';
import Article from '../models/Article.js';
import Follow from '../models/Follow.js';
import Notification from '../models/Notification.js';

export const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select(
      'name username bio profilePhoto followersCount followingCount role'
    );

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    const articles = await Article.find({
      author: user._id,
      status: 'Published',
    })
      .select(
        '_id title excerpt category tags authorName coverImage readMinutes views likesCount publishedAt createdAt'
      )
      .sort({ publishedAt: -1, createdAt: -1 });

    const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({ following: user._id }),
      Follow.countDocuments({ follower: user._id }),
    ]);

    res.json({
      user: {
        id: String(user._id),
        name: user.name,
        username: user.username || '',
        bio: user.bio || '',
        profilePhoto: user.profilePhoto || '',
        followersCount,
        followingCount,
        role: user.role,
      },
      articles: articles.map((article) => ({
        id: String(article._id),
        title: article.title,
        excerpt: article.excerpt || '',
        category: article.category,
        tags: article.tags || [],
        authorName: article.authorName || user.name,
        coverImage: article.coverImage || '',
        readMinutes: article.readMinutes || 0,
        views: article.views || 0,
        likesCount: article.likesCount || 0,
        publishedAt: article.publishedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export async function toggleFollow(req, res, next) {
  try {
    const targetId = req.params.id;

    if (String(targetId) === String(req.user._id)) {
      return res.status(400).json({
        message: 'You cannot follow yourself.',
      });
    }

    const target = await User.findById(targetId);

    if (!target) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    const existing = await Follow.findOne({
      follower: req.user._id,
      following: targetId,
    });

    if (existing) {
      await Follow.deleteOne({ _id: existing._id });

      await User.updateOne(
        { _id: targetId },
        { $inc: { followersCount: -1 } }
      );

      await User.updateOne(
        { _id: req.user._id },
        { $inc: { followingCount: -1 } }
      );

      const [targetFollowersCount, currentFollowingCount] = await Promise.all([
        Follow.countDocuments({ following: targetId }),
        Follow.countDocuments({ follower: req.user._id }),
      ]);
      return res.json({ following: false, targetFollowersCount, currentFollowingCount });
    }

    await Follow.create({
      follower: req.user._id,
      following: targetId,
    });

    await User.updateOne(
      { _id: targetId },
      { $inc: { followersCount: 1 } }
    );

    await User.updateOne(
      { _id: req.user._id },
      { $inc: { followingCount: 1 } }
    );

    await Notification.create({
      recipient: targetId,
      type: 'FOLLOWED',
      message: `${req.user.name} started following you.`,
    });

    const [targetFollowersCount, currentFollowingCount] = await Promise.all([
      Follow.countDocuments({ following: targetId }),
      Follow.countDocuments({ follower: req.user._id }),
    ]);
    return res.json({ following: true, targetFollowersCount, currentFollowingCount });
  } catch (error) {
    next(error);
  }
}

export async function getFollowStatus(req, res, next) {
  try {
    const existing = await Follow.findOne({
      follower: req.user._id,
      following: req.params.id,
    });

    return res.json({
      following: !!existing,
    });
  } catch (error) {
    next(error);
  }
}
