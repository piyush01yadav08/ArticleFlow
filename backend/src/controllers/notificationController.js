import Notification from '../models/Notification.js';

export async function getNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id
    })
      .populate('article', 'title')
      .sort({ createdAt: -1 });

    // Keep recipient in the response so clients can defensively confirm that
    // a response belongs to the currently signed-in account.
    return res.set('Cache-Control', 'no-store, private').json(
      notifications.map((notification) => ({
        ...notification.toJSON(),
        recipient: String(notification.recipient),
      }))
    );
  } catch (error) {
    next(error);
  }
}

export async function markNotificationAsRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user._id
      },
      {
        $set: { isRead: true }
      },
      {
        new: true
      }
    );

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found.'
      });
    }

    return res.json({
      message: 'Notification marked as read.',
      notification
    });
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsAsRead(req, res, next) {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );

    return res.json({
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
}
