import React, { useState, useEffect } from 'react';
import { TestTube, Award, Bell, Home, FileText, BookOpen, Download, Heart, MessageCircle } from 'lucide-react';
import { api, API_BASE_URL } from '../../services/api';

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
    if (activeTab === 'dashboard') {
      // Load data needed for dashboard stats
      loadTestResults();
      loadNotices();
    } else if (activeTab === 'results') {
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
      // Refresh test results after submission
      loadTestResults();
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
                        href={`${API_BASE_URL}/notes/${note.id}/download`}
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

export default StudentDashboard;