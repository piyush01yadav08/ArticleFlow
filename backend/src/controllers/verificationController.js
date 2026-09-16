import Article from '../models/Article.js'
import Notification from '../models/Notification.js'

export async function getPendingSubmissions(req, res, next) {
  try {
    const articles = await Article.find({ status: 'Pending' }).sort({ createdAt: -1 })
    return res.json(articles)
  } catch (error) {
    next(error)
  }
}

export async function approveSubmission(req, res, next) {
  try {
    const article = await Article.findById(req.params.id)

    if (!article) {
      return res.status(404).json({ message: 'Article not found.' })
    }

    if (article.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending articles can be approved.' })
    }

    article.status = 'Published'
    article.publishedAt = new Date()
    article.reviewedBy = req.user._id
    article.reviewedAt = new Date()
    await article.save()

    await Notification.create({
      recipient: article.author,
      article: article._id,
      type: 'APPROVED',
      message: `Your article "${article.title}" has been approved.`
    })
    return res.json({
      message: 'Article approved successfully.',
      article
    })
  } catch (error) {
    next(error)
  }
}

export async function rejectSubmission(req, res, next) {
  try {
    const { adminNote } = req.body

    if (!adminNote?.trim()) {
      return res.status(400).json({ message: 'Rejection reason is required.' })
    }

    const article = await Article.findById(req.params.id)

    if (!article) {
      return res.status(404).json({ message: 'Article not found.' })
    }

    if (article.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending articles can be rejected.' })
    }

    const note = adminNote.trim()

    article.status = 'Rejected'
    article.reviewedBy = req.user._id
    article.reviewedAt = new Date()
    await article.save()

    await Notification.create({
      recipient: article.author,
      article: article._id,
      type: 'REJECTED',
      message: `Your article "${article.title}" was rejected. Reason: ${note}`
    })

    return res.json({
      message: 'Article rejected successfully.',
      article
    })
  } catch (error) {
    next(error)
  }
}

export async function requestChanges(req, res, next) {
  try {
    const { adminNote } = req.body

    if (!adminNote?.trim()) {
      return res.status(400).json({ message: 'Change request message is required.' })
    }

    const article = await Article.findById(req.params.id)

    if (!article) {
      return res.status(404).json({ message: 'Article not found.' })
    }

    if (article.status !== 'Pending') {
      return res.status(400).json({
        message: 'Only pending articles can have changes requested.'
      })
    }

    const note = adminNote.trim()

    article.status = 'Changes Requested'
    await article.save()

    await Notification.create({
      recipient: article.author,
      article: article._id,
      type: 'CHANGES_REQUESTED',
      message: `Changes have been requested for your article "${article.title}". Details: ${note}`
    })

    return res.json({
      message: 'Changes requested successfully.',
      article
    })
  } catch (error) {
    next(error)
  }
}
