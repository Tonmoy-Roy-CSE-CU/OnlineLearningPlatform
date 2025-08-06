// components/dashboard/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Home, TestTube, Award, FileText, BookOpen, Bell, 
  Heart, MessageCircle, Download 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import apiService from '../../services/api';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import TestTaker from '../test/TestTaker';

const StudentDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [testLink, setTestLink] = useState('');
  const [currentTest, setCurrentTest] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [notes, setNotes] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [notices, setNotices] = useState([]);
  
  const { loading, error, execute } = useApi();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'test', label: 'Take Test', icon: TestTube },
    { id: 'results', label: 'My Results', icon: Award },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'blogs', label: 'Blogs', icon: BookOpen },
    { id: 'notices', label: 'Notices', icon: Bell }
  ];

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab) => {
    try {
      switch (tab) {
        case 'results':
          const resultsData = await execute(apiService.tests.getMyResults);
          setTestResults(resultsData.results || []);
          break;
        case 'notes':
          const notesData = await execute(apiService.notes.getAll);
          setNotes(notesData.notes || []);
          break;
        case 'blogs':
          const blogsData = await execute(apiService.blogs.getAll);
          setBlogs(blogsData.blogs || []);
          break;
        case 'notices':
          const noticesData = await execute(apiService.notices.getAll);
          setNotices(noticesData.notices || []);
          break;
      }
    } catch (err) {
      console.error(`Error loading ${tab} data:`, err);
    }
  };

  const joinTest = async () => {
    if (!testLink.trim()) return;
    
    try {
      const result = await execute(apiService.tests.getByLink, testLink);
      if (result.test) {
        setCurrentTest(result.test);
      }
    } catch (err) {
      console.error('Test join error:', err);
    }
  };

  const handleTestComplete = () => {
    setCurrentTest(null);
    setTestLink('');
    if (activeTab === 'results') {
      loadTabData('results');
    }
  };

  const likeBlog = async (blogId) => {
    try {
      await execute(apiService.blogs.like, blogId);
      loadTabData('blogs');
    } catch (err) {
      console.error('Error liking blog:', err);
    }
  };

  if (currentTest) {
    return (
      <TestTaker 
        test={currentTest} 
        onComplete={handleTestComplete}
        onCancel={() => setCurrentTest(null)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {tabs.map(tab => {
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

      {error && <ErrorMessage error={error} className="mb-4" />}
      {loading && <Loading />}

      {/* Dashboard Overview */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard
            icon={TestTube}
            title="Tests Taken"
            value={testResults.length}
            color="blue"
          />
          <StatsCard
            icon={Award}
            title="Average Score"
            value={testResults.length > 0 
              ? `${Math.round(testResults.reduce((sum, r) => sum + parseFloat(r.percentage || 0), 0) / testResults.length)}%`
              : '0%'
            }
            color="green"
          />
          <StatsCard
            icon={Bell}
            title="New Notices"
            value={notices.length}
            color="yellow"
          />
        </div>
      )}

      {/* Test Taking */}
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

      {/* Test Results */}
      {activeTab === 'results' && (
        <TestResultsTable results={testResults} />
      )}

      {/* Notes */}
      {activeTab === 'notes' && (
        <NotesGrid notes={notes} />
      )}

      {/* Blogs */}
      {activeTab === 'blogs' && (
        <BlogsList blogs={blogs} onLike={likeBlog} />
      )}

      {/* Notices */}
      {activeTab === 'notices' && (
        <NoticesList notices={notices} />
      )}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ icon: Icon, title, value, color }) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <Icon className={`h-8 w-8 ${colorClasses[color]} mr-3`} />
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Test Results Table Component
const TestResultsTable = ({ results }) => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b">
      <h2 className="text-xl font-bold">My Test Results</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {results.map((result) => (
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
                <GradeBadge grade={result.grade} />
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
);

// Grade Badge Component
const GradeBadge = ({ grade }) => {
  const getGradeColor = (grade) => {
    switch (grade) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Average': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(grade)}`}>
      {grade}
    </span>
  );
};

// Notes Grid Component
const NotesGrid = ({ notes }) => (
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
                  href={apiService.notes.download(note.id)}
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
);

// Blogs List Component
const BlogsList = ({ blogs, onLike }) => (
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
            onClick={() => onLike(blog.id)}
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
);

// Notices List Component
const NoticesList = ({ notices }) => (
  <div className="space-y-4">
    {notices.map((notice) => (
      <div key={notice.id} className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold">{notice.title}</h3>
          <PriorityBadge priority={notice.priority} />
        </div>
        <p className="text-gray-700 mb-3">{notice.content}</p>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>by {notice.author_name}</span>
          <span>{new Date(notice.posted_at).toLocaleDateString()}</span>
        </div>
      </div>
    ))}
  </div>
);

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(priority)}`}>
      {priority}
    </span>
  );
};

export default StudentDashboard;