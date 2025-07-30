// src/services/noticeService.js - Notice Service API Layer
import { apiRequest } from './api';

export const noticeService = {
  // Create notice (Teachers and Admins only)
  createNotice: async (data) => {
    return apiRequest('/notices/create', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Get all notices with filtering and pagination
  getAllNotices: async (params = {}) => {
    const queryString = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      status: params.status || 'active',
      ...(params.priority && { priority: params.priority }),
      ...(params.target_audience && { target_audience: params.target_audience }),
      ...(params.author_id && { author_id: params.author_id }),
      ...(params.search && { search: params.search })
    }).toString();
    
    return apiRequest(`/notices?${queryString}`);
  },

  // Get specific notice by ID
  getNoticeById: async (noticeId) => {
    return apiRequest(`/notices/${noticeId}`);
  },

  // Mark notice as read (Authenticated users)
  markAsRead: async (noticeId) => {
    return apiRequest(`/notices/${noticeId}/read`, {
      method: 'POST'
    });
  },

  // Get user's read status for notices
  getReadStatus: async (noticeIds) => {
    const queryString = new URLSearchParams({
      notice_ids: noticeIds.join(',')
    }).toString();
    
    return apiRequest(`/notices/my/read-status?${queryString}`);
  },

  // Update notice (Authors and Admins only)
  updateNotice: async (noticeId, data) => {
    return apiRequest(`/notices/${noticeId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Delete notice (Authors and Admins only)
  deleteNotice: async (noticeId) => {
    return apiRequest(`/notices/${noticeId}`, {
      method: 'DELETE'
    });
  },

  // Get my notices (Posted by current user)
  getMyNotices: async (params = {}) => {
    const queryString = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.status && { status: params.status })
    }).toString();
    
    return apiRequest(`/notices/my/notices?${queryString}`);
  },

  // Get notice statistics (Admin only)
  getNoticeStats: async () => {
    return apiRequest('/notices/admin/stats');
  },

  // Get unread notices count (Authenticated users)
  getUnreadCount: async () => {
    return apiRequest('/notices/my/unread-count');
  }
};