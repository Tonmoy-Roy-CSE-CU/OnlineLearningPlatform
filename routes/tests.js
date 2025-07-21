const express = require("express");
const router = express.Router();
const pool = require('../db'); // Promise-based pool from db.js
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

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [testResult] = await connection.query(
        "INSERT INTO tests (title, description, teacher_id, test_link, duration_minutes) VALUES (?, ?, ?, ?, ?)",
        [
          title,
          description,
          req.user.id,
          generateLink(),
          duration_minutes || 10,
        ]
      );

      const testId = testResult.insertId;

      for (const q of questions) {
        await connection.query(
          "INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)",
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

      await connection.commit();
      res
        .status(201)
        .json({ message: "Test created successfully", test_id: testId });
    } catch (err) {
      await connection.rollback();
      res.status(500).json({ error: err.message });
    } finally {
      connection.release();
    }
  }
);

router.get("/:link", authenticateToken, async (req, res) => {
  const link = req.params.link;
  try {
    const [testRows] = await pool.query(
      "SELECT * FROM tests WHERE test_link = ?",
      [link]
    );
    if (testRows.length === 0)
      return res.status(404).json({ message: "Test not found" });

    const test = testRows[0];

    const [questions] = await pool.query(
      "SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE test_id = ?",
      [test.id]
    );

    res.json({
      test: {
        id: test.id,
        title: test.title,
        duration_minutes: test.duration_minutes,
        questions,
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

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      let score = 0;

      const [questions] = await connection.query(
        "SELECT id, correct_option FROM questions WHERE test_id = ?",
        [testId]
      );

      const [submissionResult] = await connection.query(
        "INSERT INTO test_submissions (test_id, student_id, score, time_taken_seconds) VALUES (?, ?, ?, ?)",
        [testId, req.user.id, 0, time_taken_seconds]
      );

      const submissionId = submissionResult.insertId;

      for (const q of questions) {
        const userAnswer = answers[q.id]; // answers = { questionId: selectedOption }
        const isCorrect = userAnswer === q.correct_option;
        if (isCorrect) score++;

        await connection.query(
          "INSERT INTO answers (submission_id, question_id, selected_option, is_correct) VALUES (?, ?, ?, ?)",
          [submissionId, q.id, userAnswer, isCorrect]
        );
      }

      await connection.query(
        "UPDATE test_submissions SET score = ? WHERE id = ?",
        [score, submissionId]
      );

      await connection.commit();
      res.status(201).json({ message: "Test submitted", score });
    } catch (err) {
      await connection.rollback();
      res.status(500).json({ error: err.message });
    } finally {
      connection.release();
    }
  }
);

router.get(
  "/:testId/result/:studentId",
  authenticateToken,
  async (req, res) => {
    const { testId, studentId } = req.params;

    try {
      const [resultRows] = await pool.query(
        "SELECT * FROM test_submissions WHERE test_id = ? AND student_id = ?",
        [testId, studentId]
      );

      if (resultRows.length === 0) {
        return res.status(404).json({ message: "No result found" });
      }

      const result = resultRows[0];

      const [answers] = await pool.query(
        "SELECT question_id, selected_option, is_correct FROM answers WHERE submission_id = ?",
        [result.id]
      );

      res.json({ result, answers });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
