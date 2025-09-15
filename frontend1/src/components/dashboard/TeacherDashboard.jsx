import React, { useState, useEffect } from 'react';
import { Home, TestTube, BarChart3, FileText, BookOpen, Bell, Plus, Upload, Trash2, Download, Heart, MessageCircle, Users } from 'lucide-react';
import { api, API_BASE_URL } from '../../api';

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
    if (activeTab === 'dashboard') {
      // Load data needed for dashboard stats
      loadMyTests();
      loadNotes();
      loadBlogs();
    } else if (activeTab === 'tests') {
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

export default TeacherDashboard;