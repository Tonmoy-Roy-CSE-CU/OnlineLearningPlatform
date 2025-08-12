// services/api.js
const API_BASE = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  auth = {
    login: async (email, password) => {
      return this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    register: async (userData) => {
      return this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },
  };

  // Test endpoints
  tests = {
    create: async (testData) => {
      return this.request('/tests/create', {
        method: 'POST',
        body: JSON.stringify(testData),
      });
    },

    getByLink: async (link) => {
      return this.request(`/tests/${link}`);
    },

    submit: async (testId, answers, timeTaken) => {
      return this.request(`/tests/${testId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ 
          answers, 
          time_taken_seconds: timeTaken 
        }),
      });
    },

    getMyTests: async () => {
      return this.request('/tests/my/tests');
    },

    getMyResults: async () => {
      return this.request('/tests/my/results');
    },

    getAnalytics: async () => {
      return this.request('/tests/my/analytics');
    },

    getResultDetails: async (submissionId) => {
      return apiService.request(`/tests/submission/${submissionId}/detailed`);
    }
  };

  // Notes endpoints
  notes = {
    getAll: async () => {
      return this.request('/notes');
    },

    upload: async (formData) => {
      return this.request('/notes/upload', {
        method: 'POST',
        body: formData,
        headers: {}, // Remove Content-Type to let browser set it for FormData
      });
    },

    delete: async (id) => {
      return this.request(`/notes/${id}`, {
        method: 'DELETE',
      });
    },

    download: (id) => {
      return `${this.baseURL}/notes/${id}/download`;
    },
  };

  // Blog endpoints
  blogs = {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/blogs${query ? `?${query}` : ''}`);
    },

    create: async (formData) => {
      return this.request('/blogs/create', {
        method: 'POST',
        body: formData,
        headers: {}, // Remove Content-Type for FormData
      });
    },

    getById: async (id) => {
      return this.request(`/blogs/${id}`);
    },

    update: async (id, formData) => {
      return this.request(`/blogs/${id}`, {
        method: 'PUT',
        body: formData,
        headers: {},
      });
    },

    delete: async (id) => {
      return this.request(`/blogs/${id}`, {
        method: 'DELETE',
      });
    },

    like: async (id) => {
      return this.request(`/blogs/${id}/like`, {
        method: 'POST',
      });
    },

    addComment: async (id, content) => {
      return this.request(`/blogs/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    },

    getMyBlogs: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/blogs/my/blogs${query ? `?${query}` : ''}`);
    },
  };

  // Notice endpoints
  notices = {
    getAll: async () => {
      return this.request('/notices');
    },

    create: async (noticeData) => {
      return this.request('/notices/create', {
        method: 'POST',
        body: JSON.stringify(noticeData),
      });
    },

    markRead: async (id) => {
      return this.request(`/notices/${id}/read`, {
        method: 'POST',
      });
    },
  };

  // Admin endpoints
  admin = {
    getStats: async () => {
      return this.request('/admin/dashboard/stats');
    },

    getUsers: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/admin/users${query ? `?${query}` : ''}`);
    },

    updateUserStatus: async (userId, status) => {
      return this.request(`/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },

    updateUserRole: async (userId, role) => {
      return this.request(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
    },

    deleteUser: async (userId) => {
      return this.request(`/admin/users/${userId}`, {
        method: 'DELETE',
      });
    },

    getContent: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/admin/content${query ? `?${query}` : ''}`);
    },

    deleteContent: async (type, id) => {
      return this.request(`/admin/content/${type}/${id}`, {
        method: 'DELETE',
      });
    },

    getAnalytics: async (range = '30') => {
      return this.request(`/admin/analytics?range=${range}`);
    },

    getSystemHealth: async () => {
      return this.request('/admin/system/health');
    },

    cleanup: async () => {
      return this.request('/admin/system/cleanup', {
        method: 'POST',
      });
    },

    exportData: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseURL}/admin/system/export`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `olpm_backup_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  };
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;