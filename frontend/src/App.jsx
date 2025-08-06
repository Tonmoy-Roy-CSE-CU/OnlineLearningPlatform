import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, LogOut, Plus, Edit, Trash2, Eye, Download, Search, Users, BookOpen, FileText, Bell, BarChart3, Settings, Home, TestTube, Upload, Send, Heart, MessageCircle, Calendar, Clock, Award } from 'lucide-react';

// API Configuration
const API_BASE = 'http://localhost:5000/api';

// Auth Context
const AuthContext = createContext();

// API Helper Functions
const api = {
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return res.json();
    },
    register: async (userData) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return res.json();
    }
  },
  tests: {
    create: async (testData, token) => {
      const res = await fetch(`${API_BASE}/tests/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testData)
      });
      return res.json();
    },
    getByLink: async (link, token) => {
      const res = await fetch(`${API_BASE}/tests/${link}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    submit: async (testId, answers, timeTaken, token) => {
      const res = await fetch(`${API_BASE}/tests/${testId}/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers, time_taken_seconds: timeTaken })
      });
      return res.json();
    },
    getMyTests: async (token) => {
      const res = await fetch(`${API_BASE}/tests/my/tests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    getMyResults: async (token) => {
      const res = await fetch(`${API_BASE}/tests/my/results`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    getAnalytics: async (token) => {
      const res = await fetch(`${API_BASE}/tests/my/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    }
  },
  notes: {
    getAll: async (token) => {
      const res = await fetch(`${API_BASE}/notes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    upload: async (formData, token) => {
      const res = await fetch(`${API_BASE}/notes/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      return res.json();
    },
    delete: async (id, token) => {
      const res = await fetch(`${API_BASE}/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    }
  },
  blogs: {
    getAll: async (token) => {
      const res = await fetch(`${API_BASE}/blogs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    create: async (formData, token) => {
      const res = await fetch(`${API_BASE}/blogs/create`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      return res.json();
    },
    like: async (id, token) => {
      const res = await fetch(`${API_BASE}/blogs/${id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    addComment: async (id, content, token) => {
      const res = await fetch(`${API_BASE}/blogs/${id}/comments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      return res.json();
    }
  },
  notices: {
    getAll: async (token) => {
      const res = await fetch(`${API_BASE}/notices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    create: async (noticeData, token) => {
      const res = await fetch(`${API_BASE}/notices/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(noticeData)
      });
      return res.json();
    },
    markRead: async (id, token) => {
      const res = await fetch(`${API_BASE}/notices/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    }
  },
  admin: {
    getStats: async (token) => {
      const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    getUsers: async (token) => {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    updateUserStatus: async (userId, status, token) => {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      return res.json();
    },
    deleteUser: async (userId, token) => {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    }
  }
};

// Login Component
const Login = ({ onLogin, switchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await api.auth.login(email, password);
      if (result.token) {
        onLogin(result.token, result.user);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to OLPM
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={switchToRegister}
              className="text-blue-600 hover:text-blue-500"
            >
              Don't have an account? Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Register Component
const Register = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const result = await api.auth.register(formData);
      if (result.message && result.message.includes('successfully')) {
        setMessage('Registration successful! Please login.');
        setTimeout(() => switchToLogin(), 2000);
      } else {
        setMessage(result.message || 'Registration failed');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register for OLPM
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && (
            <div className={`border px-4 py-3 rounded ${message.includes('successful') ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'}`}>
              {message}
            </div>
          )}
          <div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Full Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={switchToLogin}
              className="text-blue-600 hover:text-blue-500"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Header Component
const Header = ({ user, onLogout }) => (
  <header className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-4">
        <div className="flex items-center">
          <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-xl font-bold text-gray-900">OLPM</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-700">{user.name}</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {user.role}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
);

// Student Dashboard
const StudentDashboard = ({ user, token }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [testLink, setTestLink] = useState('');
  const [currentTest, setCurrentTest] = useState(null);
  const [testAnswers, setTestAnswers] = useState({});
  const [testResults, setTestResults] = useState([]);
  const [notes, setNotes] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'results') {
      loadTestResults();
    } else if (activeTab === 'notes') {
      loadNotes();
    } else if (activeTab === 'blogs') {
      loadBlogs();
    } else if (activeTab === 'notices') {
      loadNotices();
    }
  }, [activeTab]);

  const loadTestResults = async () => {
    try {
      const result = await api.tests.getMyResults(token);
      setTestResults(result.results || []);
    } catch (err) {
      console.error('Error loading results:', err);
    }
  };

  const loadNotes = async () => {
    try {
      const result = await api.notes.getAll(token);
      setNotes(result.notes || []);
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  };

  const loadBlogs = async () => {
    try {
      const result = await api.blogs.getAll(token);
      setBlogs(result.blogs || []);
    } catch (err) {
      console.error('Error loading blogs:', err);
    }
  };

  const loadNotices = async () => {
    try {
      const result = await api.notices.getAll(token);
      setNotices(result.notices || []);
    } catch (err) {
      console.error('Error loading notices:', err);
    }
  };

  const joinTest = async () => {
    if (!testLink.trim()) return;
    setLoading(true);
    try {
      const result = await api.tests.getByLink(testLink, token);
      if (result.test) {
        setCurrentTest(result.test);
        setTestAnswers({});
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
      const result = await api.tests.submit(currentTest.id, testAnswers, 600, token);
      alert(`Test submitted! Score: ${result.score}/${currentTest.questions.length}`);
      setCurrentTest(null);
      setTestAnswers({});
      setTestLink('');
    } catch (err) {
      alert('Error submitting test');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setTestAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const likeBlog = async (blogId) => {
    try {
      await api.blogs.like(blogId, token);
      loadBlogs(); // Refresh blogs
    } catch (err) {
      console.error('Error liking blog:', err);
    }
  };

  if (currentTest) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">{currentTest.title}</h2>
          <div className="mb-6">
            <p className="text-gray-600">Duration: {currentTest.duration_minutes} minutes</p>
            <p className="text-gray-600">Questions: {currentTest.questions.length}</p>
          </div>
          
          <div className="space-y-6">
            {currentTest.questions.map((question, index) => (
              <div key={question.id} className="border-b pb-4">
                <h3 className="font-medium mb-3">
                  {index + 1}. {question.question_text}
                </h3>
                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map(option => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name={`question_${question.id}`}
                        value={option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="mr-2"
                      />
                      <span>
                        {option}. {question[`option_${option.toLowerCase()}`]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setCurrentTest(null)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={submitTest}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'test', label: 'Take Test', icon: TestTube },
            { id: 'results', label: 'My Results', icon: Award },
            { id: 'notes', label: 'Notes', icon: FileText },
            { id: 'blogs', label: 'Blogs', icon: BookOpen },
            { id: 'notices', label: 'Notices', icon: Bell }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TestTube className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Tests Taken</p>
                <p className="text-2xl font-bold">{testResults.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold">
                  {testResults.length > 0 
                    ? Math.round(testResults.reduce((sum, r) => sum + parseFloat(r.percentage || 0), 0) / testResults.length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">New Notices</p>
                <p className="text-2xl font-bold">{notices.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'test' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Join Test</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={testLink}
              onChange={(e) => setTestLink(e.target.value)}
              placeholder="Enter test link (e.g., test-abc123)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={joinTest}
              disabled={loading || !testLink.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Join Test'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">My Test Results</h2>
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
                  <tr key={result.submission_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{result.test_title}</div>
                        <div className="text-sm text-gray-500">by {result.teacher_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.score}/{result.total_questions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.percentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        result.grade === 'Excellent' ? 'bg-green-100 text-green-800' :
                        result.grade === 'Good' ? 'bg-blue-100 text-blue-800' :
                        result.grade === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
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

      {activeTab === 'notes' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Study Notes</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <div key={note.id} className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">{note.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{note.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      by {note.uploaded_by_name}
                    </span>
                    {note.has_file && (
                      <a
                        href={`${API_BASE}/notes/${note.id}/download`}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'blogs' && (
        <div className="space-y-6">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
                  <p className="text-sm text-gray-600">
                    by {blog.author_name} • {new Date(blog.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{blog.content}</p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => likeBlog(blog.id)}
                  className="flex items-center text-sm text-gray-600 hover:text-red-600"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  {blog.likes_count || 0}
                </button>
                <span className="flex items-center text-sm text-gray-600">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {blog.comments_count || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'notices' && (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold">{notice.title}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  notice.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  notice.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  notice.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {notice.priority}
                </span>
              </div>
              <p className="text-gray-700 mb-3">{notice.content}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>by {notice.author_name}</span>
                <span>{new Date(notice.posted_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Teacher Dashboard
const TeacherDashboard = ({ user, token }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [myTests, setMyTests] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [notes, setNotes] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [notices, setNotices] = useState([]);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [testForm, setTestForm] = useState({
    title: '',
    description: '',
    duration_minutes: 30,
    questions: [{ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }]
  });
  const [noteForm, setNoteForm] = useState({ title: '', description: '', file: null });
  const [blogForm, setBlogForm] = useState({ title: '', content: '', file: null });
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    priority: 'medium',
    target_audience: 'all'
  });

  useEffect(() => {
    if (activeTab === 'tests') {
      loadMyTests();
    } else if (activeTab === 'analytics') {
      loadAnalytics();
    } else if (activeTab === 'notes') {
      loadNotes();
    } else if (activeTab === 'blogs') {
      loadBlogs();
    } else if (activeTab === 'notices') {
      loadNotices();
    }
  }, [activeTab]);

  const loadMyTests = async () => {
    try {
      const result = await api.tests.getMyTests(token);
      setMyTests(result.tests || []);
    } catch (err) {
      console.error('Error loading tests:', err);
    }
  };

  const loadAnalytics = async () => {
    try {
      const result = await api.tests.getAnalytics(token);
      setAnalytics(result);
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

  const loadNotes = async () => {
    try {
      const result = await api.notes.getAll(token);
      setNotes(result.notes || []);
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  };

  const loadBlogs = async () => {
    try {
      const result = await api.blogs.getAll(token);
      setBlogs(result.blogs || []);
    } catch (err) {
      console.error('Error loading blogs:', err);
    }
  };

  const loadNotices = async () => {
    try {
      const result = await api.notices.getAll(token);
      setNotices(result.notices || []);
    } catch (err) {
      console.error('Error loading notices:', err);
    }
  };

  const createTest = async () => {
    setLoading(true);
    try {
      const result = await api.tests.create(testForm, token);
      if (result.message && result.message.includes('successfully')) {
        alert('Test created successfully!');
        setShowTestForm(false);
        setTestForm({
          title: '',
          description: '',
          duration_minutes: 30,
          questions: [{ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }]
        });
        loadMyTests();
      }
    } catch (err) {
      alert('Error creating test');
    } finally {
      setLoading(false);
    }
  };

  const uploadNote = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', noteForm.title);
      formData.append('description', noteForm.description);
      if (noteForm.file) {
        formData.append('file', noteForm.file);
      }
      
      const result = await api.notes.upload(formData, token);
      if (result.message && result.message.includes('successfully')) {
        alert('Note uploaded successfully!');
        setShowNoteForm(false);
        setNoteForm({ title: '', description: '', file: null });
        loadNotes();
      }
    } catch (err) {
      alert('Error uploading note');
    } finally {
      setLoading(false);
    }
  };

  const createBlog = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', blogForm.title);
      formData.append('content', blogForm.content);
      if (blogForm.file) {
        formData.append('file', blogForm.file);
      }
      
      const result = await api.blogs.create(formData, token);
      if (result.message && result.message.includes('successfully')) {
        alert('Blog created successfully!');
        setShowBlogForm(false);
        setBlogForm({ title: '', content: '', file: null });
        loadBlogs();
      }
    } catch (err) {
      alert('Error creating blog');
    } finally {
      setLoading(false);
    }
  };

  const createNotice = async () => {
    setLoading(true);
    try {
      const result = await api.notices.create(noticeForm, token);
      if (result.message && result.message.includes('successfully')) {
        alert('Notice created successfully!');
        setShowNoticeForm(false);
        setNoticeForm({
          title: '',
          content: '',
          priority: 'medium',
          target_audience: 'all'
        });
        loadNotices();
      }
    } catch (err) {
      alert('Error creating notice');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setTestForm({
      ...testForm,
      questions: [...testForm.questions, { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }]
    });
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = testForm.questions.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    );
    setTestForm({ ...testForm, questions: updatedQuestions });
  };

  const removeQuestion = (index) => {
    if (testForm.questions.length > 1) {
      const updatedQuestions = testForm.questions.filter((_, i) => i !== index);
      setTestForm({ ...testForm, questions: updatedQuestions });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'tests', label: 'My Tests', icon: TestTube },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'notes', label: 'Notes', icon: FileText },
            { id: 'blogs', label: 'Blogs', icon: BookOpen },
            { id: 'notices', label: 'Notices', icon: Bell }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TestTube className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Tests Created</p>
                <p className="text-2xl font-bold">{myTests.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold">
                  {myTests.reduce((sum, test) => sum + (test.submission_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Notes Uploaded</p>
                <p className="text-2xl font-bold">{notes.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Blogs Written</p>
                <p className="text-2xl font-bold">{blogs.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Tests</h2>
            <button
              onClick={() => setShowTestForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Test
            </button>
          </div>

          {showTestForm && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Create New Test</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={testForm.title}
                    onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={testForm.description}
                    onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={testForm.duration_minutes}
                    onChange={(e) => setTestForm({ ...testForm, duration_minutes: parseInt(e.target.value) })}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <h4 className="text-md font-medium mb-3">Questions</h4>
                  {testForm.questions.map((question, index) => (
                    <div key={index} className="border rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-medium">Question {index + 1}</h5>
                        {testForm.questions.length > 1 && (
                          <button
                            onClick={() => removeQuestion(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Question text"
                          value={question.question_text}
                          onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Option A"
                            value={question.option_a}
                            onChange={(e) => updateQuestion(index, 'option_a', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="Option B"
                            value={question.option_b}
                            onChange={(e) => updateQuestion(index, 'option_b', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="Option C"
                            value={question.option_c}
                            onChange={(e) => updateQuestion(index, 'option_c', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="Option D"
                            value={question.option_d}
                            onChange={(e) => updateQuestion(index, 'option_d', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                          <select
                            value={question.correct_option}
                            onChange={(e) => updateQuestion(index, 'correct_option', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addQuestion}
                    className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Question
                  </button>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowTestForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createTest}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Test'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myTests.map((test) => (
                    <tr key={test.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{test.title}</div>
                          <div className="text-sm text-gray-500">{test.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {test.question_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {test.submission_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <code className="bg-gray-100 px-2 py-1 rounded">{test.test_link}</code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(test.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">Overall Performance</h3>
              <p className="text-3xl font-bold text-blue-600">
                {analytics.overall_stats?.average_percentage || 0}%
              </p>
              <p className="text-sm text-gray-600">Average Score</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">Total Submissions</h3>
              <p className="text-3xl font-bold text-green-600">
                {analytics.overall_stats?.total_submissions || 0}
              </p>
              <p className="text-sm text-gray-600">Across all tests</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">Unique Students</h3>
              <p className="text-3xl font-bold text-purple-600">
                {analytics.overall_stats?.unique_students || 0}
              </p>
              <p className="text-sm text-gray-600">Have taken tests</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Notes</h2>
            <button
              onClick={() => setShowNoteForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Note
            </button>
          </div>

          {showNoteForm && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Upload New Note</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={noteForm.title}
                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={noteForm.description}
                    onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                  <input
                    type="file"
                    onChange={(e) => setNoteForm({ ...noteForm, file: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowNoteForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={uploadNote}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div key={note.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-2">{note.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{note.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(note.uploaded_at).toLocaleDateString()}
                  </span>
                  {note.has_file && (
                    <a
                      href={`${API_BASE}/notes/${note.id}/download`}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'blogs' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Blogs</h2>
            <button
              onClick={() => setShowBlogForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Blog
            </button>
          </div>

          {showBlogForm && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Create New Blog</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={blogForm.title}
                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={blogForm.content}
                    onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="6"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (optional)</label>
                  <input
                    type="file"
                    onChange={(e) => setBlogForm({ ...blogForm, file: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowBlogForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createBlog}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Blog'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {blogs.map((blog) => (
              <div key={blog.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
                    <p className="text-sm text-gray-600">
                      by {blog.author_name} • {new Date(blog.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{blog.content}</p>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center text-sm text-gray-600">
                    <Heart className="h-4 w-4 mr-1" />
                    {blog.likes_count || 0}
                  </span>
                  <span className="flex items-center text-sm text-gray-600">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {blog.comments_count || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'notices' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Notices</h2>
            <button
              onClick={() => setShowNoticeForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Notice
            </button>
          </div>

          {showNoticeForm && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Create New Notice</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={noticeForm.content}
                    onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={noticeForm.priority}
                      onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                    <select
                      value={noticeForm.target_audience}
                      onChange={(e) => setNoticeForm({ ...noticeForm, target_audience: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All</option>
                      <option value="students">Students</option>
                      <option value="teachers">Teachers</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowNoticeForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createNotice}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Notice'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {notices.map((notice) => (
              <div key={notice.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold">{notice.title}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    notice.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    notice.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    notice.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {notice.priority}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{notice.content}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Target: {notice.target_audience}</span>
                  <span>{new Date(notice.posted_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = ({ user, token }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadStats();
    } else if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const result = await api.admin.getStats(token);
      setStats(result);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await api.admin.getUsers(token);
      setUsers(result.users || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const updateUserStatus = async (userId, status) => {
    setLoading(true);
    try {
      await api.admin.updateUserStatus(userId, status, token);
      loadUsers(); // Refresh users list
      alert(`User status updated to ${status}`);
    } catch (err) {
      alert('Error updating user status');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setLoading(true);
      try {
        await api.admin.deleteUser(userId, token);
        loadUsers(); // Refresh users list
        alert('User deleted successfully');
      } catch (err) {
        alert('Error deleting user');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.user_stats && stats.user_stats.map((stat) => (
              <div key={stat.role} className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 capitalize">{stat.role}s</p>
                    <p className="text-2xl font-bold">{stat.count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.content_stats && stats.content_stats.map((stat) => (
              <div key={stat.type} className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  {stat.type === 'tests' && <TestTube className="h-8 w-8 text-green-600 mr-3" />}
                  {stat.type === 'notes' && <FileText className="h-8 w-8 text-purple-600 mr-3" />}
                  {stat.type === 'blogs' && <BookOpen className="h-8 w-8 text-orange-600 mr-3" />}
                  {stat.type === 'notices' && <Bell className="h-8 w-8 text-yellow-600 mr-3" />}
                  {stat.type === 'comments' && <MessageCircle className="h-8 w-8 text-pink-600 mr-3" />}
                  <div>
                    <p className="text-sm text-gray-600 capitalize">{stat.type}</p>
                    <p className="text-2xl font-bold">{stat.count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {stats.recent_activity && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Recent Activity (Last 30 Days)</h3>
              <div className="space-y-2">
                {stats.recent_activity.slice(0, 10).map((activity, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                    <span className="text-sm font-medium">
                      {activity.activity_count} activities
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">User Management</h2>
            <button
              onClick={loadUsers}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === 'approved' ? 'bg-green-100 text-green-800' :
                          user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          {user.tests_created > 0 && (
                            <div>Tests: {user.tests_created}</div>
                          )}
                          {user.notes_uploaded > 0 && (
                            <div>Notes: {user.notes_uploaded}</div>
                          )}
                          {user.blogs_written > 0 && (
                            <div>Blogs: {user.blogs_written}</div>
                          )}
                          {user.tests_taken > 0 && (
                            <div>Tests Taken: {user.tests_taken}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {user.status !== 'approved' && (
                            <button
                              onClick={() => updateUserStatus(user.id, 'approved')}
                              disabled={loading}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                          {user.status !== 'banned' && (
                            <button
                              onClick={() => updateUserStatus(user.id, 'banned')}
                              disabled={loading}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              Ban
                            </button>
                          )}
                          <button
                            onClick={() => deleteUser(user.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">System Analytics</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Detailed analytics coming soon...</p>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">System Settings</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">System settings panel coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userToken, userData) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {showRegister ? (
          <Register switchToLogin={() => setShowRegister(false)} />
        ) : (
          <Login 
            onLogin={handleLogin} 
            switchToRegister={() => setShowRegister(true)} 
          />
        )}
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token }}>
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={handleLogout} />
        <main>
          {user.role === 'admin' && (
            <AdminDashboard user={user} token={token} />
          )}
          {user.role === 'teacher' && (
            <TeacherDashboard user={user} token={token} />
          )}
          {user.role === 'student' && (
            <StudentDashboard user={user} token={token} />
          )}
        </main>
      </div>
    </AuthContext.Provider>
  );
};

export default App;