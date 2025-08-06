// pages/dashboard/TeacherDashboard.js - Fixed API calls
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import testService from '../../services/testService';
import { notesService } from '../../services/notesService';
import { blogService } from '../../services/blogService';
import { noticeService } from '../../services/noticeService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    tests: 0,
    notes: 0,
    blogs: 0,
    notices: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all data with proper error handling
      console.log('Fetching dashboard data...');
      
      const [testsResponse, notesResponse, blogsResponse, noticesResponse] = await Promise.allSettled([
        testService.getMyTests(),
        notesService.getNotes(),
        blogService.getMyBlogs(),
        noticeService.getMyNotices()
      ]);

      console.log('API Responses:', {
        tests: testsResponse,
        notes: notesResponse,
        blogs: blogsResponse,
        notices: noticesResponse
      });

      // Handle tests
      let myTests = [];
      if (testsResponse.status === 'fulfilled' && testsResponse.value?.tests) {
        myTests = testsResponse.value.tests;
      } else if (testsResponse.status === 'rejected') {
        console.error('Tests fetch failed:', testsResponse.reason);
      }

      // Handle notes - filter by current user since backend returns all notes
      let myNotes = [];
      if (notesResponse.status === 'fulfilled' && notesResponse.value?.notes) {
        myNotes = notesResponse.value.notes.filter(note => 
          note.uploaded_by === user.id || note.uploaded_by_name === user.name
        );
      } else if (notesResponse.status === 'rejected') {
        console.error('Notes fetch failed:', notesResponse.reason);
      }

      // Handle blogs
      let myBlogs = [];
      if (blogsResponse.status === 'fulfilled' && blogsResponse.value?.blogs) {
        myBlogs = blogsResponse.value.blogs;
      } else if (blogsResponse.status === 'rejected') {
        console.error('Blogs fetch failed:', blogsResponse.reason);
      }

      // Handle notices
      let myNotices = [];
      if (noticesResponse.status === 'fulfilled' && noticesResponse.value?.notices) {
        myNotices = noticesResponse.value.notices;
      } else if (noticesResponse.status === 'rejected') {
        console.error('Notices fetch failed:', noticesResponse.reason);
      }

      // Calculate stats
      setStats({
        tests: myTests.length,
        notes: myNotes.length,
        blogs: myBlogs.length,
        notices: myNotices.length
      });

      // Combine recent activities with safe date parsing
      const activities = [];
      
      // Add tests to activities
      myTests.slice(0, 3).forEach(test => {
        activities.push({
          id: `test-${test.id}`,
          type: 'test',
          title: test.title,
          date: test.created_at || new Date().toISOString(),
          icon: 'academic-cap'
        });
      });

      // Add notes to activities
      myNotes.slice(0, 3).forEach(note => {
        activities.push({
          id: `note-${note.id}`,
          type: 'note',
          title: note.title,
          date: note.uploaded_at || new Date().toISOString(),
          icon: 'book-open'
        });
      });

      // Add blogs to activities
      myBlogs.slice(0, 3).forEach(blog => {
        activities.push({
          id: `blog-${blog.id}`,
          type: 'blog',
          title: blog.title,
          date: blog.created_at || new Date().toISOString(),
          icon: 'document-text'
        });
      });

      // Add notices to activities
      myNotices.slice(0, 3).forEach(notice => {
        activities.push({
          id: `notice-${notice.id}`,
          type: 'notice',
          title: notice.title,
          date: notice.posted_at || new Date().toISOString(),
          icon: 'speakerphone'
        });
      });

      // Sort by date and limit to 8 most recent
      const sortedActivities = activities
        .sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA;
        })
        .slice(0, 8);

      setRecentActivities(sortedActivities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    const iconProps = "h-6 w-6";
    switch (iconName) {
      case 'academic-cap':
        return (
          <svg className={iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        );
      case 'book-open':
        return (
          <svg className={iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'document-text':
        return (
          <svg className={iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'speakerphone':
        return (
          <svg className={iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Unknown date';
    }
  };

  const handleRetry = () => {
    fetchDashboardData();
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-blue-100">Here's what's happening in your classroom today.</p>
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="text-sm">{error}</p>
            <button 
              onClick={handleRetry}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  {getIconComponent('academic-cap')}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tests Created</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.tests}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/tests/create" className="font-medium text-blue-600 hover:text-blue-500">
                Create new test
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                  {getIconComponent('book-open')}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Notes Uploaded</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.notes}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/notes/upload" className="font-medium text-green-600 hover:text-green-500">
                Upload notes
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white">
                  {getIconComponent('document-text')}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Blog Posts</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.blogs}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/blogs/create" className="font-medium text-purple-600 hover:text-purple-500">
                Write blog post
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white">
                  {getIconComponent('speakerphone')}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Notices Posted</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.notices}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/notices/create" className="font-medium text-yellow-600 hover:text-yellow-500">
                Post notice
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/tests/create">
            <Button className="w-full justify-center">Create Test</Button>
          </Link>
          <Link to="/notes/upload">
            <Button variant="secondary" className="w-full justify-center">Upload Notes</Button>
          </Link>
          <Link to="/blogs/create">
            <Button variant="secondary" className="w-full justify-center">Write Blog</Button>
          </Link>
          <Link to="/notices/create">
            <Button variant="secondary" className="w-full justify-center">Post Notice</Button>
          </Link>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activities</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div key={activity.id} className="px-6 py-4 flex items-center">
                <div className="flex-shrink-0 mr-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'test' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'note' ? 'bg-green-100 text-green-600' :
                    activity.type === 'blog' ? 'bg-purple-100 text-purple-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {getIconComponent(activity.icon)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} • {formatDate(activity.date)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No recent activities</p>
              <p className="text-sm text-gray-400 mt-1">Start creating content to see your activity here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;