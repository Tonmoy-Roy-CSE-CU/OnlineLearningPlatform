const express = require("express");
const router = express.Router();
const pool = require("../db"); // PostgreSQL pool
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

function generateLink() {
  return "test-" + Math.random().toString(36).substring(2, 10);
}

router.post(
  "/create",
  authenticateToken,
  authorizeRoles("teacher"),
  async (req, res) => {
    const { title, description, duration_minutes, questions } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res
        .status(400)
        .json({ message: "Test title and questions are required" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const testResult = await client.query(
        "INSERT INTO tests (title, description, teacher_id, test_link, duration_minutes) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [
          title,
          description,
          req.user.id,
          generateLink(),
          duration_minutes || 10,
        ]
      );

      const testId = testResult.rows[0].id;

      for (const q of questions) {
        await client.query(
          "INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [
            testId,
            q.question_text,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.correct_option,
          ]
        );
      }

      await client.query("COMMIT");
      res
        .status(201)
        .json({ message: "Test created successfully", test_id: testId });
    } catch (err) {
      await client.query("ROLLBACK");
      res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  }
);

router.get("/:link", authenticateToken, async (req, res) => {
  const link = req.params.link;
  try {
    const testResult = await pool.query(
      "SELECT * FROM tests WHERE test_link = $1",
      [link]
    );
    if (testResult.rows.length === 0)
      return res.status(404).json({ message: "Test not found" });

    const test = testResult.rows[0];

    const questionsResult = await pool.query(
      "SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE test_id = $1",
      [test.id]
    );

    res.json({
      test: {
        id: test.id,
        title: test.title,
        duration_minutes: test.duration_minutes,
        questions: questionsResult.rows,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  "/:testId/submit",
  authenticateToken,
  authorizeRoles("student"),
  async (req, res) => {
    const testId = req.params.testId;
    const { answers, time_taken_seconds } = req.body;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      let score = 0;

      const questionsResult = await client.query(
        "SELECT id, correct_option FROM questions WHERE test_id = $1",
        [testId]
      );

      const submissionResult = await client.query(
        "INSERT INTO test_submissions (test_id, student_id, score, time_taken_seconds) VALUES ($1, $2, $3, $4) RETURNING id",
        [testId, req.user.id, 0, time_taken_seconds]
      );

      const submissionId = submissionResult.rows[0].id;

      for (const q of questionsResult.rows) {
        const userAnswer = answers[q.id]; // answers = { questionId: selectedOption }
        const isCorrect = userAnswer === q.correct_option;
        if (isCorrect) score++;

        await client.query(
          "INSERT INTO answers (submission_id, question_id, selected_option, is_correct) VALUES ($1, $2, $3, $4)",
          [submissionId, q.id, userAnswer, isCorrect]
        );
      }

      await client.query(
        "UPDATE test_submissions SET score = $1 WHERE id = $2",
        [score, submissionId]
      );

      await client.query("COMMIT");
      res.status(201).json({ message: "Test submitted", score });
    } catch (err) {
      await client.query("ROLLBACK");
      res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  }
);

router.get(
  "/:testId/result/:studentId",
  authenticateToken,
  async (req, res) => {
    const { testId, studentId } = req.params;

    try {
      const resultQuery = await pool.query(
        "SELECT * FROM test_submissions WHERE test_id = $1 AND student_id = $2 ORDER BY submitted_at DESC LIMIT 1",
        [testId, studentId]
      );

      if (resultQuery.rows.length === 0) {
        return res.status(404).json({ message: "No result found" });
      }

      const result = resultQuery.rows[0];

      const answersQuery = await pool.query(
        "SELECT question_id, selected_option, is_correct FROM answers WHERE submission_id = $1",
        [result.id]
      );

      res.json({ result, answers: answersQuery.rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);
// Enhanced routes to add to your existing tests.js file

// ===== STUDENT RESULT ROUTES =====

// Get student's own test results (enhanced version)
router.get(
  "/my/results",
  authenticateToken,
  authorizeRoles("student"),
  async (req, res) => {
    try {
      const studentId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const query = `
            SELECT 
                ts.id as submission_id,
                ts.score,
                ts.time_taken_seconds,
                ts.submitted_at,
                t.id as test_id,
                t.title as test_title,
                t.description as test_description,
                t.duration_minutes,
                u.name as teacher_name,
                (SELECT COUNT(*) FROM questions WHERE test_id = t.id) as total_questions,
                ROUND((ts.score::decimal / (SELECT COUNT(*) FROM questions WHERE test_id = t.id)) * 100, 2) as percentage,
                CASE 
                    WHEN (ts.score::decimal / (SELECT COUNT(*) FROM questions WHERE test_id = t.id)) >= 0.8 THEN 'Excellent'
                    WHEN (ts.score::decimal / (SELECT COUNT(*) FROM questions WHERE test_id = t.id)) >= 0.6 THEN 'Good'
                    WHEN (ts.score::decimal / (SELECT COUNT(*) FROM questions WHERE test_id = t.id)) >= 0.4 THEN 'Average'
                    ELSE 'Needs Improvement'
                END as grade
            FROM test_submissions ts
            JOIN tests t ON ts.test_id = t.id
            JOIN users u ON t.teacher_id = u.id
            WHERE ts.student_id = $1
            ORDER BY ts.submitted_at DESC
            LIMIT $2 OFFSET $3
        `;

      const result = await pool.query(query, [studentId, limit, offset]);

      // Get total count for pagination
      const countResult = await pool.query(
        "SELECT COUNT(*) FROM test_submissions WHERE student_id = $1",
        [studentId]
      );

      const totalResults = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalResults / limit);

      res.json({
        results: result.rows,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_results: totalResults,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      });
    } catch (error) {
      console.error("Error fetching student results:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get detailed result for a specific test submission (student view)
router.get(
  "/submission/:submissionId/detailed",
  authenticateToken,
  async (req, res) => {
    try {
      const submissionId = req.params.submissionId;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Get submission details with test info
      const submissionQuery = `
            SELECT 
                ts.id,
                ts.score,
                ts.time_taken_seconds,
                ts.submitted_at,
                ts.student_id,
                t.id as test_id,
                t.title as test_title,
                t.description as test_description,
                t.duration_minutes,
                t.teacher_id,
                u_student.name as student_name,
                u_teacher.name as teacher_name,
                (SELECT COUNT(*) FROM questions WHERE test_id = t.id) as total_questions,
                ROUND((ts.score::decimal / (SELECT COUNT(*) FROM questions WHERE test_id = t.id)) * 100, 2) as percentage
            FROM test_submissions ts
            JOIN tests t ON ts.test_id = t.id
            JOIN users u_student ON ts.student_id = u_student.id
            JOIN users u_teacher ON t.teacher_id = u_teacher.id
            WHERE ts.id = $1
        `;

      const submissionResult = await pool.query(submissionQuery, [
        submissionId,
      ]);

      if (submissionResult.rows.length === 0) {
        return res.status(404).json({ error: "Test submission not found" });
      }

      const submission = submissionResult.rows[0];

      // Check permissions (student can only see their own results, teachers can see their test results)
      if (userRole === "student" && submission.student_id !== userId) {
        return res
          .status(403)
          .json({ error: "You can only view your own test results" });
      }
      if (userRole === "teacher" && submission.teacher_id !== userId) {
        return res
          .status(403)
          .json({ error: "You can only view results for your own tests" });
      }

      // Get detailed answers
      const answersQuery = `
            SELECT 
                a.question_id,
                a.selected_option,
                a.is_correct,
                q.question_text,
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d,
                q.correct_option
            FROM answers a
            JOIN questions q ON a.question_id = q.id
            WHERE a.submission_id = $1
            ORDER BY q.id
        `;

      const answersResult = await pool.query(answersQuery, [submissionId]);

      res.json({
        submission: submission,
        answers: answersResult.rows,
        summary: {
          correct_answers: submission.score,
          total_questions: submission.total_questions,
          percentage: submission.percentage,
          time_taken_minutes: Math.round(submission.time_taken_seconds / 60),
          grade:
            submission.percentage >= 80
              ? "Excellent"
              : submission.percentage >= 60
              ? "Good"
              : submission.percentage >= 40
              ? "Average"
              : "Needs Improvement",
        },
      });
    } catch (error) {
      console.error("Error fetching detailed result:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ===== TEACHER ANALYTICS ROUTES =====

// Get analytics for teacher's tests
router.get(
  "/my/analytics",
  authenticateToken,
  authorizeRoles("teacher"),
  async (req, res) => {
    try {
      const teacherId = req.user.id;
      const testId = req.query.test_id; // Optional filter by specific test

      let testFilter = "";
      let queryParams = [teacherId];
      if (testId) {
        testFilter = "AND t.id = $2";
        queryParams.push(testId);
      }

      // Overall statistics
      const overallStatsQuery = `
            SELECT 
                COUNT(DISTINCT t.id) as total_tests,
                COUNT(ts.id) as total_submissions,
                COUNT(DISTINCT ts.student_id) as unique_students,
                ROUND(AVG(ts.score::decimal / (
                    SELECT COUNT(*) FROM questions WHERE test_id = t.id
                ) * 100), 2) as average_percentage,
                ROUND(AVG(ts.time_taken_seconds / 60.0), 2) as average_time_minutes
            FROM tests t
            LEFT JOIN test_submissions ts ON t.id = ts.test_id
            WHERE t.teacher_id = $1 ${testFilter}
        `;

      // Test-wise performance
      const testStatsQuery = `
            SELECT 
                t.id,
                t.title,
                t.duration_minutes,
                t.created_at,
                COUNT(ts.id) as submission_count,
                COUNT(DISTINCT ts.student_id) as unique_students,
                ROUND(AVG(ts.score::decimal / (
                    SELECT COUNT(*) FROM questions WHERE test_id = t.id
                ) * 100), 2) as average_percentage,
                MIN(ts.score::decimal / (
                    SELECT COUNT(*) FROM questions WHERE test_id = t.id
                ) * 100) as min_percentage,
                MAX(ts.score::decimal / (
                    SELECT COUNT(*) FROM questions WHERE test_id = t.id
                ) * 100) as max_percentage,
                ROUND(AVG(ts.time_taken_seconds / 60.0), 2) as average_time_minutes,
                (SELECT COUNT(*) FROM questions WHERE test_id = t.id) as total_questions
            FROM tests t
            LEFT JOIN test_submissions ts ON t.id = ts.test_id
            WHERE t.teacher_id = $1 ${testFilter}
            GROUP BY t.id, t.title, t.duration_minutes, t.created_at
            ORDER BY t.created_at DESC
        `;

      // Question-wise analysis (for specific test)
      let questionAnalysis = [];
      if (testId) {
        const questionStatsQuery = `
                SELECT 
                    q.id,
                    q.question_text,
                    q.correct_option,
                    COUNT(a.id) as total_attempts,
                    COUNT(CASE WHEN a.is_correct THEN 1 END) as correct_attempts,
                    ROUND(
                        COUNT(CASE WHEN a.is_correct THEN 1 END)::decimal / 
                        NULLIF(COUNT(a.id), 0) * 100, 2
                    ) as success_rate,
                    COUNT(CASE WHEN a.selected_option = 'A' THEN 1 END) as option_a_count,
                    COUNT(CASE WHEN a.selected_option = 'B' THEN 1 END) as option_b_count,
                    COUNT(CASE WHEN a.selected_option = 'C' THEN 1 END) as option_c_count,
                    COUNT(CASE WHEN a.selected_option = 'D' THEN 1 END) as option_d_count
                FROM questions q
                LEFT JOIN answers a ON q.id = a.question_id
                WHERE q.test_id = $${queryParams.length}
                GROUP BY q.id, q.question_text, q.correct_option
                ORDER BY q.id
            `;

        const questionResult = await pool.query(questionStatsQuery, [
          ...queryParams,
          testId,
        ]);
        questionAnalysis = questionResult.rows;
      }

      const [overallResult, testStatsResult] = await Promise.all([
        pool.query(overallStatsQuery, queryParams),
        pool.query(testStatsQuery, queryParams),
      ]);

      res.json({
        overall_stats: overallResult.rows[0],
        test_stats: testStatsResult.rows,
        question_analysis: questionAnalysis,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get student performance for a specific test (teacher view)
router.get(
  "/:testId/students/performance",
  authenticateToken,
  authorizeRoles("teacher"),
  async (req, res) => {
    try {
      const testId = req.params.testId;
      const teacherId = req.user.id;

      // Verify test belongs to teacher
      const testCheck = await pool.query(
        "SELECT id FROM tests WHERE id = $1 AND teacher_id = $2",
        [testId, teacherId]
      );
      if (testCheck.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Test not found or unauthorized" });
      }

      const query = `
            SELECT 
                ts.id as submission_id,
                ts.score,
                ts.time_taken_seconds,
                ts.submitted_at,
                u.id as student_id,
                u.name as student_name,
                u.email as student_email,
                (SELECT COUNT(*) FROM questions WHERE test_id = $1) as total_questions,
                ROUND((ts.score::decimal / (SELECT COUNT(*) FROM questions WHERE test_id = $1)) * 100, 2) as percentage,
                ROUND(ts.time_taken_seconds / 60.0, 2) as time_taken_minutes,
                CASE 
                    WHEN (ts.score::decimal / (SELECT COUNT(*) FROM questions WHERE test_id = $1)) >= 0.8 THEN 'Excellent'
                    WHEN (ts.score::decimal / (SELECT COUNT(*) FROM questions WHERE test_id = $1)) >= 0.6 THEN 'Good'
                    WHEN (ts.score::decimal / (SELECT COUNT(*) FROM questions WHERE test_id = $1)) >= 0.4 THEN 'Average'
                    ELSE 'Needs Improvement'
                END as grade,
                RANK() OVER (ORDER BY ts.score DESC, ts.time_taken_seconds ASC) as rank
            FROM test_submissions ts
            JOIN users u ON ts.student_id = u.id
            WHERE ts.test_id = $1
            ORDER BY ts.score DESC, ts.time_taken_seconds ASC
        `;

      const result = await pool.query(query, [testId]);

      // Get test details
      const testDetails = await pool.query(
        `
            SELECT t.title, t.description, t.duration_minutes, t.created_at,
                   COUNT(q.id) as total_questions
            FROM tests t
            LEFT JOIN questions q ON t.id = q.test_id
            WHERE t.id = $1
            GROUP BY t.id, t.title, t.description, t.duration_minutes, t.created_at
        `,
        [testId]
      );

      res.json({
        test_details: testDetails.rows[0],
        student_performance: result.rows,
        summary: {
          total_submissions: result.rows.length,
          average_score:
            result.rows.length > 0
              ? Math.round(
                  (result.rows.reduce(
                    (sum, row) => sum + parseFloat(row.percentage),
                    0
                  ) /
                    result.rows.length) *
                    100
                ) / 100
              : 0,
          highest_score:
            result.rows.length > 0
              ? Math.max(
                  ...result.rows.map((row) => parseFloat(row.percentage))
                )
              : 0,
          lowest_score:
            result.rows.length > 0
              ? Math.min(
                  ...result.rows.map((row) => parseFloat(row.percentage))
                )
              : 0,
        },
      });
    } catch (error) {
      console.error("Error fetching student performance:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get performance comparison between students
router.get(
  "/:testId/comparison",
  authenticateToken,
  authorizeRoles("teacher"),
  async (req, res) => {
    try {
      const testId = req.params.testId;
      const teacherId = req.user.id;

      // Verify test belongs to teacher
      const testCheck = await pool.query(
        "SELECT id FROM tests WHERE id = $1 AND teacher_id = $2",
        [testId, teacherId]
      );
      if (testCheck.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Test not found or unauthorized" });
      }

      // Performance distribution
      const distributionQuery = `
            SELECT 
                CASE 
                    WHEN (ts.score::decimal / (SELECT COUNT(*) FROM questions WHERE test_id = $1)) >= 0.8 THEN 'Excellent (80-100%)'
                    WHEN (ts.score::decimal / (SELECT COUNT(*) FROM questions WHERE test_id = $1)) >= 0.6 THEN 'Good (60-79%)'
                    WHEN (ts.score::decimal / (SELECT COUNT(*) FROM questions WHERE test_id = $1)) >= 0.4 THEN 'Average (40-59%)'
                    ELSE 'Needs Improvement (0-39%)'
                END as grade_range,
                COUNT(*) as student_count
            FROM test_submissions ts
            WHERE ts.test_id = $1
            GROUP BY 
                CASE 
                    WHEN (ts.score::decimal / (SELECT COUNT(*) FROM questions WHERE test_id = $1)) >= 0.8 THEN 'Excellent (80-100%)'
                    WHEN (ts.score::decimal / (SELECT COUNT(*) FROM questions WHERE test_id = $1)) >= 0.6 THEN 'Good (60-79%)'
                    WHEN (ts.score::decimal / (SELECT COUNT(*) FROM questions WHERE test_id = $1)) >= 0.4 THEN 'Average (40-59%)'
                    ELSE 'Needs Improvement (0-39%)'
                END
            ORDER BY 
                CASE 
                    WHEN grade_range = 'Excellent (80-100%)' THEN 1
                    WHEN grade_range = 'Good (60-79%)' THEN 2
                    WHEN grade_range = 'Average (40-59%)' THEN 3
                    ELSE 4
                END
        `;

      // Time analysis
      const timeAnalysisQuery = `
            SELECT 
                ROUND(AVG(time_taken_seconds / 60.0), 2) as average_time_minutes,
                ROUND(MIN(time_taken_seconds / 60.0), 2) as fastest_time_minutes,
                ROUND(MAX(time_taken_seconds / 60.0), 2) as slowest_time_minutes,
                COUNT(CASE WHEN time_taken_seconds <= (
                    SELECT duration_minutes * 60 * 0.5 FROM tests WHERE id = $1
                ) THEN 1 END) as finished_early_count,
                COUNT(CASE WHEN time_taken_seconds >= (
                    SELECT duration_minutes * 60 * 0.9 FROM tests WHERE id = $1
                ) THEN 1 END) as used_most_time_count
            FROM test_submissions
            WHERE test_id = $1
        `;

      const [distributionResult, timeResult] = await Promise.all([
        pool.query(distributionQuery, [testId]),
        pool.query(timeAnalysisQuery, [testId]),
      ]);

      res.json({
        grade_distribution: distributionResult.rows,
        time_analysis: timeResult.rows[0],
      });
    } catch (error) {
      console.error("Error fetching comparison data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Export test results as CSV (teacher only)
router.get(
  "/:testId/export",
  authenticateToken,
  authorizeRoles("teacher"),
  async (req, res) => {
    try {
      const testId = req.params.testId;
      const teacherId = req.user.id;

      // Verify test belongs to teacher
      const testCheck = await pool.query(
        "SELECT title FROM tests WHERE id = $1 AND teacher_id = $2",
        [testId, teacherId]
      );
      if (testCheck.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Test not found or unauthorized" });
      }

      const testTitle = testCheck.rows[0].title;

      const query = `
            SELECT 
                u.name as "Student Name",
                u.email as "Email",
                ts.score as "Score",
                (SELECT COUNT(*) FROM questions WHERE test_id = $1) as "Total Questions",
                ROUND((ts.score::decimal / (SELECT COUNT(*) FROM questions WHERE test_id = $1)) * 100, 2) as "Percentage",
                ROUND(ts.time_taken_seconds / 60.0, 2) as "Time Taken (minutes)",
                ts.submitted_at as "Submitted At",
                CASE 
                    WHEN (ts.score::decimal / (SELECT COUNT(*) FROM questions WHERE test_id = $1)) >= 0.8 THEN 'Excellent'
                    WHEN (ts.score::decimal / (SELECT COUNT(*) FROM questions WHERE test_id = $1)) >= 0.6 THEN 'Good'
                    WHEN (ts.score::decimal / (SELECT COUNT(*) FROM questions WHERE test_id = $1)) >= 0.4 THEN 'Average'
                    ELSE 'Needs Improvement'
                END as "Grade"
            FROM test_submissions ts
            JOIN users u ON ts.student_id = u.id
            WHERE ts.test_id = $1
            ORDER BY ts.score DESC, ts.time_taken_seconds ASC
        `;

      const result = await pool.query(query, [testId]);

      // Convert to CSV format
      if (result.rows.length === 0) {
        return res.json({ message: "No submissions found for this test" });
      }

      const headers = Object.keys(result.rows[0]);
      let csv = headers.join(",") + "\n";

      result.rows.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        });
        csv += values.join(",") + "\n";
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${testTitle.replace(
          /[^a-zA-Z0-9]/g,
          "_"
        )}_results.csv"`
      );
      res.send(csv);
    } catch (error) {
      console.error("Error exporting results:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ===== ADMIN ANALYTICS =====

// Get comprehensive test analytics (admin only)
router.get(
  "/admin/comprehensive-analytics",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const timeRange = req.query.range || "30"; // days

      // Overall platform statistics
      const overallStatsQuery = `
            SELECT 
                COUNT(DISTINCT t.id) as total_tests,
                COUNT(ts.id) as total_submissions,
                COUNT(DISTINCT ts.student_id) as unique_students,
                COUNT(DISTINCT t.teacher_id) as active_teachers,
                ROUND(AVG(ts.score::decimal / (
                    SELECT COUNT(*) FROM questions WHERE test_id = t.id
                ) * 100), 2) as platform_average_percentage
            FROM tests t
            LEFT JOIN test_submissions ts ON t.id = ts.test_id
            WHERE t.created_at >= NOW() - INTERVAL '${timeRange} days'
        `;

      // Teacher activity
      const teacherActivityQuery = `
            SELECT 
                u.name as teacher_name,
                COUNT(DISTINCT t.id) as tests_created,
                COUNT(ts.id) as total_submissions_received,
                ROUND(AVG(ts.score::decimal / (
                    SELECT COUNT(*) FROM questions WHERE test_id = t.id
                ) * 100), 2) as average_class_performance
            FROM users u
            LEFT JOIN tests t ON u.id = t.teacher_id
            LEFT JOIN test_submissions ts ON t.id = ts.test_id
            WHERE u.role = 'teacher' AND t.created_at >= NOW() - INTERVAL '${timeRange} days'
            GROUP BY u.id, u.name
            HAVING COUNT(t.id) > 0
            ORDER BY tests_created DESC
        `;

      // Test creation trends
      const trendQuery = `
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as tests_created
            FROM tests
            WHERE created_at >= NOW() - INTERVAL '${timeRange} days'
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `;

      const [overallResult, teacherResult, trendResult] = await Promise.all([
        pool.query(overallStatsQuery),
        pool.query(teacherActivityQuery),
        pool.query(trendQuery),
      ]);

      res.json({
        time_range_days: timeRange,
        overall_stats: overallResult.rows[0],
        teacher_activity: teacherResult.rows,
        creation_trends: trendResult.rows,
      });
    } catch (error) {
      console.error("Error fetching comprehensive analytics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
module.exports = router;
