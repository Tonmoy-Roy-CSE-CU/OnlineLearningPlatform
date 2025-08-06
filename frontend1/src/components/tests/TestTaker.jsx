// src/components/test/TestTaker.jsx
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { Button, Loading } from '../common';
import { testService } from '../../services';

export const TestTaker = ({ test, onComplete, onCancel }) => {
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(test.duration_minutes * 60);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const timeTaken = (test.duration_minutes * 60) - timeRemaining;
      const result = await testService.submitTest(test.id, answers, timeTaken);
      onComplete({
        score: result.score,
        total: test.questions.length,
        percentage: result.percentage,
        grade: result.grade
      });
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Error submitting test. Please try again.');
    } finally {
      setLoading(false);
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

  const nextQuestion = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  if (loading) {
    return <Loading text="Submitting your test..." />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">{test.title}</h1>
              <p className="text-gray-600">
                Question {currentQuestion + 1} of {test.questions.length}
              </p>
            </div>
            <div className="text-right">
              <div className={`flex items-center text-lg font-semibold ${
                timeRemaining < 300 ? 'text-red-600' : 'text-blue-600'
              }`}>
                <Clock className="h-5 w-5 mr-1" />
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Answered: {getAnsweredCount()}/{test.questions.length}
              </p>
            </div>
          </div>
        </div>

        {/* Question Navigation */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex flex-wrap gap-2">
            {test.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => goToQuestion(index)}
                className={`w-10 h-10 rounded-md text-sm font-medium transition-colors ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : answers[test.questions[index].id]
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Current Question */}
        <div className="p-6">
          {test.questions[currentQuestion] && (
            <QuestionCard
              question={test.questions[currentQuestion]}
              questionNumber={currentQuestion + 1}
              selectedAnswer={answers[test.questions[currentQuestion].id]}
              onAnswerChange={(answer) => 
                handleAnswerChange(test.questions[currentQuestion].id, answer)
              }
            />
          )}
        </div>

        {/* Navigation Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between">
            <div className="flex space-x-3">
              <Button
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                variant="outline"
              >
                Previous
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={currentQuestion === test.questions.length - 1}
                variant="outline"
              >
                Next
              </Button>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={onCancel}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="success"
                icon={<CheckCircle className="h-4 w-4" />}
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

const QuestionCard = ({ question, questionNumber, selectedAnswer, onAnswerChange }) => {
  const options = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">
          {questionNumber}. {question.question_text}
        </h3>
      </div>
      
      <div className="space-y-3">
        {options.map(option => (
          <label 
            key={option}
            className={`flex items-start p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedAnswer === option
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name={`question_${question.id}`}
              value={option}
              checked={selectedAnswer === option}
              onChange={(e) => onAnswerChange(e.target.value)}
              className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
            />
            <span className="flex-1">
              <span className="font-medium mr-2">{option}.</span>
              {question[`option_${option.toLowerCase()}`]}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};