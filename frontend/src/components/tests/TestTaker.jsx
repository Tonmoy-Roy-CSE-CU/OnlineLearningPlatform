// components/test/TestTaker.jsx
import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import apiService from '../../services/api';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

const TestTaker = ({ test, onComplete, onCancel }) => {
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(test.duration_minutes * 60);
  const [showWarning, setShowWarning] = useState(false);
  const { loading, error, execute } = useApi();

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    if (timeLeft <= 300 && !showWarning) { // 5 minutes warning
      setShowWarning(true);
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showWarning]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    try {
      const timeTaken = (test.duration_minutes * 60) - timeLeft;
      const result = await execute(
        apiService.tests.submit,
        test.id,
        answers,
        timeTaken
      );
      
      alert(`Test submitted! Score: ${result.score}/${test.questions.length}`);
      onComplete();
    } catch (err) {
      console.error('Test submission error:', err);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
              <p className="text-gray-600 mt-1">{test.description}</p>
            </div>
            <div className="text-right">
              <div className={`flex items-center text-lg font-semibold ${
                timeLeft <= 300 ? 'text-red-600' : 'text-blue-600'
              }`}>
                <Clock className="h-5 w-5 mr-2" />
                {formatTime(timeLeft)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {getAnsweredCount()}/{test.questions.length} answered
              </p>
            </div>
          </div>
        </div>

        {/* Warning for low time */}
        {showWarning && timeLeft > 0 && (
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
              <p className="text-yellow-800">
                Warning: Only {formatTime(timeLeft)} remaining!
              </p>
            </div>
          </div>
        )}

        <ErrorMessage error={error} className="m-6" />

        {/* Questions */}
        <div className="p-6">
          <div className="space-y-8">
            {test.questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                selectedAnswer={answers[question.id]}
                onAnswerChange={(answer) => handleAnswerChange(question.id, answer)}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>Make sure to answer all questions before submitting.</p>
              <p>You cannot return to this test once submitted.</p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={getAnsweredCount() === 0}
              >
                Submit Test
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Question Card Component
const QuestionCard = ({ question, index, selectedAnswer, onAnswerChange }) => {
  const options = ['A', 'B', 'C', 'D'];

  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          <span className="text-blue-600 font-bold mr-2">{index + 1}.</span>
          {question.question_text}
        </h3>
      </div>

      <div className="space-y-3">
        {options.map(option => (
          <label
            key={option}
            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedAnswer === option 
                ? 'bg-blue-50 border-blue-300 text-blue-900' 
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name={`question_${question.id}`}
              value={option}
              checked={selectedAnswer === option}
              onChange={(e) => onAnswerChange(e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-3 flex-1">
              <span className="font-medium text-gray-900 mr-2">{option}.</span>
              {question[`option_${option.toLowerCase()}`]}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default TestTaker;