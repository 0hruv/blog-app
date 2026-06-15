import { Router, Response } from 'express';
import { getDb } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET all posts
router.get('/', async (req, res: Response) => {
  try {
    const db = await getDb();
    const posts = await db.all(`
      SELECT posts.*, users.username as author_name 
      FROM posts 
      JOIN users ON posts.author_id = users.id 
      ORDER BY created_at DESC
    `);
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single post
router.get('/:id', async (req, res: Response) => {
  try {
    const db = await getDb();
    const post = await db.get(`
      SELECT posts.*, users.username as author_name 
      FROM posts 
      JOIN users ON posts.author_id = users.id 
      WHERE posts.id = ?
    `, [req.params.id]);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE post (Protected)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const db = await getDb();
    const result = await db.run(
      'INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)',
      [title, content, req.user!.userId]
    );

    res.status(201).json({ id: result.lastID, title, content, author_id: req.user!.userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE post (Protected, author only)
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;
    const db = await getDb();
    
    const post = await db.get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author_id !== req.user!.userId) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    await db.run(
      'UPDATE posts SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title || post.title, content || post.content, req.params.id]
    );

    res.json({ message: 'Post updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE post (Protected, author only)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const post = await db.get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author_id !== req.user!.userId) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await db.run('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
