// routes/blogs.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken: authMiddleware } = require('../middleware/authMiddleware');
// Create a new blog post (Admin/Teacher only)
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;
        const author_id = req.user.id;

        // Check if user is admin or teacher
        if (req.user.role === 'student') {
            return res.status(403).json({ error: 'Only admin and teachers can create blog posts' });
        }

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const result = await db.query(
            'INSERT INTO blogs (title, content, author_id) VALUES ($1, $2, $3) RETURNING id',
            [title, content, author_id]
        );

        res.status(201).json({
            message: 'Blog post created successfully',
            blog_id: result.rows[0].id
        });
    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all blog posts with author details
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const result = await db.query(`
            SELECT 
                b.id,
                b.title,
                b.content,
                b.created_at,
                u.name as author_name,
                u.role as author_role,
                (SELECT COUNT(*) FROM comments c WHERE c.blog_id = b.id) as comment_count
            FROM blogs b
            JOIN users u ON b.author_id = u.id
            ORDER BY b.created_at DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        // Get total count for pagination
        const countResult = await db.query('SELECT COUNT(*) FROM blogs');
        const totalBlogs = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalBlogs / limit);

        res.json({
            blogs: result.rows,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                total_blogs: totalBlogs,
                has_next: page < totalPages,
                has_prev: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get specific blog post with comments
router.get('/:id', async (req, res) => {
    try {
        const blogId = req.params.id;

        // Get blog post
        const blogResult = await db.query(`
            SELECT 
                b.id,
                b.title,
                b.content,
                b.created_at,
                u.name as author_name,
                u.role as author_role,
                u.id as author_id
            FROM blogs b
            JOIN users u ON b.author_id = u.id
            WHERE b.id = $1
        `, [blogId]);

        if (blogResult.rows.length === 0) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        // Get comments for this blog
        const commentsResult = await db.query(`
            SELECT 
                c.id,
                c.content,
                c.created_at,
                u.name as commenter_name,
                u.role as commenter_role
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.blog_id = $1
            ORDER BY c.created_at ASC
        `, [blogId]);

        const blog = blogResult.rows[0];
        blog.comments = commentsResult.rows;

        res.json({ blog });
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update blog post (Author or Admin only)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const blogId = req.params.id;
        const { title, content } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        // Check if blog exists and get author
        const blogResult = await db.query('SELECT author_id FROM blogs WHERE id = $1', [blogId]);
        
        if (blogResult.rows.length === 0) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        const authorId = blogResult.rows[0].author_id;

        // Check permissions (author or admin can update)
        if (userId !== authorId && userRole !== 'admin') {
            return res.status(403).json({ error: 'You can only update your own blog posts' });
        }

        await db.query(
            'UPDATE blogs SET title = $1, content = $2 WHERE id = $3',
            [title, content, blogId]
        );

        res.json({ message: 'Blog post updated successfully' });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete blog post (Author or Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const blogId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Check if blog exists and get author
        const blogResult = await db.query('SELECT author_id FROM blogs WHERE id = $1', [blogId]);
        
        if (blogResult.rows.length === 0) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        const authorId = blogResult.rows[0].author_id;

        // Check permissions (author or admin can delete)
        if (userId !== authorId && userRole !== 'admin') {
            return res.status(403).json({ error: 'You can only delete your own blog posts' });
        }

        // Delete blog (comments will be deleted due to foreign key cascade if set)
        await db.query('DELETE FROM comments WHERE blog_id = $1', [blogId]);
        await db.query('DELETE FROM blogs WHERE id = $1', [blogId]);

        res.json({ message: 'Blog post deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add comment to blog post (Authenticated users only)
router.post('/:id/comments', authMiddleware, async (req, res) => {
    try {
        const blogId = req.params.id;
        const { content } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        // Check if blog exists
        const blogResult = await db.query('SELECT id FROM blogs WHERE id = $1', [blogId]);
        
        if (blogResult.rows.length === 0) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        const result = await db.query(
            'INSERT INTO comments (blog_id, user_id, content) VALUES ($1, $2, $3) RETURNING id',
            [blogId, userId, content.trim()]
        );

        res.status(201).json({
            message: 'Comment added successfully',
            comment_id: result.rows[0].id
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get comments for a blog post
router.get('/:id/comments', async (req, res) => {
    try {
        const blogId = req.params.id;

        // Check if blog exists
        const blogResult = await db.query('SELECT id FROM blogs WHERE id = $1', [blogId]);
        
        if (blogResult.rows.length === 0) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        const result = await db.query(`
            SELECT 
                c.id,
                c.content,
                c.created_at,
                u.name as commenter_name,
                u.role as commenter_role
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.blog_id = $1
            ORDER BY c.created_at ASC
        `, [blogId]);

        res.json({ comments: result.rows });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update comment (Comment author or Admin only)
router.put('/comments/:commentId', authMiddleware, async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const { content } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Validate required fields
        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        // Check if comment exists and get author
        const commentResult = await db.query('SELECT user_id FROM comments WHERE id = $1', [commentId]);
        
        if (commentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const commentAuthorId = commentResult.rows[0].user_id;

        // Check permissions (comment author or admin can update)
        if (userId !== commentAuthorId && userRole !== 'admin') {
            return res.status(403).json({ error: 'You can only update your own comments' });
        }

        await db.query(
            'UPDATE comments SET content = $1 WHERE id = $2',
            [content.trim(), commentId]
        );

        res.json({ message: 'Comment updated successfully' });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete comment (Comment author or Admin only)
router.delete('/comments/:commentId', authMiddleware, async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Check if comment exists and get author
        const commentResult = await db.query('SELECT user_id FROM comments WHERE id = $1', [commentId]);
        
        if (commentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const commentAuthorId = commentResult.rows[0].user_id;

        // Check permissions (comment author or admin can delete)
        if (userId !== commentAuthorId && userRole !== 'admin') {
            return res.status(403).json({ error: 'You can only delete your own comments' });
        }

        await db.query('DELETE FROM comments WHERE id = $1', [commentId]);

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Search blogs
router.get('/search/:query', async (req, res) => {
    try {
        const searchQuery = req.params.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const result = await db.query(`
            SELECT 
                b.id,
                b.title,
                b.content,
                b.created_at,
                u.name as author_name,
                u.role as author_role,
                (SELECT COUNT(*) FROM comments c WHERE c.blog_id = b.id) as comment_count
            FROM blogs b
            JOIN users u ON b.author_id = u.id
            WHERE b.title ILIKE $1 OR b.content ILIKE $1
            ORDER BY b.created_at DESC
            LIMIT $2 OFFSET $3
        `, [`%${searchQuery}%`, limit, offset]);

        res.json({
            blogs: result.rows,
            search_query: searchQuery,
            results_count: result.rows.length
        });
    } catch (error) {
        console.error('Error searching blogs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;