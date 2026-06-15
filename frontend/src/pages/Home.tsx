import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Post {
  id: number;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
}

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container">Loading posts...</div>;

  return (
    <div className="container">
      <h1>Latest Posts</h1>
      <div className="posts-grid">
        {posts.length === 0 ? (
          <p>No posts found. Be the first to write one!</p>
        ) : (
          posts.map(post => (
            <article key={post.id} className="post-card">
              <h2><Link to={`/post/${post.id}`}>{post.title}</Link></h2>
              <p className="post-meta">By {post.author_name} on {new Date(post.created_at).toLocaleDateString()}</p>
              <p className="post-excerpt">{post.content.substring(0, 150)}...</p>
              <Link to={`/post/${post.id}`} className="read-more">Read More →</Link>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
