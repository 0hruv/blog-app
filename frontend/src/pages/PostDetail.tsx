import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Post {
  id: number;
  title: string;
  content: string;
  author_id: number;
  author_name: string;
  created_at: string;
}

const PostDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3001/api/posts/${id}`)
      .then(res => res.json())
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`http://localhost:3001/api/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        navigate('/');
      } else {
        alert('Failed to delete post');
      }
    } catch (err) {
      alert('Error deleting post');
    }
  };

  if (loading) return <div className="container">Loading post...</div>;
  if (!post) return <div className="container">Post not found</div>;

  const isAuthor = user?.id === post.author_id;

  return (
    <div className="container">
      <article className="post-detail">
        <header className="post-header">
          <h1>{post.title}</h1>
          <div className="post-meta">
            By {post.author_name} on {new Date(post.created_at).toLocaleDateString()}
          </div>
          {isAuthor && (
            <div className="author-actions">
              <button onClick={handleDelete} className="btn-danger">Delete Post</button>
            </div>
          )}
        </header>
        <div className="post-content">
          {post.content.split('\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </article>
    </div>
  );
};

export default PostDetail;
