// API Configuration
const API_BASE = 'http://localhost:5000/api';

// API Helper Functions
export const api = {
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return res.json();
    },
    register: async (userData) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return res.json();
    }
  },
  tests: {
    create: async (testData, token) => {
      const res = await fetch(`${API_BASE}/tests/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testData)
      });
      return res.json();
    },
    getByLink: async (link, token) => {
      const res = await fetch(`${API_BASE}/tests/${link}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    submit: async (testId, answers, timeTaken, token) => {
      const res = await fetch(`${API_BASE}/tests/${testId}/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers, time_taken_seconds: timeTaken })
      });
      return res.json();
    },
    getMyTests: async (token) => {
      const res = await fetch(`${API_BASE}/tests/my/tests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    getMyResults: async (token) => {
      const res = await fetch(`${API_BASE}/tests/my/results`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    getAnalytics: async (token) => {
      const res = await fetch(`${API_BASE}/tests/my/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    }
  },
  notes: {
    getAll: async (token) => {
      const res = await fetch(`${API_BASE}/notes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    upload: async (formData, token) => {
      const res = await fetch(`${API_BASE}/notes/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      return res.json();
    },
    delete: async (id, token) => {
      const res = await fetch(`${API_BASE}/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    }
  },
  blogs: {
    getAll: async (token) => {
      const res = await fetch(`${API_BASE}/blogs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    create: async (formData, token) => {
      const res = await fetch(`${API_BASE}/blogs/create`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      return res.json();
    },
    like: async (id, token) => {
      const res = await fetch(`${API_BASE}/blogs/${id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    addComment: async (id, content, token) => {
      const res = await fetch(`${API_BASE}/blogs/${id}/comments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      return res.json();
    }
  },
  notices: {
    getAll: async (token) => {
      const res = await fetch(`${API_BASE}/notices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    create: async (noticeData, token) => {
      const res = await fetch(`${API_BASE}/notices/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(noticeData)
      });
      return res.json();
    },
    markRead: async (id, token) => {
      const res = await fetch(`${API_BASE}/notices/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    }
  },
  admin: {
    getStats: async (token) => {
      const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    getUsers: async (token) => {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    updateUserStatus: async (userId, status, token) => {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      return res.json();
    },
    deleteUser: async (userId, token) => {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    }
  }
};

export const API_BASE_URL = API_BASE;