const express = require("express");
const router = express.Router();
const pool = require('../db'); // PostgreSQL pool
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
      await client.query('BEGIN');

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

      await client.query('COMMIT');
      res
        .status(201)
        .json({ message: "Test created successfully", test_id: testId });
    } catch (err) {
      await client.query('ROLLBACK');
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
      await client.query('BEGIN');

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

      await client.query('COMMIT');
      res.status(201).json({ message: "Test submitted", score });
    } catch (err) {
      await client.query('ROLLBACK');
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

module.exports = router;