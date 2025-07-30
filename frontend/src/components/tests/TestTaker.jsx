// components/tests/TestTaker.js
// components/tests/TestTaker.js
import React, { useState } from 'react';
import Button from '../common/Button';
export const TestTaker = ({ test, onSubmit }) => {
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(test.duration_minutes * 60);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswerChange = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const timeUsed = (test.duration_minutes * 60) - timeLeft;
    await onSubmit(answers, timeUsed);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
        <div className={`text-lg font-semibold ${
          timeLeft < 300 ? 'text-red-600' : 'text-gray-600'
        }`}>
          Time Left: {formatTime(timeLeft)}
        </div>
      </div>

      <div className="space-y-8">
        {test.questions.map((question, index) => (
          <div key={question.id} className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {index + 1}. {question.question_text}
            </h3>
            
            <div className="space-y-2">
              {['A', 'B', 'C', 'D'].map(option => (
                <label
                  key={option}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={() => handleAnswerChange(question.id, option)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">
                    {option}) {question[`option_${option.toLowerCase()}`]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Answered: {Object.keys(answers).length} / {test.questions.length}
        </div>
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={Object.keys(answers).length === 0}
        >
          Submit Test
        </Button>
      </div>
    </div>
  );
};