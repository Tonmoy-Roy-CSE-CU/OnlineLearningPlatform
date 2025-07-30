// src/services/adminService.js - Admin Service API Layer
import { apiRequest } from './api';

export const adminService = {
  // ===== DASHBOARD OVERVIEW =====
  
  // Get dashboard statistics
  getDashboardStats: async () => {
    return apiRequest('/admin/dashboard/stats');
  },

  // ===== USER MANAGEMENT =====
  
  // Get all users with detailed info
  getAllUsers: async (params = {}) => {
    const queryString = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.role && { role: params.role }),
      ...(params.status && { status: params.status })
    }).toString();
    
    return apiRequest(`/admin/users?${queryString}`);
  },

  // Update user status
  updateUserStatus: async (userId, status) => {
    return apiRequest(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    return apiRequest(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  },

  // Delete user (with cascade cleanup)
  deleteUser: async (userId) => {
    return apiRequest(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  },

  // ===== CONTENT MANAGEMENT =====
  
  // Get all content with moderation info
  getAllContent: async (params = {}) => {
    const queryString = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.type && { type: params.type })
    }).toString();
    
    return apiRequest(`/admin/content?${queryString}`);
  },

  // Delete any content item
  deleteContent: async (type, id) => {
    return apiRequest(`/admin/content/${type}/${id}`, {
      method: 'DELETE'
    });
  },

  // ===== SYSTEM ANALYTICS =====
  
  // Get detailed analytics
  getAnalytics: async (range = '30') => {
    const queryString = new URLSearchParams({ range }).toString();
    return apiRequest(`/admin/analytics?${queryString}`);
  },

  // ===== SYSTEM MAINTENANCE =====
  
  // Get system health info
  getSystemHealth: async () => {
    return apiRequest('/admin/system/health');
  },

  // Cleanup orphaned files
  cleanupSystem: async () => {
    return apiRequest('/admin/system/cleanup', {
      method: 'POST'
    });
  },

  // Export data (backup)
  exportData: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/system/export`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  }
};