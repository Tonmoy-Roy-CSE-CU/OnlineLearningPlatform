import React, { useState, useEffect } from 'react';
import { 
  Home, Users, BarChart3, Settings, TestTube, FileText, BookOpen, Bell, 
  MessageCircle, Trash2, AlertCircle, Download, RefreshCw, Shield, 
  Activity, Database, HardDrive, Clock, TrendingUp, Eye, Edit,
  CheckCircle, XCircle, UserCheck, UserX, Search, Filter
} from 'lucide-react';
import { api } from '../../services/api';

const AdminDashboard = ({ user, token }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [content, setContent] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Pagination and filtering states
  const [userFilters, setUserFilters] = useState({ role: '', status: '', page: 1 });
  const [userPagination, setUserPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    switch(activeTab) {
      case 'dashboard':
        loadStats();
        break;
      case 'users':
        loadUsers();
        break;
      case 'content':
        loadContent();
        break;
      case 'analytics':
        loadAnalytics();
        break;
      case 'settings':
        loadSystemHealth();
        break;
    }
  }, [activeTab, userFilters]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const result = await api.admin.getStats(token);
      setStats(result);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: userFilters.page,
        limit: 20,
        ...(userFilters.role && { role: userFilters.role }),
        ...(userFilters.status && { status: userFilters.status })
      });
      
      const response = await fetch(`${api.API_BASE_URL || 'http://localhost:5000/api'}/admin/users?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      setUsers(result.users || []);
      setUserPagination(result.pagination || {});
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${api.API_BASE_URL || 'http://localhost:5000/api'}/admin/content`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      setContent(result);
    } catch (err) {
      console.error('Error loading content:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${api.API_BASE_URL || 'http://localhost:5000/api'}/admin/analytics?range=30`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      setAnalytics(result);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${api.API_BASE_URL || 'http://localhost:5000/api'}/admin/system/health`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      setSystemHealth(result);
    } catch (err) {
      console.error('Error loading system health:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, status) => {
    if (loading) return;
    
    setLoading(true);
    try {
      await api.admin.updateUserStatus(userId, status, token);
      loadUsers();
      alert(`User status updated to ${status}`);
    } catch (err) {
      alert('Error updating user status');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, role) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${api.API_BASE_URL || 'http://localhost:5000/api'}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });
      
      if (response.ok) {
        loadUsers();
        alert(`User role updated to ${role}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Error updating user role');
      }
    } catch (err) {
      alert('Error updating user role');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone and will delete all their data.')) {
      setLoading(true);
      try {
        await api.admin.deleteUser(userId, token);
        loadUsers();
        alert('User deleted successfully');
      } catch (err) {
        alert('Error deleting user');
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteContent = async (type, id) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      setLoading(true);
      try {
        const response = await fetch(`${api.API_BASE_URL || 'http://localhost:5000/api'}/admin/content/${type}/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          loadContent();
          alert(`${type} deleted successfully`);
        } else {
          throw new Error('Failed to delete');
        }
      } catch (err) {
        alert(`Error deleting ${type}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const performSystemCleanup = async () => {
    if (window.confirm('Are you sure you want to cleanup orphaned files? This will permanently delete unused files.')) {
      setLoading(true);
      try {
        const response = await fetch(`${api.API_BASE_URL || 'http://localhost:5000/api'}/admin/system/cleanup`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        alert(`Cleanup completed. Deleted ${result.deleted_files} orphaned files.`);
        loadSystemHealth();
      } catch (err) {
        alert('Error performing cleanup');
      } finally {
        setLoading(false);
      }
    }
  };

  const exportData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${api.API_BASE_URL || 'http://localhost:5000/api'}/admin/system/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `olpm_backup_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        alert('Data exported successfully');
      } else {
        throw new Error('Export failed');
      }
    } catch (err) {
      alert('Error exporting data');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'content', label: 'Content Management', icon: FileText },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'System Health', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex items-center space-x-3">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <span>Loading...</span>
          </div>
        </div>
      )}

      {/* Dashboard Overview */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <button
              onClick={loadStats}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
          
          {/* User Statistics */}
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

          {/* Content Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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

          {/* Storage Statistics */}
          {stats.storage_stats && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <HardDrive className="h-5 w-5 mr-2" />
                Storage Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Files</p>
                  <p className="text-xl font-bold">{stats.storage_stats.total_files}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Files with Storage</p>
                  <p className="text-xl font-bold">{stats.storage_stats.files_with_storage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {stats.recent_activity && stats.recent_activity.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity (Last 30 Days)
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
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

      {/* User Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">User Management</h2>
            <button
              onClick={loadUsers}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <select
                  value={userFilters.role}
                  onChange={(e) => setUserFilters({...userFilters, role: e.target.value, page: 1})}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div>
                <select
                  value={userFilters.status}
                  onChange={(e) => setUserFilters({...userFilters, status: e.target.value, page: 1})}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                Total: {userPagination.total_users || 0} users
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((userData) => (
                    <tr key={userData.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                          <div className="text-sm text-gray-500">{userData.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={userData.role}
                          onChange={(e) => updateUserRole(userData.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1 capitalize"
                          disabled={loading}
                        >
                          <option value="admin">Admin</option>
                          <option value="teacher">Teacher</option>
                          <option value="student">Student</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={userData.status}
                          onChange={(e) => updateUserStatus(userData.id, e.target.value)}
                          className={`text-sm border rounded px-2 py-1 ${
                            userData.status === 'approved' ? 'text-green-600' :
                            userData.status === 'banned' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}
                          disabled={loading}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="banned">Banned</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div>Tests: {userData.tests_created || userData.tests_taken || 0}</div>
                          <div>Notes: {userData.notes_uploaded || 0}</div>
                          <div>Blogs: {userData.blogs_written || 0}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(userData.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteUser(userData.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          disabled={loading || userData.id === user.id}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {userPagination.total_pages > 1 && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Page {userPagination.current_page} of {userPagination.total_pages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setUserFilters({...userFilters, page: userFilters.page - 1})}
                  disabled={!userPagination.has_prev}
                  className="px-3 py-2 bg-gray-200 text-gray-600 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setUserFilters({...userFilters, page: userFilters.page + 1})}
                  disabled={!userPagination.has_next}
                  className="px-3 py-2 bg-gray-200 text-gray-600 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content Management */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Content Management</h2>
            <button
              onClick={loadContent}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>

          {/* Content Sections */}
          {Object.entries(content).map(([contentType, items]) => {
            if (!Array.isArray(items) || items.length === 0) return null;
            
            return (
              <div key={contentType} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium capitalize flex items-center">
                    {contentType === 'tests' && <TestTube className="h-5 w-5 mr-2" />}
                    {contentType === 'notes' && <FileText className="h-5 w-5 mr-2" />}
                    {contentType === 'blogs' && <BookOpen className="h-5 w-5 mr-2" />}
                    {contentType === 'notices' && <Bell className="h-5 w-5 mr-2" />}
                    {contentType} ({items.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.slice(0, 10).map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.title}</div>
                              {item.description && (
                                <div className="text-sm text-gray-500">
                                  {item.description.substring(0, 100)}...
                                </div>
                              )}
                              {item.content_preview && (
                                <div className="text-sm text-gray-500">
                                  {item.content_preview}...
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.creator_name || item.uploader_name || item.author_name || item.poster_name}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">
                              {item.creator_role || item.uploader_role || item.author_role || item.poster_role}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(item.created_at || item.uploaded_at || item.posted_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.question_count && <div>Questions: {item.question_count}</div>}
                            {item.submission_count && <div>Submissions: {item.submission_count}</div>}
                            {item.comment_count && <div>Comments: {item.comment_count}</div>}
                            {item.has_file && <div>📁 Has File</div>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => deleteContent(contentType.slice(0, -1), item.id)}
                              className="text-red-600 hover:text-red-900 flex items-center"
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Analytics */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">System Analytics</h2>
            <button
              onClick={loadAnalytics}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>

          {/* User Registration Trends */}
          {analytics.user_trends && analytics.user_trends.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                User Registration Trends (Last {analytics.time_range_days} Days)
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analytics.user_trends.map((trend, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">
                      {new Date(trend.date).toLocaleDateString()} - {trend.role}
                    </span>
                    <span className="text-sm font-medium">
                      {trend.registrations} new users
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Creation Trends */}
          {analytics.content_trends && analytics.content_trends.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Content Creation Trends
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analytics.content_trends.map((trend, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">
                      {new Date(trend.date).toLocaleDateString()} - {trend.type}
                    </span>
                    <span className="text-sm font-medium">
                      {trend.count} created
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Performance Analytics */}
          {analytics.test_analytics && analytics.test_analytics.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <TestTube className="h-5 w-5 mr-2" />
                Test Performance Analytics
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score Range</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.test_analytics.map((test, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {test.test_title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {test.submissions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {test.avg_score}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {test.min_score} - {test.max_score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Most Active Users */}
          {analytics.active_users && analytics.active_users.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Most Active Users
              </h3>
              <div className="space-y-2">
                {analytics.active_users.map((user, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-gray-500 ml-2 capitalize">({user.role})</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {user.activity_count} activities
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* System Health */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">System Health & Maintenance</h2>
            <div className="flex space-x-2">
              <button
                onClick={loadSystemHealth}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={exportData}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </button>
            </div>
          </div>

          {systemHealth && (
            <>
              {/* System Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Database className={`h-8 w-8 mr-3 ${
                      systemHealth.database?.status === 'healthy' ? 'text-green-600' : 'text-red-600'
                    }`} />
                    <div>
                      <p className="text-sm text-gray-600">Database</p>
                      <p className={`text-lg font-bold ${
                        systemHealth.database?.status === 'healthy' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {systemHealth.database?.status || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Uptime</p>
                      <p className="text-lg font-bold">
                        {formatUptime(systemHealth.uptime)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Shield className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Node.js Version</p>
                      <p className="text-lg font-bold">{systemHealth.node_version}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Memory Usage */}
              {systemHealth.memory_usage && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Memory Usage
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">RSS</p>
                      <p className="text-lg font-bold">{formatBytes(systemHealth.memory_usage.rss)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Heap Total</p>
                      <p className="text-lg font-bold">{formatBytes(systemHealth.memory_usage.heapTotal)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Heap Used</p>
                      <p className="text-lg font-bold">{formatBytes(systemHealth.memory_usage.heapUsed)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">External</p>
                      <p className="text-lg font-bold">{formatBytes(systemHealth.memory_usage.external)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Storage Usage */}
              {systemHealth.storage && systemHealth.storage.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <HardDrive className="h-5 w-5 mr-2" />
                    Storage Usage
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {systemHealth.storage.map((dir, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium capitalize mb-2">{dir.directory}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Size:</span>
                            <span>{dir.size_mb} MB</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Files:</span>
                            <span>{dir.file_count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Maintenance Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Maintenance Actions
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Cleanup Orphaned Files</h4>
                      <p className="text-sm text-gray-600">
                        Remove files that are no longer referenced in the database
                      </p>
                    </div>
                    <button
                      onClick={performSystemCleanup}
                      className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                      disabled={loading}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Cleanup
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Export System Data</h4>
                      <p className="text-sm text-gray-600">
                        Create a backup of all system data
                      </p>
                    </div>
                    <button
                      onClick={exportData}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      disabled={loading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Database Tables Info */}
              {systemHealth.tables && systemHealth.tables.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Database Tables
                  </h3>
                  <div className="text-sm text-gray-600">
                    Total tables monitored: {systemHealth.tables.length}
                  </div>
                </div>
              )}
            </>
          )}

          {!systemHealth && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Click refresh to load system health information</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;