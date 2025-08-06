// pages/profile/Profile.jsx - Fixed Profile component
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '@/services/authService'; // ✅ Default export (class instance)
import testService from '../../services/testService'; // ✅ Default export (class instance)
import { notesService } from '../../services/notesService'; // ✅ Named export
import { blogService } from '../../services/blogService'; // ✅ Named export
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Activity data
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      fetchUserStats();
      fetchUserActivities();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      let userStats = {};
      
      if (user.role === 'student') {
        // For students: get test results
        try {
          const testResults = await testService.getMyResults();
          userStats = {
            testsCompleted: testResults.results?.length || 0,
            averageScore: testResults.results?.length > 0 
              ? testResults.results.reduce((sum, result) => sum + result.percentage, 0) / testResults.results.length 
              : 0,
            totalTimeSpent: testResults.results?.reduce((sum, result) => sum + (result.time_taken_minutes || 0), 0) || 0
          };
        } catch (error) {
          console.warn('Failed to fetch test results:', error);
          userStats = {
            testsCompleted: 0,
            averageScore: 0,
            totalTimeSpent: 0
          };
        }
      } else if (user.role === 'teacher' || user.role === 'admin') {
        // For teachers/admins: get created content stats
        const promises = [];
        
        // Get notes
        promises.push(
          notesService.getAllNotes()
            .then(response => {
              const notesData = response.notes || response || [];
              return notesData.filter(note => note.uploaded_by === user.id);
            })
            .catch(() => [])
        );
        
        // Get blogs
        promises.push(
          blogService.getMyBlogs()
            .then(response => response.blogs || [])
            .catch(() => [])
        );

        const [myNotes, myBlogs] = await Promise.all(promises);
        
        userStats = {
          testsCreated: 0, // We don't have a direct "my tests" endpoint yet
          notesUploaded: myNotes.length,
          blogsWritten: myBlogs.length,
          totalStudents: 0
        };
      }

      setStats(userStats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setStats({});
    }
  };

  const fetchUserActivities = async () => {
    setActivityLoading(true);
    try {
      const activities = [];

      if (user.role === 'student') {
        // Get test results for students
        try {
          const testResults = await testService.getMyResults();
          testResults.results?.forEach(result => {
            activities.push({
              id: `test-${result.submission_id}`,
              type: 'test_completed',
              title: result.test_title,
              description: `Scored ${result.percentage}%`,
              date: result.submitted_at,
              icon: 'academic-cap',
              color: 'blue'
            });
          });
        } catch (error) {
          console.warn('Failed to fetch test activities:', error);
        }
      } else {
        // For teachers/admins: get created content
        try {
          // Get notes
          const notesResponse = await notesService.getAllNotes();
          const notesData = notesResponse.notes || notesResponse || [];
          const myNotes = notesData.filter(note => note.uploaded_by === user.id);
          
          myNotes.forEach(note => {
            activities.push({
              id: `note-${note.id}`,
              type: 'note_uploaded',
              title: note.title,
              description: 'Uploaded study notes',
              date: note.uploaded_at,
              icon: 'book-open',
              color: 'purple'
            });
          });
        } catch (error) {
          console.warn('Failed to fetch notes activities:', error);
        }

        try {
          // Get blogs
          const blogsResponse = await blogService.getMyBlogs();
          blogsResponse.blogs?.forEach(blog => {
            activities.push({
              id: `blog-${blog.id}`,
              type: 'blog_created',
              title: blog.title,
              description: 'Published a blog post',
              date: blog.created_at,
              icon: 'document-text',
              color: 'indigo'
            });
          });
        } catch (error) {
          console.warn('Failed to fetch blog activities:', error);
        }
      }

      // Sort by date (newest first)
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      setActivities(activities.slice(0, 20)); // Show latest 20 activities
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        name: profileForm.name,
        email: profileForm.email
      };

      // If password is being changed
      if (profileForm.newPassword) {
        if (profileForm.newPassword !== profileForm.confirmPassword) {
          alert('New passwords do not match');
          return;
        }
        updateData.currentPassword = profileForm.currentPassword;
        updateData.newPassword = profileForm.newPassword;
      }

      await authService.updateProfile(updateData);
      updateUser({ ...user, name: profileForm.name, email: profileForm.email });
      
      // Clear password fields
      setProfileForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getActivityIcon = (iconName) => {
    const iconProps = "h-5 w-5";
    switch (iconName) {
      case 'academic-cap':
        return (
          <svg className={iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
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
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Information' },
    { id: 'stats', name: 'Statistics' },
    { id: 'activity', name: 'Recent Activity' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-6">
          <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-gray-600">{user?.email}</p>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full capitalize mt-2">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="name"
                  value={profileForm.name}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <hr className="my-6" />

              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={profileForm.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Leave blank to keep current password"
                />
                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={profileForm.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                />
                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={profileForm.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" loading={loading}>
                  Update Profile
                </Button>
              </div>
            </form>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Your Statistics</h3>
              
              {user?.role === 'student' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.testsCompleted || 0}</div>
                    <p className="text-sm text-gray-600">Tests Completed</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.averageScore ? `${Math.round(stats.averageScore)}%` : '0%'}
                    </div>
                    <p className="text-sm text-gray-600">Average Score</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.totalTimeSpent || 0}m</div>
                    <p className="text-sm text-gray-600">Total Time Spent</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.testsCreated || 0}</div>
                    <p className="text-sm text-gray-600">Tests Created</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.notesUploaded || 0}</div>
                    <p className="text-sm text-gray-600">Notes Uploaded</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.blogsWritten || 0}</div>
                    <p className="text-sm text-gray-600">Blogs Written</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              
              {activityLoading ? (
                <Loading />
              ) : activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        activity.color === 'green' ? 'bg-green-100 text-green-600' :
                        activity.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                        activity.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {getActivityIcon(activity.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                  <p className="mt-1 text-sm text-gray-500">Your activities will appear here as you use the platform.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;