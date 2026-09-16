import { Link } from 'react-router-dom';

const dummyComments = [
  {
    id: 'comment-1',
    userId: 'user-001',
    name: 'Alex Chen',
    username: 'alex.chen',
    text: 'This article was really interesting and informative.',
  },
  {
    id: 'comment-2',
    userId: 'user-002',
    name: 'Priya Mehta',
    username: 'priya.mehta',
    text: 'I really enjoyed reading this. Great explanation!',
  },
  {
    id: 'comment-3',
    userId: 'user-003',
    name: 'Rahul Sharma',
    username: 'rahul.sharma',
    text: 'The examples made the topic much easier to understand.',
  },
];

export default function CommentSection({ comments = dummyComments }) {
  return (
    <section className="comment-section">

      <div className="comment-section-heading">
        <h2>Comments</h2>
        <span>{comments.length}</span>
      </div>

      <div className="comment-list">

        {comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          comments.map((comment) => {

            const userId =
              comment.userId ||
              comment.user?._id ||
              comment.user?.id;

            const name =
              comment.name ||
              comment.user?.name ||
              'User';

            const username =
              comment.username ||
              comment.user?.username ||
              '';

            return (
              <article
                className="comment-card"
                key={comment.id || comment._id}
              >

                <div className="comment-avatar">
                  {name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div className="comment-content">

                  {userId ? (
                    <Link
                      to={`/profile/${userId}`}
                      className="comment-user-link"
                    >
                      <strong>{name}</strong>
                    </Link>
                  ) : (
                    <strong>{name}</strong>
                  )}

                  {username && (
                    <span className="comment-username">
                      @{username}
                    </span>
                  )}

                  <p>
                    {comment.text || comment.content}
                  </p>

                </div>

              </article>
            );
          })
        )}

      </div>
    </section>
  );
}