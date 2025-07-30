import { format, parseISO, isValid } from 'date-fns';
import { GRADE_THRESHOLDS, GRADE_LABELS, DATE_FORMATS } from './constants';

/**
 * Format a date string or Date object
 * @param {string|Date} date - The date to format
 * @param {string} formatStr - The format string (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = DATE_FORMATS.DISPLAY) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * Calculate percentage score
 * @param {number} score - Correct answers
 * @param {number} total - Total questions
 * @returns {number} Percentage (0-100)
 */
export const calculatePercentage = (score, total) => {
  if (!total || total === 0) return 0;
  return Math.round((score / total) * 100);
};

/**
 * Get grade based on percentage
 * @param {number} percentage - Score percentage (0-100)
 * @returns {string} Grade label
 */
export const getGrade = (percentage) => {
  if (percentage >= GRADE_THRESHOLDS.EXCELLENT) return GRADE_LABELS.EXCELLENT;
  if (percentage >= GRADE_THRESHOLDS.GOOD) return GRADE_LABELS.GOOD;
  if (percentage >= GRADE_THRESHOLDS.AVERAGE) return GRADE_LABELS.AVERAGE;
  return GRADE_LABELS.NEEDS_IMPROVEMENT;
};

/**
 * Get grade color class
 * @param {number} percentage - Score percentage (0-100)
 * @returns {string} CSS class name
 */
export const getGradeColor = (percentage) => {
  if (percentage >= GRADE_THRESHOLDS.EXCELLENT) return 'text-green-600 bg-green-100';
  if (percentage >= GRADE_THRESHOLDS.GOOD) return 'text-blue-600 bg-blue-100';
  if (percentage >= GRADE_THRESHOLDS.AVERAGE) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Format duration in seconds to minutes and seconds
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0s';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) return `${remainingSeconds}s`;
  if (remainingSeconds === 0) return `${minutes}m`;
  return `${minutes}m ${remainingSeconds}s`;
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default: 100)
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Generate a random color for avatars/initials
 * @param {string} text - Text to base color on
 * @returns {string} CSS background color class
 */
export const getRandomColor = (text) => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  
  if (!text) return colors[0];
  
  const hash = text.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Get user initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with strength and messages
 */
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const requirements = [
    { met: password.length >= minLength, text: `At least ${minLength} characters` },
    { met: hasUpperCase, text: 'One uppercase letter' },
    { met: hasLowerCase, text: 'One lowercase letter' },
    { met: hasNumbers, text: 'One number' },
    { met: hasSpecialChar, text: 'One special character' },
  ];
  
  const metRequirements = requirements.filter(req => req.met).length;
  let strength = 'weak';
  
  if (metRequirements >= 4) strength = 'strong';
  else if (metRequirements >= 3) strength = 'medium';
  
  return {
    isValid: metRequirements >= 4,
    strength,
    requirements,
    score: metRequirements,
  };
};

/**
 * Create URL-friendly slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} URL slug
 */
export const createSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  return text.replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Check if user has required role
 * @param {string} userRole - Current user role
 * @param {string|Array} requiredRoles - Required role(s)
 * @returns {boolean} Has required role
 */
export const hasRole = (userRole, requiredRoles) => {
  if (!userRole) return false;
  if (typeof requiredRoles === 'string') {
    return userRole === requiredRoles;
  }
  return requiredRoles.includes(userRole);
};

/**
 * Sort array of objects by a property
 * @param {Array} array - Array to sort
 * @param {string} property - Property to sort by
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export const sortBy = (array, property, direction = 'asc') => {
  return [...array].sort((a, b) => {
    let aVal = a[property];
    let bVal = b[property];
    
    // Handle dates
    if (aVal instanceof Date || (typeof aVal === 'string' && !isNaN(Date.parse(aVal)))) {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    // Handle strings (case insensitive)
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (direction === 'desc') {
      return bVal > aVal ? 1 : -1;
    }
    return aVal > bVal ? 1 : -1;
  });
};

/**
 * Filter array by search term
 * @param {Array} array - Array to filter
 * @param {string} searchTerm - Search term
 * @param {Array} searchFields - Fields to search in
 * @returns {Array} Filtered array
 */
export const filterBySearch = (array, searchTerm, searchFields) => {
  if (!searchTerm) return array;
  
  const term = searchTerm.toLowerCase();
  return array.filter(item => {
    return searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(term);
      }
      if (typeof value === 'number') {
        return value.toString().includes(term);
      }
      return false;
    });
  });
};

/**
 * Get priority badge class
 * @param {string} priority - Priority level
 * @returns {string} CSS class name
 */
export const getPriorityClass = (priority) => {
  const classes = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high',
    urgent: 'priority-urgent',
  };
  return classes[priority] || classes.medium;
};

/**
 * Get status badge class
 * @param {string} status - Status
 * @returns {string} CSS class name
 */
export const getStatusClass = (status) => {
  const classes = {
    active: 'status-active',
    pending: 'status-pending',
    approved: 'status-active',
    archived: 'status-archived',
    banned: 'status-banned',
    expired: 'status-archived',
  };
  return classes[status] || classes.pending;
};

/**
 * Get role badge class
 * @param {string} role - User role
 * @returns {string} CSS class name
 */
export const getRoleClass = (role) => {
  const classes = {
    admin: 'role-admin',
    teacher: 'role-teacher',
    student: 'role-student',
  };
  return classes[role] || classes.student;
};

/**
 * Handle API error and return user-friendly message
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred';
  
  // Network errors
  if (!error.response) {
    return 'Network error. Please check your connection.';
  }
  
  // HTTP errors
  const status = error.response?.status;
  const message = error.response?.data?.message || error.response?.data?.error;
  
  switch (status) {
    case 400:
      return message || 'Invalid request. Please check your input.';
    case 401:
      return 'You are not authorized. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 422:
      return message || 'Validation error. Please check your input.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return message || 'An unexpected error occurred.';
  }
};

/**
 * Download file from blob
 * @param {Blob} blob - File blob
 * @param {string} filename - Filename
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
};