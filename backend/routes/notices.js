// routes/notices.js - Complete Notice Board System with Fixed Search

const express = require("express");
const router = express.Router();
const pool = require("../db");
const {
  authenticateToken: authMiddleware,
} = require("../middleware/authMiddleware");

// Helper function to check if user is teacher or admin
const isTeacherOrAdmin = (req, res, next) => {
  if (req.user.role !== "teacher" && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Teachers and admins only." });
  }
  next();
};

// Helper function to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// 1. CREATE NOTICE (Teachers and Admins only)
router.post("/create", authMiddleware, isTeacherOrAdmin, async (req, res) => {
  try {
    const {
      title,
      content,
      priority = "medium",
      target_audience = "all",
      expires_at,
    } = req.body;
    const posted_by = req.user.id;

    // Validation
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    if (!["low", "medium", "high", "urgent"].includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority. Must be: low, medium, high, urgent",
      });
    }

    if (!["all", "students", "teachers"].includes(target_audience)) {
      return res.status(400).json({
        message: "Invalid target audience. Must be: all, students, teachers",
      });
    }

    const query = `
            INSERT INTO notices (title, content, posted_by, priority, target_audience, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, title, content, priority, target_audience, posted_at, expires_at
        `;

    const result = await pool.query(query, [
      title,
      content,
      posted_by,
      priority,
      target_audience,
      expires_at ? new Date(expires_at) : null,
    ]);

    res.status(201).json({
      message: "Notice created successfully",
      notice: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating notice:", error);
    res.status(500).json({ message: "Server error while creating notice" });
  }
});

// 2. GET ALL NOTICES (Public - with filtering and pagination) - FIXED SEARCH
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      priority,
      status = "active",
      target_audience,
      author_id,
      search,
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Build WHERE clause
    if (status) {
      paramCount++;
      whereConditions.push(`n.status = $${paramCount}`);
      queryParams.push(status);
    }

    if (priority) {
      paramCount++;
      whereConditions.push(`n.priority = $${paramCount}`);
      queryParams.push(priority);
    }

    if (target_audience) {
      paramCount++;
      whereConditions.push(
        `(n.target_audience = $${paramCount} OR n.target_audience = 'all')`
      );
      queryParams.push(target_audience);
    }

    if (author_id) {
      paramCount++;
      whereConditions.push(`n.posted_by = $${paramCount}`);
      queryParams.push(author_id);
    }

    // FIXED: Search functionality - simple approach like blogs.js
    if (search) {
      paramCount++;
      whereConditions.push(
        `(n.title ILIKE $${paramCount} OR n.content ILIKE $${paramCount})`
      );
      queryParams.push(`%${search}%`);
    }

    // Add expiry check - exclude expired notices unless specifically requested
    whereConditions.push(
      `(n.expires_at IS NULL OR n.expires_at > CURRENT_TIMESTAMP)`
    );

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Main query with pagination
    const query = `
            SELECT 
                n.id,
                n.title,
                n.content,
                n.priority,
                n.status,
                n.target_audience,
                n.posted_at,
                n.expires_at,
                n.updated_at,
                u.name as author_name,
                u.role as author_role,
                u.id as author_id,
                COALESCE(views.view_count, 0) as view_count,
                CASE 
                    WHEN n.expires_at IS NOT NULL AND n.expires_at < CURRENT_TIMESTAMP 
                    THEN true 
                    ELSE false 
                END as is_expired
            FROM notices n
            LEFT JOIN users u ON n.posted_by = u.id
            LEFT JOIN (
                SELECT notice_id, COUNT(*) as view_count 
                FROM notice_views 
                GROUP BY notice_id
            ) views ON n.id = views.notice_id
            ${whereClause}
            ORDER BY 
                CASE n.priority 
                    WHEN 'urgent' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    WHEN 'low' THEN 4
                END,
                n.posted_at DESC
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `;

    queryParams.push(limit, offset);

    // Count query for pagination
    const countQuery = `
            SELECT COUNT(*) as total
            FROM notices n
            LEFT JOIN users u ON n.posted_by = u.id
            ${whereClause}
        `;

    const [noticesResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2)), // Remove limit and offset for count
    ]);

    const totalNotices = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalNotices / limit);

    res.json({
      notices: noticesResult.rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_notices: totalNotices,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
      filters: {
        priority,
        status,
        target_audience,
        author_id,
        search,
      },
    });
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ message: "Server error while fetching notices" });
  }
});

// 3. GET SPECIFIC NOTICE BY ID
router.get("/:id", async (req, res) => {
  try {
    const noticeId = req.params.id;

    const query = `
            SELECT 
                n.id,
                n.title,
                n.content,
                n.priority,
                n.status,
                n.target_audience,
                n.posted_at,
                n.expires_at,
                n.updated_at,
                u.name as author_name,
                u.role as author_role,
                u.id as author_id,
                COALESCE(views.view_count, 0) as view_count,
                CASE 
                    WHEN n.expires_at IS NOT NULL AND n.expires_at < CURRENT_TIMESTAMP 
                    THEN true 
                    ELSE false 
                END as is_expired
            FROM notices n
            LEFT JOIN users u ON n.posted_by = u.id
            LEFT JOIN (
                SELECT notice_id, COUNT(*) as view_count 
                FROM notice_views 
                GROUP BY notice_id
            ) views ON n.id = views.notice_id
            WHERE n.id = $1
        `;

    const result = await pool.query(query, [noticeId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Notice not found" });
    }

    res.json({ notice: result.rows[0] });
  } catch (error) {
    console.error("Error fetching notice:", error);
    res.status(500).json({ message: "Server error while fetching notice" });
  }
});

// 4. MARK NOTICE AS READ (Authenticated users)
router.post("/:id/read", authMiddleware, async (req, res) => {
  try {
    const noticeId = req.params.id;
    const userId = req.user.id;

    // Check if notice exists
    const noticeCheck = await pool.query(
      "SELECT id FROM notices WHERE id = $1",
      [noticeId]
    );
    if (noticeCheck.rows.length === 0) {
      return res.status(404).json({ message: "Notice not found" });
    }

    // Insert or update view record
    const query = `
            INSERT INTO notice_views (notice_id, user_id)
            VALUES ($1, $2)
            ON CONFLICT (notice_id, user_id) 
            DO UPDATE SET viewed_at = CURRENT_TIMESTAMP
            RETURNING viewed_at
        `;

    const result = await pool.query(query, [noticeId, userId]);

    res.json({
      message: "Notice marked as read",
      viewed_at: result.rows[0].viewed_at,
    });
  } catch (error) {
    console.error("Error marking notice as read:", error);
    res
      .status(500)
      .json({ message: "Server error while marking notice as read" });
  }
});

// 5. GET USER'S READ STATUS FOR NOTICES
router.get("/my/read-status", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { notice_ids } = req.query; // Comma-separated notice IDs

    if (!notice_ids) {
      return res.status(400).json({ message: "Notice IDs are required" });
    }

    const noticeIdArray = notice_ids.split(",").map((id) => parseInt(id));

    const query = `
            SELECT notice_id, viewed_at
            FROM notice_views
            WHERE user_id = $1 AND notice_id = ANY($2)
        `;

    const result = await pool.query(query, [userId, noticeIdArray]);

    const readStatus = {};
    noticeIdArray.forEach((id) => {
      readStatus[id] = false;
    });

    result.rows.forEach((row) => {
      readStatus[row.notice_id] = {
        read: true,
        viewed_at: row.viewed_at,
      };
    });

    res.json({ read_status: readStatus });
  } catch (error) {
    console.error("Error fetching read status:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching read status" });
  }
});

// 6. UPDATE NOTICE (Authors and Admins only)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const noticeId = req.params.id;
    const { title, content, priority, target_audience, expires_at, status } =
      req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if notice exists and get author
    const noticeCheck = await pool.query(
      "SELECT posted_by FROM notices WHERE id = $1",
      [noticeId]
    );

    if (noticeCheck.rows.length === 0) {
      return res.status(404).json({ message: "Notice not found" });
    }

    // Check permissions (author or admin)
    if (userRole !== "admin" && noticeCheck.rows[0].posted_by !== userId) {
      return res
        .status(403)
        .json({ message: "You can only update your own notices" });
    }

    // Validate inputs
    if (priority && !["low", "medium", "high", "urgent"].includes(priority)) {
      return res.status(400).json({ message: "Invalid priority" });
    }

    if (
      target_audience &&
      !["all", "students", "teachers"].includes(target_audience)
    ) {
      return res.status(400).json({ message: "Invalid target audience" });
    }

    if (status && !["active", "archived", "expired"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Build update query dynamically
    let updateFields = [];
    let queryParams = [];
    let paramCount = 0;

    if (title) {
      paramCount++;
      updateFields.push(`title = $${paramCount}`);
      queryParams.push(title);
    }

    if (content) {
      paramCount++;
      updateFields.push(`content = $${paramCount}`);
      queryParams.push(content);
    }

    if (priority) {
      paramCount++;
      updateFields.push(`priority = $${paramCount}`);
      queryParams.push(priority);
    }

    if (target_audience) {
      paramCount++;
      updateFields.push(`target_audience = $${paramCount}`);
      queryParams.push(target_audience);
    }

    if (expires_at !== undefined) {
      paramCount++;
      updateFields.push(`expires_at = $${paramCount}`);
      queryParams.push(expires_at ? new Date(expires_at) : null);
    }

    if (status) {
      paramCount++;
      updateFields.push(`status = $${paramCount}`);
      queryParams.push(status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    paramCount++;
    queryParams.push(noticeId);

    const query = `
            UPDATE notices 
            SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramCount}
            RETURNING updated_at
        `;

    const result = await pool.query(query, queryParams);

    res.json({
      message: "Notice updated successfully",
      updated_at: result.rows[0].updated_at,
    });
  } catch (error) {
    console.error("Error updating notice:", error);
    res.status(500).json({ message: "Server error while updating notice" });
  }
});

// 7. DELETE NOTICE (Authors and Admins only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const noticeId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if notice exists and get author
    const noticeCheck = await pool.query(
      "SELECT posted_by FROM notices WHERE id = $1",
      [noticeId]
    );

    if (noticeCheck.rows.length === 0) {
      return res.status(404).json({ message: "Notice not found" });
    }

    // Check permissions (author or admin)
    if (userRole !== "admin" && noticeCheck.rows[0].posted_by !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own notices" });
    }

    // Delete notice (CASCADE will handle notice_views)
    await pool.query("DELETE FROM notices WHERE id = $1", [noticeId]);

    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.error("Error deleting notice:", error);
    res.status(500).json({ message: "Server error while deleting notice" });
  }
});

// 8. GET MY NOTICES (Posted by current user)
router.get(
  "/my/notices",
  authMiddleware,
  isTeacherOrAdmin,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = "WHERE n.posted_by = $1";
      let queryParams = [userId];

      if (status) {
        whereClause += " AND n.status = $2";
        queryParams.push(status);
      }

      const query = `
            SELECT 
                n.id,
                n.title,
                n.content,
                n.priority,
                n.status,
                n.target_audience,
                n.posted_at,
                n.expires_at,
                n.updated_at,
                COALESCE(views.view_count, 0) as view_count,
                CASE 
                    WHEN n.expires_at IS NOT NULL AND n.expires_at < CURRENT_TIMESTAMP 
                    THEN true 
                    ELSE false 
                END as is_expired
            FROM notices n
            LEFT JOIN (
                SELECT notice_id, COUNT(*) as view_count 
                FROM notice_views 
                GROUP BY notice_id
            ) views ON n.id = views.notice_id
            ${whereClause}
            ORDER BY n.posted_at DESC
            LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
        `;

      queryParams.push(limit, offset);

      // Count query
      const countQuery = `
            SELECT COUNT(*) as total
            FROM notices n
            ${whereClause}
        `;

      const [noticesResult, countResult] = await Promise.all([
        pool.query(query, queryParams),
        pool.query(countQuery, queryParams.slice(0, -2)),
      ]);

      const totalNotices = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(totalNotices / limit);

      res.json({
        notices: noticesResult.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_notices: totalNotices,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      });
    } catch (error) {
      console.error("Error fetching my notices:", error);
      res.status(500).json({ message: "Server error while fetching notices" });
    }
  }
);

// 9. GET NOTICE STATISTICS (Admin only)
router.get("/admin/stats", authMiddleware, isAdmin, async (req, res) => {
  try {
    const statsQuery = `
            SELECT 
                COUNT(*) as total_notices,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_notices,
                COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_notices,
                COUNT(CASE WHEN expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP THEN 1 END) as expired_notices,
                COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_notices,
                COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_notices
            FROM notices
        `;

    const authorStatsQuery = `
            SELECT 
                u.name,
                u.role,
                COUNT(n.id) as notice_count
            FROM users u
            LEFT JOIN notices n ON u.id = n.posted_by
            WHERE u.role IN ('admin', 'teacher')
            GROUP BY u.id, u.name, u.role
            ORDER BY notice_count DESC
        `;

    const viewStatsQuery = `
            SELECT 
                COUNT(*) as total_views,
                COUNT(DISTINCT user_id) as unique_viewers,
                COUNT(DISTINCT notice_id) as notices_with_views
            FROM notice_views
        `;

    const [overallStats, authorStats, viewStats] = await Promise.all([
      pool.query(statsQuery),
      pool.query(authorStatsQuery),
      pool.query(viewStatsQuery),
    ]);

    res.json({
      overall_stats: overallStats.rows[0],
      author_stats: authorStats.rows,
      view_stats: viewStats.rows[0],
    });
  } catch (error) {
    console.error("Error fetching notice statistics:", error);
    res.status(500).json({ message: "Server error while fetching statistics" });
  }
});

// 10. GET UNREAD NOTICES COUNT (Authenticated users)
router.get("/my/unread-count", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get target audience based on user role
    let targetAudience = userRole === "student" ? "students" : "teachers";

    const query = `
            SELECT COUNT(*) as unread_count
            FROM notices n
            WHERE n.status = 'active'
            AND (n.expires_at IS NULL OR n.expires_at > CURRENT_TIMESTAMP)
            AND (n.target_audience = $1 OR n.target_audience = 'all')
            AND NOT EXISTS (
                SELECT 1 FROM notice_views nv 
                WHERE nv.notice_id = n.id AND nv.user_id = $2
            )
        `;

    const result = await pool.query(query, [targetAudience, userId]);

    res.json({ unread_count: parseInt(result.rows[0].unread_count) });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching unread count" });
  }
});

module.exports = router;