// api.js
// API Configuration
const API_BASE = 'https://olpm-backend.onrender.com/api';

// API Helper Functions
export const api = {
  auth: {
    login: async (email, password) => {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include' // Allow cookies or credentials if needed
        });
        const data = await res.json(); // Attempt to parse response
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error('Network error - Could not connect to server');
        }
        throw error;
      }
    },
    register: async (userData) => {
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error('Network error - Could not connect to server');
        }
        throw error;
      }
    },
  },
  tests: {
    create: async (testData, token) => {
      try {
        const res = await fetch(`${API_BASE}/tests/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(testData),
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        throw new Error(`Test creation failed: ${error.message}`);
      }
    },
    getByLink: async (link, token) => {
      try {
        const res = await fetch(`${API_BASE}/tests/${link}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        throw new Error(`Failed to fetch test: ${error.message}`);
      }
    },
    submit: async (testId, answers, timeTaken, token) => {
      try {
        const res = await fetch(`${API_BASE}/tests/${testId}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ answers, time_taken_seconds: timeTaken }),
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        throw new Error(`Test submission failed: ${error.message}`);
      }
    },
    getMyTests: async (token) => {
      try {
        const res = await fetch(`${API_BASE}/tests/my/tests`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        throw new Error(`Failed to fetch my tests: ${error.message}`);
      }
    },
    getMyResults: async (token) => {
      try {
        const res = await fetch(`${API_BASE}/tests/my/results`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        throw new Error(`Failed to fetch my results: ${error.message}`);
      }
    },
    getAnalytics: async (token) => {
      try {
        const res = await fetch(`${API_BASE}/tests/my/analytics`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        throw new Error(`Failed to fetch analytics: ${error.message}`);
      }
    },
    getResultDetails: async (submissionId, token) => {
      try {
        const res = await fetch(`${API_BASE}/tests/submission/${submissionId}/detailed`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        throw new Error(`Failed to fetch result details: ${error.message}`);
      }
    }
  },
  notes: {
    getAll: async (token) => {
      try {
        const res = await fetch(`${API_BASE}/notes`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        throw new Error(`Failed to fetch notes: ${error.message}`);
      }
    },
    upload: async (formData, token) => {
      try {
        const res = await fetch(`${API_BASE}/notes/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        throw new Error(`Failed to upload note: ${error.message}`);
      }
    }
  },
  blogs: {
    getAll: async (token) => {
      try {
        const res = await fetch(`${API_BASE}/blogs`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        throw new Error(`Failed to fetch blogs: ${error.message}`);
      }
    },
    create: async (formData, token) => {
      try {
        const res = await fetch(`${API_BASE}/blogs/create`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        throw new Error(`Failed to create blog: ${error.message}`);
      }
    },
    like: async (id, token) => {
      try {
        const res = await fetch(`${API_BASE}/blogs/${id}/like`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        throw new Error(`Failed to like blog: ${error.message}`);
      }
    },
    addComment: async (id, content, token) => {
      try {
        const res = await fetch(`${API_BASE}/blogs/${id}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        throw new Error(`Failed to add comment: ${error.message}`);
      }
    }
  },
  notices: {
    getAll: async (token) => {
      try {
        const res = await fetch(`${API_BASE}/notices`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        throw new Error(`Failed to fetch notices: ${error.message}`);
      }
    },
    create: async (noticeData, token) => {
      try {
        const res = await fetch(`${API_BASE}/notices/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(noticeData),
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        throw new Error(`Failed to create notice: ${error.message}`);
      }
    },
    markRead: async (id, token) => {
      try {
        const res = await fetch(`${API_BASE}/notices/${id}/read`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        throw new Error(`Failed to mark read: ${error.message}`);
      }
    }
  },
  admin: {
    getStats: async (token) => {
      try {
        const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        throw new Error(`Failed to fetch admin stats: ${error.message}`);
      }
    },
    getUsers: async (token) => {
      try {
        const res = await fetch(`${API_BASE}/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        throw new Error(`Failed to fetch users: ${error.message}`);
      }
    },
    updateUserStatus: async (userId, status, token) => {
      try {
        const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        throw new Error(`Failed to update user status: ${error.message}`);
      }
    },
    deleteUser: async (userId, token) => {
      try {
        const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
        return data;
      } catch (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
      }
    }
  }
};

export const API_BASE_URL = API_BASE;