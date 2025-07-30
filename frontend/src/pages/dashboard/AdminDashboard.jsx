import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // This would typically come from your admin service
      // For now, we'll simulate the data structure
      const stats = {
        user_stats: [
          { role: 'student', count: 150 },
          { role: 'teacher', count: 25 },
          { role: 'admin', count: 3 }
        ],
        content_stats: [
          { type: 'tests', count: 45 },
          { type: 'notes', count: 120 },
          { type: 'blogs', count: 80 },
          { type: 'notices', count: 30 }
        ],
        recent_activity: [
          { date: '2024-01-15', activity_count: 25 },
          { date: '2024-01-14', activity_count: 18 },
          { date: '2024-01-13', activity_count: 30 }
        ]
      };
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      {/* Admin Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-purple-100">Monitor and manage your educational platform.</p>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardStats?.user_stats.map((stat) => (
          <div key={stat.role} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    stat.role === 'admin' ? 'bg-purple-500' :
                    stat.role === 'teacher' ? 'bg-blue-500' :
                    'bg-green-500'
                  } text-white`}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate capitalize">
                      {stat.role}s
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{stat.count}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Statistics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Content Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {dashboardStats?.content_stats.map((stat) => (
            <div key={stat.type} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
              <div className="text-sm text-gray-500 capitalize">{stat.type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/users">
            <Button className="w-full justify-center">Manage Users</Button>
          </Link>
          <Link to="/admin/content">
            <Button variant="secondary" className="w-full justify-center">Content Moderation</Button>
          </Link>
          <Link to="/admin/analytics">
            <Button variant="secondary" className="w-full justify-center">View Analytics</Button>
          </Link>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Database</p>
              <p className="text-sm text-gray-500">Operational</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">File Storage</p>
              <p className="text-sm text-gray-500">Operational</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">API Services</p>
              <p className="text-sm text-gray-500">Operational</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Platform Activity</h2>
        <div className="space-y-3">
          {dashboardStats?.recent_activity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {new Date(activity.date).toLocaleDateString()}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(activity.activity_count * 3, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {activity.activity_count} activities
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;