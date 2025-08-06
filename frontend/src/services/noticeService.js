// src/services/noticeService.js - Fixed to match backend routes
import { apiRequest, handleApiError, handleApiSuccess } from './api';

export const noticeService = {
  // Create new notice (Teachers and Admins only)
  createNotice: async (noticeData) => {
    try {
      const response = await apiRequest.post('/api/notices/create', noticeData);
      handleApiSuccess('Notice created successfully');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get all notices with filtering and pagination
  getNotices: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/api/notices?${queryString}` : '/api/notices';
      return await apiRequest.get(url);
    } catch (error) {
      console.error('Error fetching notices:', error);
      return { notices: [], pagination: { current_page: 1, total_pages: 0, total_notices: 0 } };
    }
  },

  // Get specific notice by ID
  getNoticeById: async (noticeId) => {
    try {
      return await apiRequest.get(`/api/notices/${noticeId}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Mark notice as read
  markAsRead: async (noticeId) => {
    try {
      const response = await apiRequest.post(`/api/notices/${noticeId}/read`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get user's read status for notices
  getReadStatus: async (noticeIds) => {
    try {
      const idsString = Array.isArray(noticeIds) ? noticeIds.join(',') : noticeIds;
      return await apiRequest.get(`/api/notices/my/read-status?notice_ids=${idsString}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Update notice
  updateNotice: async (noticeId, noticeData) => {
    try {
      const response = await apiRequest.put(`/api/notices/${noticeId}`, noticeData);
      handleApiSuccess('Notice updated successfully');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Delete notice
  deleteNotice: async (noticeId) => {
    try {
      const response = await apiRequest.delete(`/api/notices/${noticeId}`);
      handleApiSuccess('Notice deleted successfully');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get my notices (Posted by current user - Teachers/Admins only)
  getMyNotices: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/api/notices/my/notices?${queryString}` : '/api/notices/my/notices';
      return await apiRequest.get(url);
    } catch (error) {
      console.error('Error fetching my notices:', error);
      return { notices: [], pagination: { current_page: 1, total_pages: 0, total_notices: 0 } };
    }
  },

  // Get notice statistics (Admin only)
  getNoticeStats: async () => {
    try {
      return await apiRequest.get('/api/notices/admin/stats');
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get unread notices count
  getUnreadCount: async () => {
    try {
      return await apiRequest.get('/api/notices/my/unread-count');
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return { unread_count: 0 };
    }
  },

  // Get active notices (not expired)
  getActiveNotices: async (params = {}) => {
    try {
      const searchParams = {
        status: 'active',
        ...params
      };
      return await this.getNotices(searchParams);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get urgent notices
  getUrgentNotices: async (params = {}) => {
    try {
      const searchParams = {
        priority: 'urgent',
        status: 'active',
        ...params
      };
      return await this.getNotices(searchParams);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Search notices
  searchNotices: async (searchTerm, params = {}) => {
    try {
      const searchParams = {
        search: searchTerm,
        ...params
      };
      return await this.getNotices(searchParams);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get notices by priority
  getNoticesByPriority: async (priority, params = {}) => {
    try {
      const searchParams = {
        priority: priority,
        ...params
      };
      return await this.getNotices(searchParams);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get notices by target audience
  getNoticesByAudience: async (audience, params = {}) => {
    try {
      const searchParams = {
        target_audience: audience,
        ...params
      };
      return await this.getNotices(searchParams);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get notices by author
  getNoticesByAuthor: async (authorId, params = {}) => {
    try {
      const searchParams = {
        author_id: authorId,
        ...params
      };
      return await this.getNotices(searchParams);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Archive notice
  archiveNotice: async (noticeId) => {
    try {
      const response = await apiRequest.put(`/api/notices/${noticeId}`, { status: 'archived' });
      handleApiSuccess('Notice archived successfully');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Restore notice from archive
  restoreNotice: async (noticeId) => {
    try {
      const response = await apiRequest.put(`/api/notices/${noticeId}`, { status: 'active' });
      handleApiSuccess('Notice restored successfully');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get recent notices (last 7 days)
  getRecentNotices: async (params = {}) => {
    try {
      const searchParams = {
        status: 'active',
        limit: 10,
        ...params
      };
      return await this.getNotices(searchParams);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Bulk mark as read (for multiple notices)
  bulkMarkAsRead: async (noticeIds) => {
    try {
      const promises = noticeIds.map(id => this.markAsRead(id));
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      if (successful > 0) {
        handleApiSuccess(`Marked ${successful} notices as read`);
      }
      
      return {
        successful,
        failed,
        results
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get dashboard notices (for dashboard display - active, high priority, recent)
  getDashboardNotices: async (limit = 5) => {
    try {
      const params = {
        status: 'active',
        limit: limit,
        sort: 'priority_date' // This would need backend support
      };
      return await this.getNotices(params);
    } catch (error) {
      console.error('Error fetching dashboard notices:', error);
      return { notices: [] };
    }
  }
};

export default noticeService;