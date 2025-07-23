// routes/blogs.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { authenticateToken: authMiddleware } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/blogs';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|md/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
        }
    }
});

// Create a new blog post (All authenticated users can create)
router.post('/create', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { title, content, status = 'published' } = req.body;
        const author_id = req.user.id;
        const file_path = req.file ? `/uploads/blogs/${req.file.filename}` : null;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        // Validate status
        const validStatuses = ['draft', 'published', 'archived'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be draft, published, or archived' });
        }

        const result = await db.query(
            'INSERT INTO blogs (title, content, author_id, status, file_path) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at',
            [title, content, author_id, status, file_path]
        );

        res.status(201).json({
            message: 'Blog post created successfully',
            blog: {
                id: result.rows[0].id,
                title,
                content,
                status,
                file_path,
                created_at: result.rows[0].created_at
            }
        });
    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all blog posts with enhanced features
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || 'published';
        const author_id = req.query.author_id;
        const search = req.query.search;
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE b.status = $1';
        let queryParams = [status];
        let paramCount = 1;

        if (author_id) {
            paramCount++;
            whereClause += ` AND b.author_id = $${paramCount}`;
            queryParams.push(author_id);
        }

        if (search) {
            paramCount++;
            whereClause += ` AND (b.title ILIKE $${paramCount} OR b.content ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
        }

        const query = `
            SELECT 
                b.id,
                b.title,
                b.content,
                b.status,
                b.file_path,
                b.created_at,
                b.updated_at,
                u.name as author_name,
                u.role as author_role,
                u.id as author_id,
                COALESCE(likes.likes_count, 0) as likes_count,
                COALESCE(comments.comments_count, 0) as comments_count
            FROM blogs b
            JOIN users u ON b.author_id = u.id
            LEFT JOIN (
                SELECT blog_id, COUNT(*) as likes_count 
                FROM blog_likes 
                GROUP BY blog_id
            ) likes ON b.id = likes.blog_id
            LEFT JOIN (
                SELECT blog_id, COUNT(*) as comments_count 
                FROM blog_comments 
                GROUP BY blog_id
            ) comments ON b.id = comments.blog_id
            ${whereClause}
            ORDER BY b.created_at DESC
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `;

        queryParams.push(limit, offset);
        const result = await db.query(query, queryParams);

        // Get total count for pagination
        const countQuery = `SELECT COUNT(*) FROM blogs b ${whereClause}`;
        const countResult = await db.query(countQuery, queryParams.slice(0, -2));
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
            },
            filters: {
                status,
                author_id,
                search
            }
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get specific blog post with comments and like status
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const blogId = req.params.id;
        const userId = req.user?.id;

        // Get blog post with stats
        const blogResult = await db.query(`
            SELECT 
                b.id,
                b.title,
                b.content,
                b.status,
                b.file_path,
                b.created_at,
                b.updated_at,
                u.name as author_name,
                u.role as author_role,
                u.id as author_id,
                COALESCE(likes.likes_count, 0) as likes_count,
                COALESCE(comments.comments_count, 0) as comments_count,
                CASE WHEN user_likes.user_id IS NOT NULL THEN true ELSE false END as user_liked
            FROM blogs b
            JOIN users u ON b.author_id = u.id
            LEFT JOIN (
                SELECT blog_id, COUNT(*) as likes_count 
                FROM blog_likes 
                GROUP BY blog_id
            ) likes ON b.id = likes.blog_id
            LEFT JOIN (
                SELECT blog_id, COUNT(*) as comments_count 
                FROM blog_comments 
                GROUP BY blog_id
            ) comments ON b.id = comments.blog_id
            LEFT JOIN blog_likes user_likes ON b.id = user_likes.blog_id AND user_likes.user_id = $2
            WHERE b.id = $1
        `, [blogId, userId]);

        if (blogResult.rows.length === 0) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        // Get comments for this blog
        const commentsResult = await db.query(`
            SELECT 
                c.id,
                c.content,
                c.created_at,
                c.updated_at,
                u.name as commenter_name,
                u.role as commenter_role,
                u.id as commenter_id
            FROM blog_comments c
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
router.put('/:id', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const blogId = req.params.id;
        const { title, content, status } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;
        const file_path = req.file ? `/uploads/blogs/${req.file.filename}` : null;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        // Validate status if provided
        if (status) {
            const validStatuses = ['draft', 'published', 'archived'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: 'Invalid status. Must be draft, published, or archived' });
            }
        }

        // Check if blog exists and get author
        const blogResult = await db.query('SELECT author_id, file_path FROM blogs WHERE id = $1', [blogId]);
        
        if (blogResult.rows.length === 0) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        const authorId = blogResult.rows[0].author_id;
        const oldFilePath = blogResult.rows[0].file_path;

        // Check permissions (author or admin can update)
        if (userId !== authorId && userRole !== 'admin') {
            return res.status(403).json({ error: 'You can only update your own blog posts' });
        }

        // Build update query dynamically
        let updateFields = ['title = $1', 'content = $2'];
        let queryParams = [title, content];
        let paramCount = 2;

        if (status) {
            paramCount++;
            updateFields.push(`status = $${paramCount}`);
            queryParams.push(status);
        }

        if (file_path) {
            paramCount++;
            updateFields.push(`file_path = $${paramCount}`);
            queryParams.push(file_path);
            
            // Delete old file if it exists
            if (oldFilePath && fs.existsSync(`.${oldFilePath}`)) {
                fs.unlinkSync(`.${oldFilePath}`);
            }
        }

        queryParams.push(blogId);
        const updateQuery = `UPDATE blogs SET ${updateFields.join(', ')} WHERE id = $${paramCount + 1} RETURNING updated_at`;
        
        const result = await db.query(updateQuery, queryParams);

        res.json({ 
            message: 'Blog post updated successfully',
            updated_at: result.rows[0].updated_at
        });
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

        // Check if blog exists and get author and file path
        const blogResult = await db.query('SELECT author_id, file_path FROM blogs WHERE id = $1', [blogId]);
        
        if (blogResult.rows.length === 0) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        const authorId = blogResult.rows[0].author_id;
        const filePath = blogResult.rows[0].file_path;

        // Check permissions (author or admin can delete)
        if (userId !== authorId && userRole !== 'admin') {
            return res.status(403).json({ error: 'You can only delete your own blog posts' });
        }

        // Delete associated file if it exists
        if (filePath && fs.existsSync(`.${filePath}`)) {
            fs.unlinkSync(`.${filePath}`);
        }

        // Delete blog (cascade deletes will handle likes and comments)
        await db.query('DELETE FROM blogs WHERE id = $1', [blogId]);

        res.json({ message: 'Blog post deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Like/Unlike blog post
router.post('/:id/like', authMiddleware, async (req, res) => {
    try {
        const blogId = req.params.id;
        const userId = req.user.id;

        // Check if blog exists
        const blogResult = await db.query('SELECT id FROM blogs WHERE id = $1 AND status = $2', [blogId, 'published']);
        
        if (blogResult.rows.length === 0) {
            return res.status(404).json({ error: 'Blog post not found or not published' });
        }

        // Check if user already liked this blog
        const existingLike = await db.query(
            'SELECT id FROM blog_likes WHERE blog_id = $1 AND user_id = $2',
            [blogId, userId]
        );

        if (existingLike.rows.length > 0) {
            // Unlike - remove the like
            await db.query('DELETE FROM blog_likes WHERE blog_id = $1 AND user_id = $2', [blogId, userId]);
            
            // Get updated like count
            const countResult = await db.query('SELECT COUNT(*) as likes_count FROM blog_likes WHERE blog_id = $1', [blogId]);
            
            res.json({ 
                message: 'Blog post unliked successfully',
                liked: false,
                likes_count: parseInt(countResult.rows[0].likes_count)
            });
        } else {
            // Like - add the like
            await db.query('INSERT INTO blog_likes (blog_id, user_id) VALUES ($1, $2)', [blogId, userId]);
            
            // Get updated like count
            const countResult = await db.query('SELECT COUNT(*) as likes_count FROM blog_likes WHERE blog_id = $1', [blogId]);
            
            res.json({ 
                message: 'Blog post liked successfully',
                liked: true,
                likes_count: parseInt(countResult.rows[0].likes_count)
            });
        }
    } catch (error) {
        console.error('Error toggling blog like:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get blog likes
router.get('/:id/likes', async (req, res) => {
    try {
        const blogId = req.params.id;

        // Check if blog exists
        const blogResult = await db.query('SELECT id FROM blogs WHERE id = $1', [blogId]);
        
        if (blogResult.rows.length === 0) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        const result = await db.query(`
            SELECT 
                bl.created_at,
                u.name as user_name,
                u.role as user_role
            FROM blog_likes bl
            JOIN users u ON bl.user_id = u.id
            WHERE bl.blog_id = $1
            ORDER BY bl.created_at DESC
        `, [blogId]);

        res.json({ 
            likes: result.rows,
            likes_count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching blog likes:', error);
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

        // Check if blog exists and is published
        const blogResult = await db.query('SELECT id FROM blogs WHERE id = $1 AND status = $2', [blogId, 'published']);
        
        if (blogResult.rows.length === 0) {
            return res.status(404).json({ error: 'Blog post not found or not published' });
        }

        const result = await db.query(
            'INSERT INTO blog_comments (blog_id, user_id, content) VALUES ($1, $2, $3) RETURNING id, created_at',
            [blogId, userId, content.trim()]
        );

        res.status(201).json({
            message: 'Comment added successfully',
            comment: {
                id: result.rows[0].id,
                content: content.trim(),
                created_at: result.rows[0].created_at
            }
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

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
                c.updated_at,
                u.name as commenter_name,
                u.role as commenter_role,
                u.id as commenter_id
            FROM blog_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.blog_id = $1
            ORDER BY c.created_at ASC
            LIMIT $2 OFFSET $3
        `, [blogId, limit, offset]);

        // Get total count for pagination
        const countResult = await db.query('SELECT COUNT(*) FROM blog_comments WHERE blog_id = $1', [blogId]);
        const totalComments = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalComments / limit);

        res.json({ 
            comments: result.rows,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                total_comments: totalComments,
                has_next: page < totalPages,
                has_prev: page > 1
            }
        });
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
        const commentResult = await db.query('SELECT user_id FROM blog_comments WHERE id = $1', [commentId]);
        
        if (commentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const commentAuthorId = commentResult.rows[0].user_id;

        // Check permissions (comment author or admin can update)
        if (userId !== commentAuthorId && userRole !== 'admin') {
            return res.status(403).json({ error: 'You can only update your own comments' });
        }

        const result = await db.query(
            'UPDATE blog_comments SET content = $1 WHERE id = $2 RETURNING updated_at',
            [content.trim(), commentId]
        );

        res.json({ 
            message: 'Comment updated successfully',
            updated_at: result.rows[0].updated_at
        });
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
        const commentResult = await db.query('SELECT user_id FROM blog_comments WHERE id = $1', [commentId]);
        
        if (commentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const commentAuthorId = commentResult.rows[0].user_id;

        // Check permissions (comment author or admin can delete)
        if (userId !== commentAuthorId && userRole !== 'admin') {
            return res.status(403).json({ error: 'You can only delete your own comments' });
        }

        await db.query('DELETE FROM blog_comments WHERE id = $1', [commentId]);

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user's own blogs (drafts, published, archived)
router.get('/my/blogs', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status; // Optional filter
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE b.author_id = $1';
        let queryParams = [userId];

        if (status) {
            whereClause += ' AND b.status = $2';
            queryParams.push(status);
        }

        const query = `
            SELECT 
                b.id,
                b.title,
                b.content,
                b.status,
                b.file_path,
                b.created_at,
                b.updated_at,
                COALESCE(likes.likes_count, 0) as likes_count,
                COALESCE(comments.comments_count, 0) as comments_count
            FROM blogs b
            LEFT JOIN (
                SELECT blog_id, COUNT(*) as likes_count 
                FROM blog_likes 
                GROUP BY blog_id
            ) likes ON b.id = likes.blog_id
            LEFT JOIN (
                SELECT blog_id, COUNT(*) as comments_count 
                FROM blog_comments 
                GROUP BY blog_id
            ) comments ON b.id = comments.blog_id
            ${whereClause}
            ORDER BY b.updated_at DESC
            LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
        `;

        queryParams.push(limit, offset);
        const result = await db.query(query, queryParams);

        // Get total count
        const countQuery = `SELECT COUNT(*) FROM blogs b ${whereClause}`;
        const countResult = await db.query(countQuery, queryParams.slice(0, -2));
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
        console.error('Error fetching user blogs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get blog statistics (Admin only)
router.get('/admin/stats', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const stats = await db.query(`
            SELECT 
                COUNT(*) as total_blogs,
                COUNT(CASE WHEN status = 'published' THEN 1 END) as published_blogs,
                COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_blogs,
                COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_blogs,
                (SELECT COUNT(*) FROM blog_likes) as total_likes,
                (SELECT COUNT(*) FROM blog_comments) as total_comments
            FROM blogs
        `);

        const authorStats = await db.query(`
            SELECT 
                u.name,
                u.role,
                COUNT(b.id) as blog_count
            FROM users u
            LEFT JOIN blogs b ON u.id = b.author_id
            GROUP BY u.id, u.name, u.role
            HAVING COUNT(b.id) > 0
            ORDER BY blog_count DESC
        `);

        res.json({
            overall_stats: stats.rows[0],
            author_stats: authorStats.rows
        });
    } catch (error) {
        console.error('Error fetching blog stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;