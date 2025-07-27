// routes/admin.js - Complete Admin Dashboard API
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../db');
const { authenticateToken: authMiddleware } = require('../middleware/authMiddleware'); // FIXED: Use destructured import

// Middleware to check admin role
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Apply auth and admin middleware to all routes
router.use(authMiddleware, adminOnly);

// ===== DASHBOARD OVERVIEW =====

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
    try {
        // Get user statistics
        const userStats = await db.query(`
            SELECT 
                role,
                COUNT(*) as count
            FROM users 
            GROUP BY role
        `);

        // Get content statistics
        const contentStats = await db.query(`
            SELECT 
                'tests' as type, COUNT(*) as count FROM tests
            UNION ALL
            SELECT 'notes' as type, COUNT(*) as count FROM notes
            UNION ALL
            SELECT 'blogs' as type, COUNT(*) as count FROM blogs
            UNION ALL
            SELECT 'notices' as type, COUNT(*) as count FROM notices
            UNION ALL
            SELECT 'comments' as type, COUNT(*) as count FROM comments
        `);

        // Get recent activity (last 30 days)
        const recentActivity = await db.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as activity_count
            FROM (
                SELECT created_at FROM tests WHERE created_at >= NOW() - INTERVAL '30 days'
                UNION ALL
                SELECT uploaded_at as created_at FROM notes WHERE uploaded_at >= NOW() - INTERVAL '30 days'
                UNION ALL
                SELECT created_at FROM blogs WHERE created_at >= NOW() - INTERVAL '30 days'
                UNION ALL
                SELECT posted_at as created_at FROM notices WHERE posted_at >= NOW() - INTERVAL '30 days'
            ) activities
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            LIMIT 30
        `);

        // Get storage usage
        const storageStats = await db.query(`
            SELECT 
                COUNT(*) as total_files,
                SUM(CASE WHEN file_path IS NOT NULL THEN 1 ELSE 0 END) as files_with_storage
            FROM (
                SELECT file_path FROM notes WHERE file_path IS NOT NULL
                UNION ALL
                SELECT file_path FROM blogs WHERE file_path IS NOT NULL
            ) files
        `);

        res.json({
            user_stats: userStats.rows,
            content_stats: contentStats.rows,
            recent_activity: recentActivity.rows,
            storage_stats: storageStats.rows[0] || { total_files: 0, files_with_storage: 0 }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ===== USER MANAGEMENT =====

// Get all users with detailed info
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const role = req.query.role; // Filter by role
        const status = req.query.status; // Filter by status

        let query = `
            SELECT 
                u.id,
                u.name,
                u.email,
                u.role,
                u.status,
                u.created_at,
                (SELECT COUNT(*) FROM tests WHERE teacher_id = u.id) as tests_created,
                (SELECT COUNT(*) FROM notes WHERE uploaded_by = u.id) as notes_uploaded,
                (SELECT COUNT(*) FROM blogs WHERE author_id = u.id) as blogs_written,
                (SELECT COUNT(*) FROM notices WHERE posted_by = u.id) as notices_posted,
                (SELECT COUNT(*) FROM test_submissions WHERE student_id = u.id) as tests_taken
            FROM users u
            WHERE 1=1
        `;
        
        const params = [];
        let paramIndex = 1;

        if (role) {
            query += ` AND u.role = $${paramIndex}`;
            params.push(role);
            paramIndex++;
        }

        if (status) {
            query += ` AND u.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        query += ` ORDER BY u.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await db.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
        const countParams = [];
        let countParamIndex = 1;

        if (role) {
            countQuery += ` AND role = $${countParamIndex}`;
            countParams.push(role);
            countParamIndex++;
        }

        if (status) {
            countQuery += ` AND status = $${countParamIndex}`;
            countParams.push(status);
            countParamIndex++;
        }

        const countResult = await db.query(countQuery, countParams);
        const totalUsers = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalUsers / limit);

        res.json({
            users: result.rows,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                total_users: totalUsers,
                has_next: page < totalPages,
                has_prev: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user status
router.put('/users/:id/status', async (req, res) => {
    try {
        const userId = req.params.id;
        const { status } = req.body;

        if (!['pending', 'approved', 'banned'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be: pending, approved, or banned' });
        }

        const result = await db.query(
            'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, email, status',
            [status, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'User status updated successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;

        if (!['admin', 'teacher', 'student'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Must be: admin, teacher, or student' });
        }

        // Prevent removing the last admin
        if (role !== 'admin') {
            const adminCount = await db.query('SELECT COUNT(*) FROM users WHERE role = $1', ['admin']);
            if (parseInt(adminCount.rows[0].count) <= 1) {
                const currentUser = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
                if (currentUser.rows[0] && currentUser.rows[0].role === 'admin') {
                    return res.status(400).json({ error: 'Cannot remove the last admin user' });
                }
            }
        }

        const result = await db.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
            [role, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'User role updated successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete user (with cascade cleanup)
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Prevent deleting the last admin
        const adminCount = await db.query('SELECT COUNT(*) FROM users WHERE role = $1', ['admin']);
        const userToDelete = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
        
        if (userToDelete.rows[0] && userToDelete.rows[0].role === 'admin' && parseInt(adminCount.rows[0].count) <= 1) {
            return res.status(400).json({ error: 'Cannot delete the last admin user' });
        }

        // Get user's files before deletion
        const userFiles = await db.query(`
            SELECT file_path FROM notes WHERE uploaded_by = $1 AND file_path IS NOT NULL
            UNION ALL
            SELECT file_path FROM blogs WHERE author_id = $1 AND file_path IS NOT NULL
        `, [userId]);

        // Delete user's files from filesystem
        userFiles.rows.forEach(row => {
            if (fs.existsSync(row.file_path)) {
                fs.unlinkSync(row.file_path);
            }
        });

        // Delete user and related data (using transactions)
        await db.query('BEGIN');
        
        // Delete in correct order to avoid foreign key issues
        await db.query('DELETE FROM answers WHERE submission_id IN (SELECT id FROM test_submissions WHERE student_id = $1)', [userId]);
        await db.query('DELETE FROM test_submissions WHERE student_id = $1', [userId]);
        await db.query('DELETE FROM comments WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM questions WHERE test_id IN (SELECT id FROM tests WHERE teacher_id = $1)', [userId]);
        await db.query('DELETE FROM tests WHERE teacher_id = $1', [userId]);
        await db.query('DELETE FROM notes WHERE uploaded_by = $1', [userId]);
        await db.query('DELETE FROM blogs WHERE author_id = $1', [userId]);
        await db.query('DELETE FROM notices WHERE posted_by = $1', [userId]);
        await db.query('DELETE FROM users WHERE id = $1', [userId]);

        await db.query('COMMIT');

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ===== CONTENT MANAGEMENT =====

// Get all content with moderation info
router.get('/content', async (req, res) => {
    try {
        const type = req.query.type; // Filter by content type
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        let results = {};

        if (!type || type === 'tests') {
            const tests = await db.query(`
                SELECT 
                    t.id,
                    t.title,
                    t.description,
                    t.created_at,
                    u.name as creator_name,
                    u.role as creator_role,
                    (SELECT COUNT(*) FROM questions WHERE test_id = t.id) as question_count,
                    (SELECT COUNT(*) FROM test_submissions WHERE test_id = t.id) as submission_count
                FROM tests t
                JOIN users u ON t.teacher_id = u.id
                ORDER BY t.created_at DESC
                LIMIT $1 OFFSET $2
            `, [limit, offset]);
            results.tests = tests.rows;
        }

        if (!type || type === 'notes') {
            const notes = await db.query(`
                SELECT 
                    n.id,
                    n.title,
                    n.description,
                    n.file_path,
                    n.uploaded_at,
                    u.name as uploader_name,
                    u.role as uploader_role,
                    CASE WHEN n.file_path IS NOT NULL THEN true ELSE false END as has_file
                FROM notes n
                JOIN users u ON n.uploaded_by = u.id
                ORDER BY n.uploaded_at DESC
                LIMIT $1 OFFSET $2
            `, [limit, offset]);
            results.notes = notes.rows;
        }

        if (!type || type === 'blogs') {
            const blogs = await db.query(`
                SELECT 
                    b.id,
                    b.title,
                    LEFT(b.content, 100) as content_preview,
                    b.file_path,
                    b.created_at,
                    u.name as author_name,
                    u.role as author_role,
                    (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comment_count,
                    CASE WHEN b.file_path IS NOT NULL THEN true ELSE false END as has_file
                FROM blogs b
                JOIN users u ON b.author_id = u.id
                ORDER BY b.created_at DESC
                LIMIT $1 OFFSET $2
            `, [limit, offset]);
            results.blogs = blogs.rows;
        }

        if (!type || type === 'notices') {
            const notices = await db.query(`
                SELECT 
                    n.id,
                    n.title,
                    LEFT(n.content, 100) as content_preview,
                    n.posted_at,
                    u.name as poster_name,
                    u.role as poster_role
                FROM notices n
                JOIN users u ON n.posted_by = u.id
                ORDER BY n.posted_at DESC
                LIMIT $1 OFFSET $2
            `, [limit, offset]);
            results.notices = notices.rows;
        }

        res.json(results);
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete any content item
router.delete('/content/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        let filePath = null;

        switch (type) {
            case 'test':
                // Delete test and related data
                await db.query('BEGIN');
                await db.query('DELETE FROM answers WHERE submission_id IN (SELECT id FROM test_submissions WHERE test_id = $1)', [id]);
                await db.query('DELETE FROM test_submissions WHERE test_id = $1', [id]);
                await db.query('DELETE FROM questions WHERE test_id = $1', [id]);
                await db.query('DELETE FROM tests WHERE id = $1', [id]);
                await db.query('COMMIT');
                break;

            case 'note':
                // Get file path and delete note
                const noteResult = await db.query('SELECT file_path FROM notes WHERE id = $1', [id]);
                if (noteResult.rows.length > 0) {
                    filePath = noteResult.rows[0].file_path;
                }
                await db.query('DELETE FROM notes WHERE id = $1', [id]);
                break;

            case 'blog':
                // Get file path and delete blog with comments
                const blogResult = await db.query('SELECT file_path FROM blogs WHERE id = $1', [id]);
                if (blogResult.rows.length > 0) {
                    filePath = blogResult.rows[0].file_path;
                }
                await db.query('DELETE FROM comments WHERE blog_id = $1', [id]);
                await db.query('DELETE FROM blogs WHERE id = $1', [id]);
                break;

            case 'notice':
                await db.query('DELETE FROM notices WHERE id = $1', [id]);
                break;

            default:
                return res.status(400).json({ error: 'Invalid content type' });
        }

        // Delete associated file if exists
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ message: `${type} deleted successfully` });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error deleting content:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ===== SYSTEM ANALYTICS =====

// Get detailed analytics
router.get('/analytics', async (req, res) => {
    try {
        const timeRange = req.query.range || '30'; // days

        // User registration trends
        const userTrends = await db.query(`
            SELECT 
                DATE(created_at) as date,
                role,
                COUNT(*) as registrations
            FROM users 
            WHERE created_at >= NOW() - INTERVAL '${timeRange} days'
            GROUP BY DATE(created_at), role
            ORDER BY date DESC
        `);

        // Content creation trends
        const contentTrends = await db.query(`
            SELECT 
                DATE(date) as date,
                type,
                COUNT(*) as count
            FROM (
                SELECT created_at as date, 'test' as type FROM tests WHERE created_at >= NOW() - INTERVAL '${timeRange} days'
                UNION ALL
                SELECT uploaded_at as date, 'note' as type FROM notes WHERE uploaded_at >= NOW() - INTERVAL '${timeRange} days'
                UNION ALL
                SELECT created_at as date, 'blog' as type FROM blogs WHERE created_at >= NOW() - INTERVAL '${timeRange} days'
                UNION ALL
                SELECT posted_at as date, 'notice' as type FROM notices WHERE posted_at >= NOW() - INTERVAL '${timeRange} days'
            ) content
            GROUP BY DATE(date), type
            ORDER BY date DESC
        `);

        // Test performance analytics
        const testAnalytics = await db.query(`
            SELECT 
                t.title as test_title,
                COUNT(ts.id) as submissions,
                ROUND(AVG(ts.score), 2) as avg_score,
                MAX(ts.score) as max_score,
                MIN(ts.score) as min_score
            FROM tests t
            LEFT JOIN test_submissions ts ON t.id = ts.test_id
            WHERE t.created_at >= NOW() - INTERVAL '${timeRange} days'
            GROUP BY t.id, t.title
            ORDER BY submissions DESC
            LIMIT 10
        `);

        // Most active users
        const activeUsers = await db.query(`
            SELECT 
                u.name,
                u.role,
                COUNT(*) as activity_count
            FROM users u
            JOIN (
                SELECT teacher_id as user_id, created_at FROM tests WHERE created_at >= NOW() - INTERVAL '${timeRange} days'
                UNION ALL
                SELECT uploaded_by as user_id, uploaded_at as created_at FROM notes WHERE uploaded_at >= NOW() - INTERVAL '${timeRange} days'
                UNION ALL
                SELECT author_id as user_id, created_at FROM blogs WHERE created_at >= NOW() - INTERVAL '${timeRange} days'
                UNION ALL
                SELECT posted_by as user_id, posted_at as created_at FROM notices WHERE posted_at >= NOW() - INTERVAL '${timeRange} days'
            ) activities ON u.id = activities.user_id
            GROUP BY u.id, u.name, u.role
            ORDER BY activity_count DESC
            LIMIT 10
        `);

        res.json({
            time_range_days: timeRange,
            user_trends: userTrends.rows,
            content_trends: contentTrends.rows,
            test_analytics: testAnalytics.rows,
            active_users: activeUsers.rows
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ===== SYSTEM MAINTENANCE =====

// Get system health info
router.get('/system/health', async (req, res) => {
    try {
        // Database connection test
        const dbHealth = await db.query('SELECT NOW() as current_time');
        
        // Check disk space usage for uploads
        const getDirectorySize = (dirPath) => {
            if (!fs.existsSync(dirPath)) return 0;
            let totalSize = 0;
            const files = fs.readdirSync(dirPath, { withFileTypes: true });
            
            for (const file of files) {
                const filePath = path.join(dirPath, file.name);
                if (file.isDirectory()) {
                    totalSize += getDirectorySize(filePath);
                } else {
                    totalSize += fs.statSync(filePath).size;
                }
            }
            return totalSize;
        };

        const uploadDirs = [
            { name: 'notes', path: 'uploads/notes/' },
            { name: 'blogs', path: 'uploads/blogs/' }
        ];

        const storageInfo = uploadDirs.map(dir => ({
            directory: dir.name,
            size_bytes: getDirectorySize(dir.path),
            size_mb: Math.round(getDirectorySize(dir.path) / 1024 / 1024 * 100) / 100,
            file_count: fs.existsSync(dir.path) ? fs.readdirSync(dir.path).length : 0
        }));

        // Get database table sizes
        const tableStats = await db.query(`
            SELECT 
                schemaname,
                tablename,
                attname,
                n_distinct,
                correlation
            FROM pg_stats 
            WHERE schemaname = 'public'
            ORDER BY tablename
        `);

        res.json({
            database: {
                status: 'healthy',
                current_time: dbHealth.rows[0].current_time
            },
            storage: storageInfo,
            tables: tableStats.rows,
            uptime: process.uptime(),
            memory_usage: process.memoryUsage(),
            node_version: process.version
        });
    } catch (error) {
        console.error('Error checking system health:', error);
        res.status(500).json({ 
            error: 'System health check failed',
            database: { status: 'error' }
        });
    }
});

// Cleanup orphaned files
router.post('/system/cleanup', async (req, res) => {
    try {
        let deletedFiles = 0;
        const orphanedFiles = [];

        // Check notes directory
        const notesDir = 'uploads/notes/';
        if (fs.existsSync(notesDir)) {
            const noteFiles = fs.readdirSync(notesDir);
            for (const file of noteFiles) {
                const filePath = path.join(notesDir, file);
                const dbResult = await db.query('SELECT id FROM notes WHERE file_path = $1', [filePath]);
                
                if (dbResult.rows.length === 0) {
                    fs.unlinkSync(filePath);
                    orphanedFiles.push(filePath);
                    deletedFiles++;
                }
            }
        }

        // Check blogs directory
        const blogsDir = 'uploads/blogs/';
        if (fs.existsSync(blogsDir)) {
            const blogFiles = fs.readdirSync(blogsDir);
            for (const file of blogFiles) {
                const filePath = path.join(blogsDir, file);
                const dbResult = await db.query('SELECT id FROM blogs WHERE file_path = $1', [filePath]);
                
                if (dbResult.rows.length === 0) {
                    fs.unlinkSync(filePath);
                    orphanedFiles.push(filePath);
                    deletedFiles++;
                }
            }
        }

        res.json({
            message: 'Cleanup completed successfully',
            deleted_files: deletedFiles,
            orphaned_files: orphanedFiles
        });
    } catch (error) {
        console.error('Error during cleanup:', error);
        res.status(500).json({ error: 'Cleanup failed' });
    }
});

// Export data (backup)
router.get('/system/export', async (req, res) => {
    try {
        const exportData = {};

        // Export all tables
        const tables = ['users', 'tests', 'questions', 'test_submissions', 'answers', 'notes', 'blogs', 'comments', 'notices'];
        
        for (const table of tables) {
            const result = await db.query(`SELECT * FROM ${table} ORDER BY id`);
            exportData[table] = result.rows;
        }

        // Add metadata
        exportData.export_info = {
            exported_at: new Date().toISOString(),
            exported_by: req.user.name,
            version: '1.0'
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="olpm_backup_${Date.now()}.json"`);
        res.json(exportData);
    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({ error: 'Export failed' });
    }
});

module.exports = router;