// src/services/api.js - Fixed API service with proper imports
import axios from 'axios';

// Import from the correct path - adjust based on your project structure
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'olpm_auth_token',
  USER_DATA: 'olpm_user_data',
  THEME: 'olpm_theme',
  LANGUAGE: 'olpm_language',
};

// Helper function for error messages
const getErrorMessage = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || data.error || 'Bad request';
      case 401:
        return 'Please log in to continue';
      case 403:
        return 'You do not have permission to perform this action';
      case 404:
        return 'Resource not found';
      case 422:
        return data.message || 'Validation error';
      case 500:
        return 'Server error. Please try again later';
      default:
        return data.message || data.error || 'An error occurred';
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection';
  } else {
    // Other error
    return 'An unexpected error occurred';
  }
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
        // Note: Using console.error instead of toast to avoid import issues
        console.error('Your session has expired. Please log in again.');
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// API wrapper functions
export const apiRequest = {
  // GET request
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST request
  post: async (url, data, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  put: async (url, data, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH request
  patch: async (url, data, config = {}) => {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // File upload request
  upload: async (url, formData, onUploadProgress = null) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (onUploadProgress) {
        config.onUploadProgress = onUploadProgress;
      }

      const response = await api.post(url, formData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // File download request
  download: async (url, filename = null) => {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Set filename from response headers or parameter
      const contentDisposition = response.headers['content-disposition'];
      let downloadFilename = filename;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          downloadFilename = filenameMatch[1];
        }
      }
      
      link.download = downloadFilename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      return true;
    } catch (error) {
      throw error;
    }
  },
};

// Helper functions for common patterns
export const handleApiError = (error, showToast = true) => {
  const message = getErrorMessage(error);
  if (showToast) {
    console.error('API Error:', message); // Use console instead of toast for now
  }
  console.error('Full API Error:', error);
  return message;
};

export const handleApiSuccess = (message, showToast = true) => {
  if (showToast && message) {
    console.log('API Success:', message); // Use console instead of toast for now
  }
};

// Build URL with parameters
export const buildUrl = (template, params = {}) => {
  let url = template;
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  return url;
};

// Build query string
export const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item));
      } else {
        searchParams.append(key, value);
      }
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Cancel token management for request cancellation
export const createCancelToken = () => {
  const CancelToken = axios.CancelToken;
  return CancelToken.source();
};

export const isRequestCanceled = (error) => {
  return axios.isCancel(error);
};

export default api;