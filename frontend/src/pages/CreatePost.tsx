import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CreatePost: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        navigate('/');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create post');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="container">
      <div className="post-form-card">
        <h1>Create a New Post</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              placeholder="Give your post a catchy title"
            />
          </div>
          <div className="form-group">
            <label>Content</label>
            <textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              required 
              rows={10}
              placeholder="Write your story here..."
            />
          </div>
          <button type="submit" className="btn-primary">Publish Post</button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
