import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { articleService } from '../services/articleService'
import { quizService } from '../services/quizService'
import { userService } from '../services/userService'
import { useAuth } from '../context/AuthContext'
import { QuizPlayer } from '../modules/quiz'
import Loading from '../components/common/Loading'
import AdminQuizEditor from '../components/quiz/AdminQuizEditor'
import { CommentSection } from '../modules/comments'

export default function ArticleDetail() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()

  const [article, setArticle] = useState(null)
  const [hasQuiz, setHasQuiz] = useState(false)
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [savingArticle, setSavingArticle] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [commentsCount, setCommentsCount] = useState(0)
  const [likeLoading, setLikeLoading] = useState(false)
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const rolePrefix = location.pathname.startsWith('/admin')
    ? 'admin'
    : location.pathname.startsWith('/author')
      ? 'author'
      : 'reader'

  useEffect(() => {
    let active = true
    setLoading(true)

    Promise.all([
      articleService.getArticleById(id),
      quizService.getQuizByArticleId(id),
    ])
      .then(([articleData, quizData]) => {
        if (!active) return

        setArticle(articleData)
        setSaved(Boolean(articleData.isSaved))
        setLiked(Boolean(articleData.isLiked))
        setLikesCount(articleData.likesCount || 0)
        setCommentsCount(articleData.commentsCount || 0)
        setHasQuiz(!!quizData)
        setQuiz(quizData)
        setLoading(false)

        if (
          rolePrefix === 'reader' &&
          articleData.authorId &&
          user?.id !== articleData.authorId
        ) {
          userService
            .getFollowStatus(articleData.authorId)
            .then((result) => {
              if (active) setFollowing(Boolean(result.following))
            })
            .catch(() => {})
        }
      })
      .catch((err) => {
        console.error(err)

        if (active) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [id])

  if (loading) return <Loading />

  if (!article) {
    return (
      <div className="centered-page">
        <h1>Article Not Found</h1>
        <p>
          {error ||
            'The article you are looking for does not exist or has been removed.'}
        </p>
        <Link to={`/${rolePrefix}/browse`} className="button">
          Back to Browse
        </Link>
      </div>
    )
  }

  const {
    title,
    excerpt,
    body,
    category,
    author,
    readMinutes,
    views,
    coverImage,
    publishedAt,
  } = article

  const canManage =
    rolePrefix === 'author' && article.status !== 'Pending'

  async function deleteArticle() {
    if (
      !window.confirm(
        'Delete this article and its quiz? This cannot be undone.'
      )
    ) {
      return
    }

    try {
      await articleService.deleteArticle(id)
      navigate('/author/browse', { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  async function toggleSave() {
    try {
      setSavingArticle(true)

      const result = await articleService.toggleSavedArticle(id)

      setSaved(result.saved)
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingArticle(false)
    }
  }

  async function toggleLike() {
    try {
      setLikeLoading(true)

      const result = await articleService.toggleLike(id)

      setLiked(result.liked)
      setLikesCount(result.likesCount)
    } catch (err) {
      setError(err.message)
    } finally {
      setLikeLoading(false)
    }
  }

  async function toggleFollow() {
    try {
      setFollowLoading(true)

      const result = await userService.toggleFollow(article.authorId)

      setFollowing(result.following)
      updateUser({ ...user, followingCount: result.currentFollowingCount })
    } catch (err) {
      setError(err.message)
    } finally {
      setFollowLoading(false)
    }
  }

  return (
    <article className="article-detail-container">
      <div className="article-detail-back">
        <Link
          to={`/${rolePrefix}/browse`}
          className="back-link"
        >
          &larr; Back to Browse
        </Link>
      </div>

      <header className="article-detail-header">
        <span className="eyebrow category-tag">{category}</span>

        <h1 className="article-detail-title">{title}</h1>

        <p className="article-detail-excerpt">{excerpt}</p>

        <div className="article-detail-meta">
          {article.authorId ? <Link className="meta-author article-author-link" to={`/profile/${article.authorId}`}>By {author}</Link> : <span className="meta-author">By {author}</span>}
          <span className="meta-dot">&middot;</span>

          <span className="meta-date">
            {publishedAt || 'Unpublished'}
          </span>

          <span className="meta-dot">&middot;</span>

          <span className="meta-read-time">
            {readMinutes} min read
          </span>

          <span className="meta-dot">&middot;</span>

          <span className="meta-views">
            👁 {views} views
          </span>
        </div>

        {article.status === 'Published' && user && (
          <div className="article-engagement-actions">
            {rolePrefix === 'reader' && <button
              className={`article-save-button ${saved ? 'saved' : ''}`}
              type="button"
              disabled={savingArticle}
              onClick={toggleSave}
            >
              {saved
                ? '★ Saved to your profile'
                : '☆ Save article'}
            </button>}

            <button
              className={`article-like-button ${liked ? 'liked' : ''}`}
              type="button"
              disabled={likeLoading}
              onClick={toggleLike}
            >
              {liked ? '♥' : '♡'} {likesCount}{' '}
              {likesCount === 1 ? 'like' : 'likes'}
            </button>

            {rolePrefix === 'reader' && article.authorId &&
              user?.id !== article.authorId && (
                <button
                  className={`article-follow-button ${
                    following ? 'following' : ''
                  }`}
                  type="button"
                  disabled={followLoading}
                  onClick={toggleFollow}
                >
                  {following
                    ? 'Following'
                    : `Follow ${author}`}
                </button>
              )}
            <span className="article-comment-count">◌ {commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}</span>
          </div>
        )}

        {rolePrefix === 'author' && (
          <div className="author-article-actions">
            {canManage ? (
              <>
                <Link
                  className="editor-secondary-button"
                  to={`/author/edit/${id}`}
                >
                  Edit article
                </Link>

                <button
                  className="article-delete-button"
                  type="button"
                  onClick={deleteArticle}
                >
                  Delete article
                </button>
              </>
            ) : (
              <p className="quiz-attached-note">
                This article is under review and cannot be changed right now.
              </p>
            )}
          </div>
        )}
      </header>

      {coverImage && (
        <div className="article-detail-cover-wrapper">
          <img
            src={coverImage}
            alt={title}
            className="article-detail-cover"
          />
        </div>
      )}

      <section className="article-detail-body">
        {body
          .split('\n\n')
          .map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
      </section>

      <CommentSection articleId={id} onCommentAdded={() => setCommentsCount(current => current + 1)} />

      {hasQuiz && rolePrefix === 'reader' && (
        <section className="article-detail-quiz-section">
          <div className="quiz-section-divider"></div>
          <QuizPlayer articleId={id} />
        </section>
      )}

      {hasQuiz && rolePrefix === 'author' && (
        <section className="article-detail-quiz-section">
          <p className="quiz-attached-note">
            This article has an attached quiz with reader scoring enabled
            after publication.
          </p>
        </section>
      )}

      {rolePrefix === 'admin' && (
        <section className="article-detail-quiz-section">
          <AdminQuizEditor
            articleId={id}
            quiz={quiz}
            onSaved={(updatedQuiz) => {
              setQuiz(updatedQuiz)
              setHasQuiz(true)
            }}
          />
        </section>
      )}
    </article>
  )
}
