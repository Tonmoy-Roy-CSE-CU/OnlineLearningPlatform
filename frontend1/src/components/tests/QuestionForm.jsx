// components/tests/QuestionForm.js
import React, { useState } from 'react';
export const QuestionForm = ({ onAddQuestion }) => {
  const [question, setQuestion] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuestion(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.values(question).every(val => val.trim())) {
      onAddQuestion(question);
      setQuestion({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A'
      });
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Question</h3>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text
            </label>
            <textarea
              name="question_text"
              value={question.question_text}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your question"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Option A"
              name="option_a"
              value={question.option_a}
              onChange={handleChange}
              required
            />
            <Input
              label="Option B"
              name="option_b"
              value={question.option_b}
              onChange={handleChange}
              required
            />
            <Input
              label="Option C"
              name="option_c"
              value={question.option_c}
              onChange={handleChange}
              required
            />
            <Input
              label="Option D"
              name="option_d"
              value={question.option_d}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer
            </label>
            <select
              name="correct_option"
              value={question.correct_option}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="A">Option A</option>
              <option value="B">Option B</option>
              <option value="C">Option C</option>
              <option value="D">Option D</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit">Add Question</Button>
        </div>
      </form>
    </div>
  );
};