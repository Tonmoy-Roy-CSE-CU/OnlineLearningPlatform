// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-lzma.onrender.com/api';

// Helper function for API requests with better error handling
const makeRequest = async (url, options = {}) => {
  try {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include', // Always include credentials
    };

    // Merge options
    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    console.log(`Making request to: ${url}`);
    const response = await fetch(url, finalOptions);
    
    // Log response status
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
      } catch {
        errorMessage = errorText || `HTTP Error ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Request failed for ${url}:`, error);
    throw error;
  }
};

// API Helper Functions
export const api = {
  auth: {
    login: async (email, password) => {
      return await makeRequest(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    
    register: async (userData) => {
      return await makeRequest(`${API_BASE}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },

    getProfile: async (token) => {
      return await makeRequest(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },

    logout: async (token) => {
      return await makeRequest(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },
  },

  tests: {
    create: async (testData, token) => {
      return await makeRequest(`${API_BASE}/tests/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(testData),
      });
    },

    getByLink: async (link, token) => {
      return await makeRequest(`${API_BASE}/tests/${link}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
    },

    submit: async (testId, answers, timeTaken, token) => {
      return await makeRequest(`${API_BASE}/tests/${testId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          answers, 
          time_taken_seconds: timeTaken 
        }),
      });
    },

    getMyTests: async (token) => {
      return await makeRequest(`${API_BASE}/tests/my/tests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },

    getMyResults: async (token) => {
      return await makeRequest(`${API_BASE}/tests/my/results`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },

    getAnalytics: async (token) => {
      return await makeRequest(`${API_BASE}/tests/my/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },

    getResultDetails: async (submissionId, token) => {
      return await makeRequest(`${API_BASE}/tests/submission/${submissionId}/detailed`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },
  },

  notes: {
    getAll: async (token) => {
      return await makeRequest(`${API_BASE}/notes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },

    upload: async (formData, token) => {
      // For file uploads, don't set Content-Type header - let browser set it
      return await makeRequest(`${API_BASE}/notes/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Remove Content-Type to let browser set it for FormData
        },
        body: formData,
      });
    },

    delete: async (id, token) => {
      return await makeRequest(`${API_BASE}/notes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },
  },

  blogs: {
    getAll: async (token) => {
      return await makeRequest(`${API_BASE}/blogs`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
    },

    create: async (formData, token) => {
      return await makeRequest(`${API_BASE}/blogs/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Remove Content-Type for FormData
        },
        body: formData,
      });
    },

    like: async (id, token) => {
      return await makeRequest(`${API_BASE}/blogs/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },

    addComment: async (id, content, token) => {
      return await makeRequest(`${API_BASE}/blogs/${id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
    },
  },

  notices: {
    getAll: async (token) => {
      return await makeRequest(`${API_BASE}/notices`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },

    create: async (noticeData, token) => {
      return await makeRequest(`${API_BASE}/notices/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(noticeData),
      });
    },

    markRead: async (id, token) => {
      return await makeRequest(`${API_BASE}/notices/${id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },
  },

  admin: {
    getStats: async (token) => {
      return await makeRequest(`${API_BASE}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },

    getUsers: async (token) => {
      return await makeRequest(`${API_BASE}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },

    updateUserStatus: async (userId, status, token) => {
      return await makeRequest(`${API_BASE}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
    },

    deleteUser: async (userId, token) => {
      return await makeRequest(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },
  },
};

// Health check function
export const healthCheck = async () => {
  try {
    const response = await fetch(API_BASE.replace('/api', ''));
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export const API_BASE_URL = API_BASE;