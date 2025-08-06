// pages/notices/NoticesPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { noticeService } from '../../services/noticeService';
import { Link } from 'react-router-dom';
import NoticeForm from '../../components/notices/NoticeForm';
import NoticesList from '../../components/notices/NoticesList';

import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
export const NoticesPage = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    priority: '',
    target_audience: '',
    search: '',
    page: 1
  });
  const [readStatus, setReadStatus] = useState({});

  useEffect(() => {
    fetchNotices();
    if (user) {
      fetchReadStatus();
    }
  }, [filters]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const response = await noticeService.getNotices(filters);
      setNotices(response.notices);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReadStatus = async () => {
    if (notices.length > 0) {
      try {
        const noticeIds = notices.map(n => n.id).join(',');
        const response = await noticeService.getReadStatus(noticeIds);
        setReadStatus(response.read_status);
      } catch (error) {
        console.error('Error fetching read status:', error);
      }
    }
  };

  const handleMarkAsRead = async (noticeId) => {
    try {
      await noticeService.markAsRead(noticeId);
      setReadStatus(prev => ({
        ...prev,
        [noticeId]: { read: true, viewed_at: new Date().toISOString() }
      }));
    } catch (error) {
      alert('Error marking notice as read: ' + error.message);
    }
  };

  const handleViewNotice = (notice) => {
    // Navigate to notice detail or open modal
    handleMarkAsRead(notice.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notices</h1>
        {(user.role === 'teacher' || user.role === 'admin') && (
          <Link to="/notices/create">
            <Button>Post Notice</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search notices..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filters.target_audience}
            onChange={(e) => setFilters({ ...filters, target_audience: e.target.value, page: 1 })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Audiences</option>
            <option value="all">All Users</option>
            <option value="students">Students</option>
            <option value="teachers">Teachers</option>
          </select>
          <Button variant="secondary" onClick={fetchNotices}>
            Apply Filters
          </Button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <NoticesList
          notices={notices}
          onView={handleViewNotice}
          onMarkRead={handleMarkAsRead}
          userRole={user.role}
          currentUserId={user.id}
          readStatus={readStatus}
        />
      )}
    </div>
  );
};

// pages/notices/CreateNotice.js
export const CreateNotice = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/notices');
  };

  const handleCancel = () => {
    navigate('/notices');
  };

  return (
    <div>
      <NoticeForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
};