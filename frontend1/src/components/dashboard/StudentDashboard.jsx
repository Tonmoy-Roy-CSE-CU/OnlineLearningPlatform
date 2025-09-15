import React, { useState, useEffect, useCallback } from 'react';
import { 
  TestTube, Award, Bell, Home, FileText, BookOpen, Download, 
  Heart, MessageCircle, Clock, AlertCircle, CheckCircle, XCircle,
  Eye, User, Calendar, TrendingUp, Star, RefreshCw, Search,
  Filter, ChevronDown, ChevronUp, BarChart3, Target, ArrowLeft,
  Play, Pause, RotateCcw, Send, BookmarkPlus, Share2, ThumbsUp,
  MessageSquare, ExternalLink, Upload, Trash2, Edit, Plus
} from 'lucide-react';

// Import the actual API functions
import { api } from '../../api';

// Enhanced Timer Component with visual indicators
const Timer = ({ duration, onTimeUp, isActive, onTick, isPaused = false }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (onTick) onTick(newTime);
        
        if (newTime <= 0) {
          onTimeUp();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, onTimeUp, onTick]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((duration - timeLeft) / duration) * 100;
  const isLowTime = timeLeft <= 300; // 5 minutes
  const isCriticalTime = timeLeft <= 60; // 1 minute

  return (
    <div className={`relative flex items-center px-6 py-4 rounded-xl font-mono text-xl font-bold transition-all ${
      isCriticalTime ? 'bg-red-50 text-red-700 border-2 border-red-200' :
      isLowTime ? 'bg-yellow-50 text-yellow-700 border-2 border-yellow-200' :
      'bg-green-50 text-green-700 border-2 border-green-200'
    }`}>
      <Clock className={`h-6 w-6 mr-3 ${isCriticalTime ? 'animate-pulse' : ''}`} />
      <div className="flex flex-col">
        <span className="text-2xl">{formatTime(timeLeft)}</span>
        <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isCriticalTime ? 'bg-red-500' :
              isLowTime ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      {isPaused && (
        <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1">
          <Pause className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};

// Enhanced Test Results Modal
const TestResultsModal = ({ isOpen, onClose, results, testDetails = null }) => {
  if (!isOpen || !results) return null;

  const score = results.score || 0;
  const totalQuestions = results.total_questions || 0;
  const percentage = results.percentage || Math.round((score / totalQuestions) * 100);
  const timeTaken = results.time_taken_seconds || 0;
  const answers = results.answers || [];

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 80) return 'text-blue-600 bg-blue-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getGradeText = (percentage) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Good';
    if (percentage >= 70) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                🎉 Test Completed!
              </h2>
              <p className="text-blue-100 text-lg">{testDetails?.title || 'Test Results'}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-3 transition-all"
            >
              <XCircle className="h-8 w-8" />
            </button>
          </div>
          
          {/* Score Display */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center bg-white bg-opacity-10 rounded-xl p-4">
              <div className="text-4xl font-bold mb-1">{score}</div>
              <div className="text-blue-100">Score</div>
            </div>
            <div className="text-center bg-white bg-opacity-10 rounded-xl p-4">
              <div className="text-4xl font-bold mb-1">{totalQuestions}</div>
              <div className="text-blue-100">Total Questions</div>
            </div>
            <div className="text-center bg-white bg-opacity-10 rounded-xl p-4">
              <div className="text-4xl font-bold mb-1">{percentage}%</div>
              <div className="text-blue-100">Percentage</div>
            </div>
            <div className="text-center bg-white bg-opacity-10 rounded-xl p-4">
              <div className="text-2xl font-bold mb-1">
                {Math.floor(timeTaken / 60)}m {timeTaken % 60}s
              </div>
              <div className="text-blue-100">Time Taken</div>
            </div>
          </div>
          
          {/* Grade Badge */}
          <div className="flex justify-center mt-6">
            <span className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-bold ${getGradeColor(percentage)}`}>
              <Star className="h-5 w-5 mr-2" />
              {getGradeText(percentage)}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-8 max-h-96 overflow-y-auto">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
            Question Review
          </h3>
          
          {answers && answers.length > 0 ? (
            <div className="space-y-6">
              {answers.map((answer, index) => (
                <div key={answer.question_id} className={`border-2 rounded-xl p-6 transition-all ${
                  answer.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {answer.is_correct ? (
                        <div className="bg-green-500 text-white rounded-full p-2 mr-3">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="bg-red-500 text-white rounded-full p-2 mr-3">
                          <XCircle className="h-5 w-5" />
                        </div>
                      )}
                      <span className="text-lg font-bold">Question {index + 1}</span>
                    </div>
                    <span className={`px-4 py-2 text-sm font-bold rounded-full ${
                      answer.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {answer.is_correct ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  
                  {answer.question_text && (
                    <p className="text-gray-800 mb-4 font-medium text-lg">{answer.question_text}</p>
                  )}
                  
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                      <span className="font-medium text-gray-700">Your answer:</span>
                      <span className={`px-4 py-2 rounded-lg font-medium ${
                        answer.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {answer.selected_option && answer[`option_${answer.selected_option.toLowerCase()}`]
                          ? `${answer.selected_option}. ${answer[`option_${answer.selected_option.toLowerCase()}`]}`
                          : `Option ${answer.selected_option}`
                        }
                      </span>
                    </div>
                    
                    {!answer.is_correct && answer.correct_option && (
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
                        <span className="font-medium text-gray-700">Correct answer:</span>
                        <span className="px-4 py-2 rounded-lg bg-green-100 text-green-800 font-medium">
                          {answer[`option_${answer.correct_option.toLowerCase()}`]
                            ? `${answer.correct_option}. ${answer[`option_${answer.correct_option.toLowerCase()}`]}`
                            : `Option ${answer.correct_option}`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-600 mb-2 text-lg">Great job completing the test!</div>
              <div className="text-gray-500">
                Final Score: {score}/{totalQuestions} ({percentage}%)
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-8 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-gray-600">
            <p className="text-sm">Keep up the great work! 💪</p>
          </div>
          <div className="space-x-3">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              View Detailed Analysis
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Student Dashboard Component
const StudentDashboard = ({ user = { name: "John Student" }, token }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [testLink, setTestLink] = useState('');
  const [currentTest, setCurrentTest] = useState(null);
  const [testAnswers, setTestAnswers] = useState({});
  const [testResults, setTestResults] = useState([]);
  const [notes, setNotes] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [notices, setNotices] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testStartTime, setTestStartTime] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [lastTestResult, setLastTestResult] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [testPaused, setTestPaused] = useState(false);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [activeTab, token]);

  const loadData = async () => {
    if (!token) {
      setError('No authentication token provided');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      switch (activeTab) {
        case 'dashboard':
          await Promise.all([loadTestResults(), loadNotices()]);
          break;
        case 'results':
          await loadTestResults();
          break;
        case 'notes':
          await loadNotes();
          break;
        case 'blogs':
          await loadBlogs();
          break;
        case 'notices':
          await loadNotices();
          break;
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadTestResults = async () => {
    try {
      const result = await api.tests.getMyResults(token);
      if (result && result.results) {
        setTestResults(result.results);
        // Calculate analytics from results
        calculateAnalytics(result.results);
      } else {
        setTestResults([]);
      }
    } catch (err) {
      console.error('Error loading test results:', err);
      throw new Error('Failed to load test results');
    }
  };

  const calculateAnalytics = (results) => {
    if (!results || results.length === 0) {
      setAnalytics({ average_percentage: 0, highest_percentage: 0 });
      return;
    }

    const percentages = results.map(r => parseFloat(r.percentage || 0));
    const average_percentage = Math.round(percentages.reduce((sum, p) => sum + p, 0) / results.length);
    const highest_percentage = Math.max(...percentages);

    setAnalytics({ average_percentage, highest_percentage });
  };

  const loadNotes = async () => {
    try {
      const result = await api.notes.getAll(token);
      setNotes(result.notes || []);
    } catch (err) {
      console.error('Error loading notes:', err);
      throw new Error('Failed to load study notes');
    }
  };

  const loadBlogs = async () => {
    try {
      const result = await api.blogs.getAll(token);
      setBlogs(result.blogs || []);
    } catch (err) {
      console.error('Error loading blogs:', err);
      throw new Error('Failed to load blogs');
    }
  };

  const loadNotices = async () => {
    try {
      const result = await api.notices.getAll(token);
      setNotices(result.notices || []);
    } catch (err) {
      console.error('Error loading notices:', err);
      throw new Error('Failed to load notices');
    }
  };

  const joinTest = async () => {
    if (!testLink.trim()) {
      setError('Please enter a test link');
      return;
    }
    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await api.tests.getByLink(testLink, token);
      if (result && result.test) {
        setCurrentTest(result.test);
        setTestAnswers({});
        setTestStartTime(Date.now());
        setTestPaused(false);
      } else {
        setError('Test not found or invalid link');
      }
    } catch (err) {
      console.error('Error joining test:', err);
      setError(err.message || 'Failed to join test. Please check the link and try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitTest = async () => {
    if (!currentTest || !token) return;
    
    setLoading(true);
    setError('');
    
    try {
      const timeTaken = Math.floor((Date.now() - testStartTime) / 1000);
      const result = await api.tests.submit(currentTest.id, testAnswers, timeTaken, token);
      
      if (result) {
        // Format the result to match our modal expectations
        const formattedResult = {
          score: result.score || 0,
          total_questions: currentTest.questions.length,
          percentage: result.percentage || Math.round((result.score / currentTest.questions.length) * 100),
          time_taken_seconds: timeTaken,
          submission_id: result.submission_id,
          answers: result.answers || []
        };

        setLastTestResult(formattedResult);
        setShowResults(true);
        setCurrentTest(null);
        setTestAnswers({});
        setTestLink('');
        
        // Reload test results to show the new submission
        await loadTestResults();
      }
    } catch (err) {
      console.error('Error submitting test:', err);
      setError('Failed to submit test: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = useCallback(() => {
    if (currentTest) {
      alert('⏰ Time is up! Submitting your test automatically.');
      submitTest();
    }
  }, [currentTest]);

  const handleAnswerChange = (questionId, answer) => {
    setTestAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const toggleTestPause = () => {
    setTestPaused(!testPaused);
  };

  const likeBlog = async (blogId) => {
    try {
      await api.blogs.like(blogId, token);
      await loadBlogs(); // Reload to show updated like count
    } catch (err) {
      console.error('Error liking blog:', err);
    }
  };

  const markNoticeAsRead = async (noticeId) => {
    try {
      await api.notices.markRead(noticeId, token);
      await loadNotices(); // Reload to show updated read status
    } catch (err) {
      console.error('Error marking notice as read:', err);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Average': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter and sort results
  const filteredAndSortedResults = testResults
    .filter(result => {
      const matchesSearch = result.test_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           result.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = gradeFilter === 'all' || result.grade === gradeFilter;
      return matchesSearch && matchesGrade;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'percentage':
          return (b.percentage || 0) - (a.percentage || 0);
        case 'title':
          return (a.test_title || '').localeCompare(b.test_title || '');
        case 'date':
        default:
          return new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0);
      }
    });

  // Show authentication error if no token
  if (!token) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-bold text-red-800">Authentication Required</h3>
              <p className="text-red-700">Please log in to access the student dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Test Taking Interface
  if (currentTest) {
    const progress = Object.keys(testAnswers).length / currentTest.questions.length * 100;
    const answeredCount = Object.keys(testAnswers).length;
    const totalQuestions = currentTest.questions.length;
    
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Enhanced Test Header */}
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{currentTest.title}</h2>
                <p className="text-blue-100 text-lg mb-4">{currentTest.description}</p>
                <div className="flex items-center space-x-6 text-sm">
                  <span className="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    <TestTube className="h-4 w-4 mr-1" />
                    {totalQuestions} Questions
                  </span>
                  <span className="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    <Clock className="h-4 w-4 mr-1" />
                    {currentTest.duration_minutes} Minutes
                  </span>
                </div>
              </div>
              
              {/* Timer and Controls */}
              <div className="flex flex-col items-end space-y-4">
                <Timer 
                  duration={currentTest.duration_minutes * 60}
                  onTimeUp={handleTimeUp}
                  isActive={true}
                  isPaused={testPaused}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={toggleTestPause}
                    className="flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
                  >
                    {testPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
                    {testPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to exit the test? Your progress will be lost.')) {
                        setCurrentTest(null);
                        setTestAnswers({});
                        setTestPaused(false);
                      }
                    }}
                    className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Exit Test
                  </button>
                </div>
              </div>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span>Progress: {answeredCount} of {totalQuestions} questions answered</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-blue-100">
                <span>Started</span>
                <span>In Progress</span>
                <span>Complete</span>
              </div>
            </div>
          </div>

          {/* Questions Container */}
          <div className="p-8 bg-gray-50 min-h-screen">
            {testPaused && (
              <div className="mb-6 bg-orange-100 border-l-4 border-orange-500 p-4 rounded-r-lg">
                <div className="flex items-center">
                  <Pause className="h-5 w-5 text-orange-600 mr-2" />
                  <p className="text-orange-800 font-medium">Test is paused. Click Resume to continue.</p>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {currentTest.questions.map((question, index) => (
                <div key={question.id} className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-8 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg mr-4 ${
                        testAnswers[question.id] ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800 leading-relaxed">
                          {question.question_text}
                        </h3>
                      </div>
                    </div>
                    
                    {testAnswers[question.id] && (
                      <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Answered
                      </div>
                    )}
                  </div>
                  
                  <div className="grid gap-4 ml-16">
                    {['A', 'B', 'C', 'D'].map(option => (
                      <label 
                        key={option} 
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 ${
                          testAnswers[question.id] === option 
                            ? 'border-blue-500 bg-blue-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question_${question.id}`}
                          value={option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500"
                          disabled={testPaused}
                        />
                        <div className="flex items-center">
                          <span className="bg-gray-100 text-gray-700 font-bold text-sm px-3 py-1 rounded-full mr-3">
                            {option}
                          </span>
                          <span className="text-gray-800 text-lg">
                            {question[`option_${option.toLowerCase()}`]}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Enhanced Submit Section */}
            <div className="mt-12 bg-white rounded-xl shadow-lg p-8 border-2 border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Send className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Ready to Submit?</h3>
                    <p className="text-gray-600">
                      You've answered {answeredCount} out of {totalQuestions} questions
                      {answeredCount < totalQuestions && (
                        <span className="text-orange-600 font-medium">
                          {' '}({totalQuestions - answeredCount} remaining)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to cancel the test? Your progress will be lost.')) {
                        setCurrentTest(null);
                        setTestAnswers({});
                        setTestPaused(false);
                      }
                    }}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Cancel Test
                  </button>
                  <button
                    onClick={submitTest}
                    disabled={loading || Object.keys(testAnswers).length === 0}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center text-lg shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Submit Test
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {answeredCount < totalQuestions && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <p className="text-yellow-800 text-sm">
                      You still have {totalQuestions - answeredCount} unanswered questions. 
                      You can submit now or continue answering.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Enhanced Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Navigation */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user.name}! 👋</h1>
            <p className="text-gray-600 mt-1">Let's continue your learning journey</p>
          </div>
          
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <nav className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'blue' },
            { id: 'test', label: 'Take Test', icon: TestTube, color: 'green' },
            { id: 'results', label: 'My Results', icon: Award, color: 'purple' },
            { id: 'notes', label: 'Study Notes', icon: FileText, color: 'indigo' },
            { id: 'blogs', label: 'Blogs', icon: BookOpen, color: 'pink' },
            { id: 'notices', label: 'Notices', icon: Bell, color: 'orange' }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center px-6 py-4 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id 
                    ? `bg-${tab.color}-600 text-white shadow-lg transform scale-105` 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
                
                {/* Notification badges */}
                {tab.id === 'notices' && notices.filter(n => !n.is_read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {notices.filter(n => !n.is_read).length}
                  </span>
                )}
                {tab.id === 'results' && testResults.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {testResults.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {loading && !refreshing && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your content...</p>
          </div>
        </div>
      )}

      {/* Enhanced Dashboard Overview */}
      {activeTab === 'dashboard' && !loading && (
        <div className="space-y-8">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
              <div className="flex items-center justify-between mb-4">
                <TestTube className="h-12 w-12 text-blue-200" />
                <div className="bg-blue-400 bg-opacity-30 p-2 rounded-lg">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium">Tests Taken</p>
                <p className="text-4xl font-bold">{testResults.length}</p>
                <p className="text-blue-100 text-xs mt-1">Total attempts</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white">
              <div className="flex items-center justify-between mb-4">
                <Award className="h-12 w-12 text-green-200" />
                <div className="bg-green-400 bg-opacity-30 p-2 rounded-lg">
                  <Target className="h-6 w-6" />
                </div>
              </div>
              <div>
                <p className="text-green-100 text-sm font-medium">Average Score</p>
                <p className="text-4xl font-bold">
                  {analytics?.average_percentage || 0}%
                </p>
                <p className="text-green-100 text-xs mt-1">Overall performance</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
              <div className="flex items-center justify-between mb-4">
                <Star className="h-12 w-12 text-purple-200" />
                <div className="bg-purple-400 bg-opacity-30 p-2 rounded-lg">
                  <Award className="h-6 w-6" />
                </div>
              </div>
              <div>
                <p className="text-purple-100 text-sm font-medium">Best Score</p>
                <p className="text-4xl font-bold">
                  {analytics?.highest_percentage || 0}%
                </p>
                <p className="text-purple-100 text-xs mt-1">Personal best!</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg text-white">
              <div className="flex items-center justify-between mb-4">
                <Bell className="h-12 w-12 text-orange-200" />
                <div className="bg-orange-400 bg-opacity-30 p-2 rounded-lg">
                  <AlertCircle className="h-6 w-6" />
                </div>
              </div>
              <div>
                <p className="text-orange-100 text-sm font-medium">New Notices</p>
                <p className="text-4xl font-bold">
                  {notices.filter(n => !n.is_read).length}
                </p>
                <p className="text-orange-100 text-xs mt-1">Requires attention</p>
              </div>
            </div>
          </div>

          {/* Enhanced Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <Award className="h-6 w-6 mr-3 text-blue-600" />
                Recent Test Results
              </h3>
              <div className="space-y-4">
                {testResults.slice(0, 3).map((result) => (
                  <div key={result.submission_id} 
                       className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-all hover:shadow-sm">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                        result.percentage >= 80 ? 'bg-green-100' : result.percentage >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        {result.percentage >= 80 ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : result.percentage >= 60 ? (
                          <AlertCircle className="h-6 w-6 text-yellow-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{result.test_title}</p>
                        <p className="text-sm text-gray-500">by {result.teacher_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full ${getGradeColor(result.grade)}`}>
                        {result.percentage}%
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(result.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {testResults.length === 0 && (
                  <div className="text-center py-8">
                    <TestTube className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No test results yet</p>
                    <p className="text-gray-400 text-sm">Take your first test to see results here</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <Bell className="h-6 w-6 mr-3 text-orange-600" />
                Recent Notices
              </h3>
              <div className="space-y-4">
                {notices.slice(0, 3).map((notice) => (
                  <div key={notice.id} 
                       className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-all hover:shadow-sm"
                       onClick={() => markNoticeAsRead(notice.id)}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          notice.priority === 'urgent' ? 'bg-red-500' :
                          notice.priority === 'high' ? 'bg-orange-500' :
                          notice.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}></div>
                        {notice.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${getPriorityColor(notice.priority)}`}>
                          {notice.priority.toUpperCase()}
                        </span>
                        {!notice.is_read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{notice.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notice.posted_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {notices.length === 0 && (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No notices yet</p>
                    <p className="text-gray-400 text-sm">New announcements will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Take Test */}
      {activeTab === 'test' && !loading && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-br from-green-500 to-blue-600 text-white p-12 text-center">
            <TestTube className="h-24 w-24 mx-auto mb-6 text-green-100" />
            <h2 className="text-4xl font-bold mb-4">Ready to Take a Test? 🎯</h2>
            <p className="text-xl text-green-100">Enter the test link provided by your teacher to begin your assessment</p>
          </div>
          
          <div className="p-12">
            <div className="max-w-lg mx-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Link
                  </label>
                  <input
                    type="text"
                    value={testLink}
                    onChange={(e) => setTestLink(e.target.value)}
                    placeholder="Enter test link (e.g., test-abc123)"
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  />
                </div>
                
                <button
                  onClick={joinTest}
                  disabled={loading || !testLink.trim()}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center shadow-lg transition-all"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                      Loading Test...
                    </>
                  ) : (
                    <>
                      <Play className="h-6 w-6 mr-3" />
                      Start Test
                    </>
                  )}
                </button>
                
                <div className="text-center text-gray-500">
                  <p className="text-sm">Make sure you have a stable internet connection</p>
                  <p className="text-xs mt-1">⏱️ Tests are timed - prepare before starting!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced My Results */}
      {activeTab === 'results' && !loading && (
        <div className="space-y-8">
          {/* Enhanced Filters and Search */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tests or teachers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                  />
                </div>
                
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Grades</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="date">Sort by Date</option>
                  <option value="percentage">Sort by Score</option>
                  <option value="title">Sort by Title</option>
                </select>
                
                <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl font-medium">
                  {filteredAndSortedResults.length} result{filteredAndSortedResults.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Results Display */}
          {filteredAndSortedResults.length > 0 ? (
            <div className="space-y-6">
              {filteredAndSortedResults.map((result) => (
                <div key={result.submission_id} 
                     className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mr-6 ${
                        result.percentage >= 90 ? 'bg-green-100' :
                        result.percentage >= 80 ? 'bg-blue-100' :
                        result.percentage >= 70 ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        {result.percentage >= 90 ? (
                          <Star className="h-8 w-8 text-green-600" />
                        ) : result.percentage >= 80 ? (
                          <Award className="h-8 w-8 text-blue-600" />
                        ) : result.percentage >= 70 ? (
                          <Target className="h-8 w-8 text-yellow-600" />
                        ) : (
                          <TrendingUp className="h-8 w-8 text-red-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-1">{result.test_title}</h3>
                        <p className="text-gray-600 flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          by {result.teacher_name}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(result.submitted_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-800">{result.score}</div>
                          <div className="text-sm text-gray-500">Score</div>
                        </div>
                        <div className="text-4xl text-gray-300">/</div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-800">{result.total_questions}</div>
                          <div className="text-sm text-gray-500">Total</div>
                        </div>
                      </div>
                      
                      <span className={`inline-flex px-6 py-2 text-lg font-bold rounded-full ${getGradeColor(result.grade)}`}>
                        {result.percentage}% • {result.grade}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">Performance</span>
                      <span className="text-sm text-gray-500">{result.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          result.percentage >= 90 ? 'bg-green-500' :
                          result.percentage >= 80 ? 'bg-blue-500' :
                          result.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${result.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      onClick={async () => {
                        try {
                          const detailedResult = await api.tests.getResultDetails(result.submission_id, token);
                          console.log('Detailed result:', detailedResult);
                          // You can show this in a modal or navigate to a detailed view
                        } catch (err) {
                          console.error('Error fetching detailed result:', err);
                          setError('Failed to load detailed results');
                        }
                      }}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-16 text-center border border-gray-100">
              <Award className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Test Results Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'No results match your search criteria.' : 'You haven\'t taken any tests yet.'}
              </p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('test')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Take Your First Test
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Study Notes */}
      {activeTab === 'notes' && !loading && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8">
              <h2 className="text-3xl font-bold mb-2 flex items-center">
                <FileText className="h-8 w-8 mr-3" />
                Study Notes 📚
              </h2>
              <p className="text-indigo-100 text-lg">Access comprehensive study materials and resources</p>
            </div>
            
            <div className="p-8">
              {notes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-blue-200 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-indigo-100 p-3 rounded-xl group-hover:bg-indigo-200 transition-colors">
                          <FileText className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full flex items-center">
                            <Download className="h-3 w-3 mr-1" />
                            {note.downloads || 0}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors">
                        {note.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {note.description}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-500">
                            <User className="h-4 w-4 mr-1" />
                            {note.uploaded_by_name}
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(note.uploaded_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {note.has_file && (
                          <button className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download Note
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <FileText className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">No Study Notes Available</h3>
                  <p className="text-gray-600">Check back later for new study materials from your teachers</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Blogs */}
      {activeTab === 'blogs' && !loading && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white p-8">
              <h2 className="text-3xl font-bold mb-2 flex items-center">
                <BookOpen className="h-8 w-8 mr-3" />
                Educational Blogs ✍️
              </h2>
              <p className="text-pink-100 text-lg">Discover insights, tips, and knowledge from educators</p>
            </div>
            
            <div className="p-8">
              {blogs.length > 0 ? (
                <div className="space-y-8">
                  {blogs.map((blog) => (
                    <article key={blog.id} className="bg-white border-2 border-gray-100 rounded-2xl p-8 hover:shadow-lg hover:border-pink-200 transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-800 mb-3 hover:text-pink-600 transition-colors cursor-pointer">
                            {blog.title}
                          </h3>
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {blog.author_name}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(blog.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                              <Clock className="h-4 w-4 mr-1" />
                              {blog.read_time}
                            </span>
                          </div>
                        </div>
                        <button className="bg-pink-100 text-pink-600 p-2 rounded-lg hover:bg-pink-200 transition-colors">
                          <BookmarkPlus className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                        {blog.content}
                      </p>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <div className="flex items-center space-x-6">
                          <button
                            onClick={() => likeBlog(blog.id)}
                            className="flex items-center text-gray-600 hover:text-red-600 transition-colors group"
                          >
                            <Heart className="h-5 w-5 mr-2 group-hover:fill-current" />
                            <span className="font-medium">{blog.likes_count || 0}</span>
                          </button>
                          <span className="flex items-center text-gray-600">
                            <MessageCircle className="h-5 w-5 mr-2" />
                            <span className="font-medium">{blog.comments_count || 0}</span>
                          </span>
                          <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                            <Share2 className="h-5 w-5 mr-2" />
                            Share
                          </button>
                        </div>
                        
                        <button className="bg-pink-600 text-white px-6 py-3 rounded-xl hover:bg-pink-700 transition-colors font-medium flex items-center">
                          Read Full Article
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">No Blogs Available</h3>
                  <p className="text-gray-600">Educational blogs and articles will appear here when published</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Notices */}
      {activeTab === 'notices' && !loading && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-8">
              <h2 className="text-3xl font-bold mb-2 flex items-center">
                <Bell className="h-8 w-8 mr-3" />
                Important Notices 📢
              </h2>
              <p className="text-orange-100 text-lg">Stay updated with announcements and important information</p>
            </div>
            
            <div className="p-8">
              {notices.length > 0 ? (
                <div className="space-y-6">
                  {notices.map((notice) => (
                    <div key={notice.id} 
                         className="bg-white border-2 border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-all cursor-pointer"
                         onClick={() => markNoticeAsRead(notice.id)}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center flex-1">
                          <div className={`p-3 rounded-xl mr-4 ${
                            notice.priority === 'urgent' ? 'bg-red-100' :
                            notice.priority === 'high' ? 'bg-orange-100' :
                            notice.priority === 'medium' ? 'bg-yellow-100' : 'bg-gray-100'
                          }`}>
                            {notice.priority === 'urgent' ? (
                              <AlertCircle className="h-8 w-8 text-red-600" />
                            ) : notice.priority === 'high' ? (
                              <Bell className="h-8 w-8 text-orange-600" />
                            ) : (
                              <Bell className="h-8 w-8 text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{notice.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {notice.author_name}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(notice.posted_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className={`px-4 py-2 text-xs font-bold rounded-full ${getPriorityColor(notice.priority)}`}>
                            {notice.priority.toUpperCase()}
                          </span>
                          {!notice.is_read && (
                            <span className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 leading-relaxed text-lg mb-4">
                        {notice.content}
                      </p>
                      
                      {!notice.is_read && (
                        <div className="flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markNoticeAsRead(notice.id);
                            }}
                            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
                          >
                            Mark as Read
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Bell className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">No Notices Available</h3>
                  <p className="text-gray-600">Important announcements and notices will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Test Results Modal */}
      <TestResultsModal 
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        results={lastTestResult}
        testDetails={currentTest}
      />
    </div>
  );
};

export default StudentDashboard;