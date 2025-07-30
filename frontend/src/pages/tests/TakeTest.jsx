// src/pages/tests/TakeTest.js - Take Test Page
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testService } from '../../services/testService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';

const TakeTest = () => {
  const { link } = useParams();
  const navigate = useNavigate();
  
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchTest();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [link]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      const response = await testService.getTestByLink(link);
      setTest(response.test);
      setTimeRemaining(response.test.duration_minutes * 60); // Convert to seconds
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startTest = () => {
    setTestStarted(true);
    startTimeRef.current = Date.now();
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswerChange = (questionId, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitTest = () => {
    setShowSubmitModal(true);
  };

  const confirmSubmit = async () => {
    await submitTest();
    setShowSubmitModal(false);
  };

  const handleAutoSubmit = async () => {
    if (!testSubmitted) {
      await submitTest();
    }
  };

  const submitTest = async () => {
    if (testSubmitted) return;
    
    try {
      setSubmitting(true);
      setTestSubmitted(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const timeTakenSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      const response = await testService.submitTest(test.id, {
        answers,
        time_taken_seconds: timeTakenSeconds
      });

      navigate(`/tests/result/${test.id}`, {
        state: { 
          score: response.score,
          totalQuestions: test.questions.length,
          timeTaken: timeTakenSeconds
        }
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
      setTestSubmitted(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <Button 
            className="mt-4"
            onClick={() => navigate('/tests')}
          >
            Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {test.title}
          </h1>
          
          {test.description && (
            <p className="text-gray-600 mb-6">
              {test.description}
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2 mb-8 text-left">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Test Information</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>Questions: {test.questions.length}</li>
                <li>Duration: {test.duration_minutes} minutes</li>
                <li>Type: Multiple Choice</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Answer all questions</li>
                <li>• You can navigate between questions</li>
                <li>• Auto-submit when time expires</li>
                <li>• No negative marking</li>
              </ul>
            </div>
          </div>

          <Button
            className="btn-primary text-lg px-8 py-3"
            onClick={startTest}
          >
            Start Test
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header with timer and progress */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{test.title}</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {test.questions.length}
            </p>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-blue-600'}`}>
              {formatTime(timeRemaining)}
            </div>
            <p className="text-sm text-gray-600">
              Answered: {getAnsweredCount()}/{test.questions.length}
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Question navigation sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-3">Questions</h3>
            <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
              {test.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : answers[test.questions[index].id]
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center text-xs text-gray-600 mb-1">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
                Answered
              </div>
              <div className="flex items-center text-xs text-gray-600 mb-1">
                <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                Current
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <div className="w-3 h-3 bg-gray-100 rounded mr-2"></div>
                Not answered
              </div>
            </div>
          </div>
        </div>

        {/* Main question area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Question {currentQuestionIndex + 1}
              </h2>
              <p className="text-gray-800 text-lg leading-relaxed">
                {currentQuestion.question_text}
              </p>
            </div>

            <div className="space-y-3 mb-8">
              {['A', 'B', 'C', 'D'].map((option) => (
                <label
                  key={option}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    answers[currentQuestion.id] === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={answers[currentQuestion.id] === option}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 mr-4 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion.id] === option
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion.id] === option && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="font-medium text-gray-900 mr-3">{option}.</span>
                  <span className="text-gray-800">
                    {currentQuestion[`option_${option.toLowerCase()}`]}
                  </span>
                </label>
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              <div className="flex space-x-3">
                {currentQuestionIndex < test.questions.length - 1 ? (
                  <Button
                    className="btn-primary"
                    onClick={goToNextQuestion}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleSubmitTest}
                  >
                    Submit Test
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit confirmation modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Test"
        type="confirm"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to submit your test? You have answered{' '}
          <strong>{getAnsweredCount()}</strong> out of{' '}
          <strong>{test.questions.length}</strong> questions.
        </p>
        
        {getAnsweredCount() < test.questions.length && (
          <p className="text-amber-600 text-sm mb-4">
            ⚠️ You haven't answered all questions. Unanswered questions will be marked as incorrect.
          </p>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowSubmitModal(false)}
          >
            Continue Test
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={confirmSubmit}
            loading={submitting}
          >
            Submit Now
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TakeTest;