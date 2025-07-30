import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  FileText, 
  PenTool, 
  Bell, 
  TrendingUp, 
  Clock,
  Award,
  Target
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/common/Loading';
import Button from '@/components/common/Button';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    testsCompleted: 0,
    averageScore: 0,
    notesDownloaded: 0,
    blogsRead: 0,
    unreadNotices: 0,
  });
  const [recentTests, setRecentTests] = useState([]);
  const [recentNotices, setRecentNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API calls
      setTimeout(() => {
        setStats({
          testsCompleted: 12,
          averageScore: 85,
          notesDownloaded: 24,
          blogsRead: 8,
          unreadNotices: 3,
        });
        
        setRecentTests([
          {
            id: 1,
            title: 'Mathematics Quiz - Algebra',
            score: 90,
            totalQuestions: 20,
            completedAt: '2024-01-15T10:30:00Z',
            grade: 'Excellent'
          },
          {
            id: 2,
            title: 'Science Test - Physics',
            score: 75,
            totalQuestions: 15,
            completedAt: '2024-01-14T14:20:00Z',
            grade: 'Good'
          }
        ]);
        
        setRecentNotices([
          {
            id: 1,
            title: 'Midterm Exam Schedule',
            priority: 'high',
            postedAt: '2024-01-16T09:00:00Z',
            isRead: false
          },
          {
            id: 2,
            title: 'Library Hours Update',
            priority: 'medium',
            postedAt: '2024-01-15T16:30:00Z',
            isRead: true
          }
        ]);
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading dashboard..." />;
  }

  const statCards = [
    {
      title: 'Tests Completed',
      value: stats.testsCompleted,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Average Score',
      value: `${stats.averageScore}%`,
      icon: <Award className="w-6 h-6" />,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Notes Downloaded',
      value: stats.notesDownloaded,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Unread Notices',
      value: stats.unreadNotices,
      icon: <Bell className="w-6 h-6" />,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-primary-100">
          Ready to continue your learning journey? Check out your progress below.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <div className={stat.textColor}>
                  {stat.icon}
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Test Results */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Recent Test Results</h2>
                <Link to="/results">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentTests.length > 0 ? (
                <div className="space-y-4">
                  {recentTests.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{test.title}</h3>
                        <p className="text-sm text-gray-600">
                          Score: {test.score}/{test.totalQuestions} ({Math.round((test.score/test.totalQuestions)*100)}%)
                        </p>
                        <p className="text-xs text-gray-500">
                          Completed: {new Date(test.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          test.grade === 'Excellent' ? 'bg-green-100 text-green-800' :
                          test.grade === 'Good' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {test.grade}
                        </span>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tests completed yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Start taking tests to see your results here.</p>
                  <div className="mt-6">
                    <Link to="/tests">
                      <Button variant="primary" size="sm">
                        Browse Tests
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Notices & Quick Actions */}
        <div className="space-y-6">
          {/* Recent Notices */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Recent Notices</h2>
                <Link to="/notices">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentNotices.length > 0 ? (
                <div className="space-y-3">
                  {recentNotices.map((notice) => (
                    <div key={notice.id} className={`
                      p-3 rounded-lg border-l-4 ${
                        notice.priority === 'high' ? 'border-red-400 bg-red-50' :
                        notice.priority === 'medium' ? 'border-yellow-400 bg-yellow-50' :
                        'border-blue-400 bg-blue-50'
                      } ${!notice.isRead ? 'font-medium' : ''}
                    `}>
                      <h3 className="text-sm text-gray-900">{notice.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(notice.postedAt).toLocaleDateString()}
                      </p>
                      {!notice.isRead && (
                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full ml-2"></span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Bell className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No recent notices</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <Link to="/tests" className="block">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <FileText className="w-5 h-5 text-blue-500 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Take a Test</span>
                  </div>
                </Link>
                
                <Link to="/notes" className="block">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <BookOpen className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Browse Notes</span>
                  </div>
                </Link>
                
                <Link to="/blogs" className="block">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <PenTool className="w-5 h-5 text-purple-500 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Read Blogs</span>
                  </div>
                </Link>
                
                <Link to="/notices" className="block">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Bell className="w-5 h-5 text-red-500 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Check Notices</span>
                    {stats.unreadNotices > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {stats.unreadNotices}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Performance Overview</h2>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Chart</h3>
            <p className="text-gray-600">
              Your test performance over time will be displayed here.
            </p>
            <div className="mt-4">
              <Link to="/results">
                <Button variant="outline" size="sm">
                  View Detailed Results
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;