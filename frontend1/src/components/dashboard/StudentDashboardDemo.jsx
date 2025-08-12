import React, { useState, useEffect, useCallback } from 'react';
import { 
  TestTube, Award, Bell, Home, FileText, BookOpen, Download, 
  Heart, MessageCircle, Clock, AlertCircle, CheckCircle, XCircle,
  Eye, User, Calendar, TrendingUp, Star
} from 'lucide-react';

// Mock API - replace with actual API calls
const mockApi = {
  tests: {
    getByLink: async (link) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        test: {
          id: 1,
          title: "JavaScript Fundamentals Quiz",
          description: "Test your knowledge of JavaScript basics",
          duration_minutes: 30,
          questions: [
            {
              id: 1,
              question_text: "What is the correct way to declare a variable in JavaScript?",
              option_a: "var myVar = 5;",
              option_b: "variable myVar = 5;",
              option_c: "v myVar = 5;",
              option_d: "declare myVar = 5;",
              correct_option: "A"
            },
            {
              id: 2,
              question_text: "Which method is used to add an element to the end of an array?",
              option_a: "push()",
              option_b: "pop()",
              option_c: "shift()",
              option_d: "unshift()",
              correct_option: "A"
            },
            {
              id: 3,
              question_text: "What does 'DOM' stand for?",
              option_a: "Document Object Model",
              option_b: "Data Object Management",
              option_c: "Dynamic Object Manipulation",
              option_d: "Document Oriented Markup",
              correct_option: "A"
            }
          ]
        }
      };
    },
    submit: async (testId, answers, timeTaken) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const correctAnswers = { 1: "A", 2: "A", 3: "A" };
      let score = 0;
      const results = {};
      
      Object.keys(answers).forEach(qId => {
        const isCorrect = answers[qId] === correctAnswers[qId];
        if (isCorrect) score++;
        results[qId] = {
          selected: answers[qId],
          correct: correctAnswers[qId],
          isCorrect
        };
      });
      
      return { 
        score, 
        total: 3,
        percentage: Math.round((score / 3) * 100),
        results,
        timeTaken
      };
    },
    getMyResults: async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        results: [
          {
            submission_id: 1,
            test_title: "JavaScript Fundamentals Quiz",
            teacher_name: "John Doe",
            score: 8,
            total_questions: 10,
            percentage: 80,
            grade: "Good",
            submitted_at: "2024-01-15T10:30:00Z"
          },
          {
            submission_id: 2,
            test_title: "React Basics Test",
            teacher_name: "Jane Smith",
            score: 9,
            total_questions: 10,
            percentage: 90,
            grade: "Excellent",
            submitted_at: "2024-01-12T14:20:00Z"
          }
        ]
      };
    }
  },
  notes: {
    getAll: async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return {
        notes: [
          {
            id: 1,
            title: "JavaScript ES6 Features",
            description: "Comprehensive guide to modern JavaScript features",
            uploaded_by_name: "Dr. Smith",
            uploaded_at: "2024-01-10T09:00:00Z",
            has_file: true,
            downloads: 245
          },
          {
            id: 2,
            title: "React Hooks Tutorial",
            description: "Learn useState, useEffect and custom hooks",
            uploaded_by_name: "Prof. Johnson",
            uploaded_at: "2024-01-08T15:30:00Z",
            has_file: true,
            downloads: 189
          }
        ]
      };
    }
  },
  blogs: {
    getAll: async () => {
      await new Promise(resolve => setTimeout(resolve, 700));
      return {
        blogs: [
          {
            id: 1,
            title: "The Future of Web Development",
            content: "Web development is evolving rapidly with new frameworks and technologies...",
            author_name: "Alex Wilson",
            created_at: "2024-01-14T12:00:00Z",
            likes_count: 24,
            comments_count: 8,
            read_time: "5 min"
          },
          {
            id: 2,
            title: "Learning JavaScript in 2024",
            content: "JavaScript continues to be one of the most important programming languages...",
            author_name: "Sarah Davis",
            created_at: "2024-01-12T16:45:00Z",
            likes_count: 31,
            comments_count: 12,
            read_time: "8 min"
          }
        ]
      };
    },
    like: async (blogId) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    }
  },
  notices: {
    getAll: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        notices: [
          {
            id: 1,
            title: "Semester Exam Schedule Released",
            content: "The final semester examination schedule has been published. Please check your respective subjects and timing.",
            author_name: "Admin",
            priority: "urgent",
            posted_at: "2024-01-15T08:00:00Z",
            is_read: false
          },
          {
            id: 2,
            title: "New Library Hours",
            content: "Starting next week, the library will be open from 8 AM to 10 PM on weekdays.",
            author_name: "Librarian",
            priority: "medium",
            posted_at: "2024-01-13T11:30:00Z",
            is_read: true
          }
        ]
      };
    }
  }
};

// Timer Component
const Timer = ({ duration, onTimeUp, isActive, onTick }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isActive) return;

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
  }, [isActive, onTimeUp, onTick]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft <= 300; // 5 minutes
  const isCriticalTime = timeLeft <= 60; // 1 minute

  return (
    <div className={`flex items-center px-4 py-2 rounded-lg font-mono text-lg font-bold ${
      isCriticalTime ? 'bg-red-100 text-red-700 animate-pulse' :
      isLowTime ? 'bg-yellow-100 text-yellow-700' :
      'bg-green-100 text-green-700'
    }`}>
      <Clock className="h-5 w-5 mr-2" />
      {formatTime(timeLeft)}
    </div>
  );
};

// Test Results Modal
const TestResultsModal = ({ isOpen, onClose, results }) => {
  if (!isOpen || !results) return null;

  const { score, total, percentage, results: questionResults, timeTaken } = results;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Test Results</h2>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{score}/{total}</div>
              <div className="text-sm opacity-90">Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{percentage}%</div>
              <div className="text-sm opacity-90">Percentage</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{Math.floor(timeTaken / 60)}m {timeTaken % 60}s</div>
              <div className="text-sm opacity-90">Time Taken</div>
            </div>
          </div>
        </div>
        
        <div className="p-6 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Question Review</h3>
          {Object.entries(questionResults).map(([qId, result]) => (
            <div key={qId} className="mb-4 p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                {result.isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                )}
                <span className="font-medium">Question {qId}</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <strong>Your answer:</strong> Option {result.selected}
                {!result.isCorrect && (
                  <span className="block">
                    <strong>Correct answer:</strong> Option {result.correct}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const StudentDashboard = ({ user = { name: "John Student" }, token = "mock-token" }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [testLink, setTestLink] = useState('');
  const [currentTest, setCurrentTest] = useState(null);
  const [testAnswers, setTestAnswers] = useState({});
  const [testResults, setTestResults] = useState([]);
  const [notes, setNotes] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testStartTime, setTestStartTime] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [lastTestResult, setLastTestResult] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
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
  };

  const loadTestResults = async () => {
    try {
      const result = await mockApi.tests.getMyResults();
      setTestResults(result.results || []);
    } catch (err) {
      console.error('Error loading results:', err);
    }
  };

  const loadNotes = async () => {
    try {
      const result = await mockApi.notes.getAll();
      setNotes(result.notes || []);
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  };

  const loadBlogs = async () => {
    try {
      const result = await mockApi.blogs.getAll();
      setBlogs(result.blogs || []);
    } catch (err) {
      console.error('Error loading blogs:', err);
    }
  };

  const loadNotices = async () => {
    try {
      const result = await mockApi.notices.getAll();
      setNotices(result.notices || []);
    } catch (err) {
      console.error('Error loading notices:', err);
    }
  };

  const joinTest = async () => {
    if (!testLink.trim()) return;
    setLoading(true);
    try {
      const result = await mockApi.tests.getByLink(testLink);
      if (result.test) {
        setCurrentTest(result.test);
        setTestAnswers({});
        setTestStartTime(Date.now());
      }
    } catch (err) {
      alert('Test not found or error occurred');
    } finally {
      setLoading(false);
    }
  };

  const submitTest = async () => {
    if (!currentTest) return;
    setLoading(true);
    try {
      const timeTaken = Math.floor((Date.now() - testStartTime) / 1000);
      const result = await mockApi.tests.submit(currentTest.id, testAnswers, timeTaken);
      
      setLastTestResult(result);
      setShowResults(true);
      setCurrentTest(null);
      setTestAnswers({});
      setTestLink('');
      await loadTestResults();
    } catch (err) {
      alert('Error submitting test');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = useCallback(() => {
    if (currentTest) {
      alert('Time is up! Submitting your test automatically.');
      submitTest();
    }
  }, [currentTest]);

  const handleAnswerChange = (questionId, answer) => {
    setTestAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const likeBlog = async (blogId) => {
    try {
      await mockApi.blogs.like(blogId);
      await loadBlogs();
    } catch (err) {
      console.error('Error liking blog:', err);
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

  // Test Taking Interface
  if (currentTest) {
    const progress = Object.keys(testAnswers).length / currentTest.questions.length * 100;
    
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Test Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">{currentTest.title}</h2>
                <p className="opacity-90">{currentTest.description}</p>
              </div>
              <Timer 
                duration={currentTest.duration_minutes * 60}
                onTimeUp={handleTimeUp}
                isActive={true}
              />
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-blue-700 bg-opacity-30 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm mt-2 opacity-90">
              {Object.keys(testAnswers).length} of {currentTest.questions.length} questions answered
            </p>
          </div>

          {/* Questions */}
          <div className="p-6">
            <div className="space-y-8">
              {currentTest.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start mb-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold mr-3 mt-1">
                      {index + 1}
                    </span>
                    <h3 className="font-medium text-lg flex-1">
                      {question.question_text}
                    </h3>
                    {testAnswers[question.id] && (
                      <CheckCircle className="h-5 w-5 text-green-600 ml-2 mt-1" />
                    )}
                  </div>
                  
                  <div className="grid gap-3 ml-12">
                    {['A', 'B', 'C', 'D'].map(option => (
                      <label 
                        key={option} 
                        className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          testAnswers[question.id] === option ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question_${question.id}`}
                          value={option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-700 mr-2">{option}.</span>
                        <span className="text-gray-800">
                          {question[`option_${option.toLowerCase()}`]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Submit Section */}
            <div className="mt-8 flex justify-between items-center p-6 bg-gray-50 rounded-lg">
              <button
                onClick={() => setCurrentTest(null)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel Test
              </button>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {Object.keys(testAnswers).length}/{currentTest.questions.length} answered
                </span>
                <button
                  onClick={submitTest}
                  disabled={loading || Object.keys(testAnswers).length === 0}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Test'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <TestResultsModal 
          isOpen={showResults}
          onClose={() => setShowResults(false)}
          results={lastTestResult}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'test', label: 'Take Test', icon: TestTube },
            { id: 'results', label: 'My Results', icon: Award },
            { id: 'notes', label: 'Study Notes', icon: FileText },
            { id: 'blogs', label: 'Blogs', icon: BookOpen },
            { id: 'notices', label: 'Notices', icon: Bell }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
                {tab.id === 'notices' && notices.some(n => !n.is_read) && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notices.filter(n => !n.is_read).length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Dashboard Overview */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm">
              <div className="flex items-center">
                <TestTube className="h-10 w-10 text-blue-600 mr-4" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Tests Taken</p>
                  <p className="text-3xl font-bold text-blue-800">{testResults.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm">
              <div className="flex items-center">
                <Award className="h-10 w-10 text-green-600 mr-4" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Average Score</p>
                  <p className="text-3xl font-bold text-green-800">
                    {testResults.length > 0 
                      ? Math.round(testResults.reduce((sum, r) => sum + parseFloat(r.percentage || 0), 0) / testResults.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm">
              <div className="flex items-center">
                <TrendingUp className="h-10 w-10 text-purple-600 mr-4" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Best Score</p>
                  <p className="text-3xl font-bold text-purple-800">
                    {testResults.length > 0 
                      ? Math.max(...testResults.map(r => r.percentage))
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-sm">
              <div className="flex items-center">
                <Bell className="h-10 w-10 text-orange-600 mr-4" />
                <div>
                  <p className="text-sm text-orange-600 font-medium">New Notices</p>
                  <p className="text-3xl font-bold text-orange-800">
                    {notices.filter(n => !n.is_read).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-blue-600" />
                Recent Test Results
              </h3>
              <div className="space-y-3">
                {testResults.slice(0, 3).map((result) => (
                  <div key={result.submission_id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{result.test_title}</p>
                      <p className="text-sm text-gray-500">by {result.teacher_name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(result.grade)}`}>
                        {result.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-orange-600" />
                Recent Notices
              </h3>
              <div className="space-y-3">
                {notices.slice(0, 3).map((notice) => (
                  <div key={notice.id} className="p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800">{notice.title}</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(notice.priority)}`}>
                        {notice.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{notice.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Take Test */}
      {activeTab === 'test' && (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center mb-8">
            <TestTube className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Take a Test</h2>
            <p className="text-gray-600">Enter the test link provided by your teacher to begin</p>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                value={testLink}
                onChange={(e) => setTestLink(e.target.value)}
                placeholder="Enter test link (e.g., test-abc123)"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={joinTest}
                disabled={loading || !testLink.trim()}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Loading Test...
                  </>
                ) : (
                  'Start Test'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Results */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Award className="h-6 w-6 mr-2 text-blue-600" />
              My Test Results
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testResults.map((result) => (
                  <tr key={result.submission_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{result.test_title}</div>
                        <div className="text-sm text-gray-500">by {result.teacher_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-semibold">{result.score}</span>/{result.total_questions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-semibold text-blue-600">{result.percentage}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getGradeColor(result.grade)}`}>
                        {result.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(result.submitted_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Study Notes */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-blue-600" />
              Study Notes
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <div key={note.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {note.downloads} downloads
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{note.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{note.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {note.uploaded_by_name}
                      </div>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(note.uploaded_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {note.has_file && (
                      <button className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Blogs */}
      {activeTab === 'blogs' && (
        <div className="space-y-6">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{blog.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {blog.author_name}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(blog.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {blog.read_time} read
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">{blog.content}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => likeBlog(blog.id)}
                    className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    {blog.likes_count || 0} likes
                  </button>
                  <span className="flex items-center text-sm text-gray-600">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {blog.comments_count || 0} comments
                  </span>
                </div>
                
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notices */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-3 ${
                    notice.priority === 'urgent' ? 'bg-red-100' :
                    notice.priority === 'high' ? 'bg-orange-100' :
                    notice.priority === 'medium' ? 'bg-yellow-100' :
                    'bg-gray-100'
                  }`}>
                    {notice.priority === 'urgent' ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <Bell className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{notice.title}</h3>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(notice.priority)}`}>
                    {notice.priority.toUpperCase()}
                  </span>
                  {!notice.is_read && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 leading-relaxed">{notice.content}</p>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
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
          ))}
        </div>
      )}

      {/* Test Results Modal */}
      <TestResultsModal 
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        results={lastTestResult}
      />
    </div>
  );
};

export default StudentDashboard;