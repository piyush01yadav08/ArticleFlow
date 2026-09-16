import User from '../models/User.js';
import Message from '../models/Message.js';
import Follow from '../models/Follow.js';
import MessageRequest from '../models/MessageRequest.js';

export async function getUsers(req, res) {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender',
            ],
          },
          lastMessageAt: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', req.user._id] },
                    { $eq: ['$readAt', null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    const acceptedRequests = await MessageRequest.find({
      status: 'accepted',
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id },
      ],
    }).select('sender receiver updatedAt');

    const contactMeta = new Map(
      conversations.map((conversation) => [String(conversation._id), conversation])
    );
    for (const request of acceptedRequests) {
      const contactId = String(request.sender) === String(req.user._id)
        ? request.receiver
        : request.sender;
      if (!contactMeta.has(String(contactId))) {
        contactMeta.set(String(contactId), {
          _id: contactId,
          unreadCount: 0,
          lastMessageAt: request.updatedAt,
        });
      }
    }

    const contacts = await User.find(
      { _id: { $in: [...contactMeta.values()].map((contact) => contact._id) } },
      { name: 1, username: 1, profilePhoto: 1, email: 1, role: 1 }
    );
    const contactById = new Map(contacts.map((contact) => [String(contact._id), contact]));

    return res.json(
      [...contactMeta.values()]
        .sort((first, second) => new Date(second.lastMessageAt) - new Date(first.lastMessageAt))
        .map((conversation) => {
          const contact = contactById.get(String(conversation._id));
          return contact && {
            ...contact.toJSON(),
            unreadCount: conversation.unreadCount,
            lastMessageAt: conversation.lastMessageAt,
          };
        })
        .filter(Boolean)
    );
  } catch {
    return res.status(500).json({ message: 'Unable to load users.' });
  }
}

export async function getMessageRequests(req, res) {
  try {
    const requests = await MessageRequest.find({
      receiver: req.user._id,
      status: 'pending',
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name username profilePhoto email role');

    return res.json(requests.map((request) => ({
      id: String(request._id),
      createdAt: request.createdAt,
      sender: request.sender,
    })));
  } catch {
    return res.status(500).json({ message: 'Unable to load message requests.' });
  }
}

export async function createMessageRequest(req, res) {
  try {
    const receiverId = req.params.userId;

    if (String(req.user._id) === String(receiverId)) {
      return res.status(400).json({ message: 'You cannot send a request to yourself.' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ message: 'User not found.' });

    const followsReceiver = await Follow.exists({
      follower: req.user._id,
      following: receiverId,
    });
    if (followsReceiver) {
      return res.status(400).json({ message: 'You already follow this user and can message them directly.' });
    }

    const existing = await MessageRequest.findOne({
      sender: req.user._id,
      receiver: receiverId,
    });
    if (existing?.status === 'accepted') {
      return res.json({ status: 'accepted', message: 'This conversation is already approved.' });
    }
    if (existing?.status === 'pending') {
      return res.json({ status: 'pending', message: 'Your message request is already waiting for approval.' });
    }

    if (existing) {
      existing.status = 'pending';
      await existing.save();
    } else {
      await MessageRequest.create({ sender: req.user._id, receiver: receiverId });
    }

    return res.status(201).json({ status: 'pending', message: 'Message request sent.' });
  } catch {
    return res.status(500).json({ message: 'Unable to send message request.' });
  }
}

export async function respondToMessageRequest(req, res) {
  try {
    const request = await MessageRequest.findOne({
      _id: req.params.requestId,
      receiver: req.user._id,
      status: 'pending',
    });
    if (!request) return res.status(404).json({ message: 'Message request not found.' });

    request.status = req.body.accept ? 'accepted' : 'rejected';
    await request.save();
    return res.json({ status: request.status });
  } catch {
    return res.status(500).json({ message: 'Unable to update message request.' });
  }
}

export async function getConversation(req, res) {
  try {
    const userId = req.params.userId;

    const otherUser = await User.findById(userId, {
      name: 1,
      email: 1,
      role: 1,
      username: 1,
      profilePhoto: 1
    });

    if (!otherUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name username profilePhoto email')
      .populate('receiver', 'name username profilePhoto email');

    await Message.updateMany(
      {
        sender: userId,
        receiver: req.user._id,
        readAt: null
      },
      {
        $set: { readAt: new Date() }
      }
    );

    return res.json({
      user: otherUser,
      messages
    });
  } catch {
    return res.status(500).json({ message: 'Unable to load conversation.' });
  }
}

export async function sendMessage(req, res) {
  try {
    const receiverId = req.params.userId;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty.' });
    }

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (req.user._id.toString() === receiverId) {
      return res.status(400).json({ message: 'You cannot message yourself.' });
    }

    const [followsReceiver, approvedRequest, existingConversation] = await Promise.all([
      Follow.exists({ follower: req.user._id, following: receiverId }),
      MessageRequest.exists({
        status: 'accepted',
        $or: [
          { sender: req.user._id, receiver: receiverId },
          { sender: receiverId, receiver: req.user._id },
        ],
      }),
      Message.exists({
        $or: [
          { sender: req.user._id, receiver: receiverId },
          { sender: receiverId, receiver: req.user._id },
        ],
      }),
    ]);

    if (!followsReceiver && !approvedRequest && !existingConversation) {
      return res.status(403).json({ message: 'Follow this user first or wait for them to accept your message request.' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text: text.trim()
    });

    await message.populate('sender', 'name username profilePhoto email');
    await message.populate('receiver', 'name username profilePhoto email');

    return res.status(201).json(message);
  } catch {
    return res.status(500).json({ message: 'Unable to send message.' });
  }
}
