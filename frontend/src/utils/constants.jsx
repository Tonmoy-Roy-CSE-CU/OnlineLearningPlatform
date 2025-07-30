// src/utils/constants.js - Fixed API constants to match backend routes
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  PROFILE: '/api/auth/profile',
  UPDATE_PROFILE: '/api/auth/profile',
  
  // Test endpoints (matching your backend routes with /api prefix)
  TESTS: '/api/tests',
  CREATE_TEST: '/api/tests/create',
  SUBMIT_TEST: '/api/tests/:testId/submit',
  TEST_RESULTS: '/api/tests/:testId/result/:studentId',
  MY_RESULTS: '/api/tests/my/results',
  TEST_ANALYTICS: '/api/tests/my/analytics',
  STUDENT_PERFORMANCE: '/api/tests/:testId/students/performance',
  TEST_COMPARISON: '/api/tests/:testId/comparison',
  TEST_EXPORT: '/api/tests/:testId/export',
  DETAILED_RESULT: '/api/tests/submission/:submissionId/detailed',
  COMPREHENSIVE_ANALYTICS: '/api/tests/admin/comprehensive-analytics',
  
  // Notes endpoints (matching your backend routes)
  NOTES: '/api/notes',
  UPLOAD_NOTE: '/api/notes/upload',
  DOWNLOAD_NOTE: '/api/notes/:id/download',
  
  // Blog endpoints (matching your backend routes)
  BLOGS: '/api/blogs',
  CREATE_BLOG: '/api/blogs/create',
  MY_BLOGS: '/api/blogs/my/blogs',
  BLOG_LIKE: '/api/blogs/:id/like',
  BLOG_LIKES: '/api/blogs/:id/likes',
  BLOG_COMMENTS: '/api/blogs/:id/comments',
  BLOG_COMMENT_UPDATE: '/api/blogs/comments/:commentId',
  BLOG_STATS: '/api/blogs/admin/stats',
  
  // Notice endpoints
  NOTICES: '/api/notices',
  CREATE_NOTICE: '/api/notices/create',
  MY_NOTICES: '/api/notices/my/notices',
  NOTICE_READ: '/api/notices/:id/read',
  UNREAD_COUNT: '/api/notices/my/unread-count',
  
  // Admin endpoints
  ADMIN_STATS: '/api/admin/dashboard/stats',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_CONTENT: '/api/admin/content',
  ADMIN_ANALYTICS: '/api/admin/analytics',
  SYSTEM_HEALTH: '/api/admin/system/health',
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

// User status
export const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  BANNED: 'banned',
};

// Test configuration
export const TEST_CONFIG = {
  MIN_QUESTIONS: 1,
  MAX_QUESTIONS: 50,
  MIN_DURATION: 1, // minutes
  MAX_DURATION: 180, // minutes
  DEFAULT_DURATION: 10,
  OPTION_LABELS: ['A', 'B', 'C', 'D'],
};

// Blog configuration
export const BLOG_CONFIG = {
  MAX_TITLE_LENGTH: 200,
  MAX_CONTENT_LENGTH: 10000,
  STATUSES: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
  },
};

// Notice configuration
export const NOTICE_CONFIG = {
  PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },
  TARGET_AUDIENCES: {
    ALL: 'all',
    STUDENTS: 'students',
    TEACHERS: 'teachers',
  },
  STATUSES: {
    ACTIVE: 'active',
    ARCHIVED: 'archived',
    EXPIRED: 'expired',
  },
};

// File upload configuration
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    TEXT: ['text/plain', 'text/markdown'],
    ALL: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'],
  },
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  ITEMS_PER_PAGE_OPTIONS: [5, 10, 20, 50],
};

// Toast notification types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'olpm_auth_token',
  USER_DATA: 'olpm_user_data',
  THEME: 'olpm_theme',
  LANGUAGE: 'olpm_language',
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  INPUT_WITH_TIME: 'yyyy-MM-dd\'T\'HH:mm',
  API: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx',
};

// Grade thresholds
export const GRADE_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  AVERAGE: 40,
  NEEDS_IMPROVEMENT: 0,
};

// Grade labels
export const GRADE_LABELS = {
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  AVERAGE: 'Average',
  NEEDS_IMPROVEMENT: 'Needs Improvement',
};

// Colors for charts and visualizations
export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#06b6d4',
  GRAY: '#6b7280',
};

// Navigation menu items
export const NAVIGATION_ITEMS = {
  STUDENT: [
    { name: 'Dashboard', path: '/dashboard', icon: 'Home' },
    { name: 'Tests', path: '/tests', icon: 'FileText' },
    { name: 'My Results', path: '/results', icon: 'BarChart3' },
    { name: 'Notes', path: '/notes', icon: 'BookOpen' },
    { name: 'Blogs', path: '/blogs', icon: 'PenTool' },
    { name: 'Notices', path: '/notices', icon: 'Bell' },
  ],
  TEACHER: [
    { name: 'Dashboard', path: '/dashboard', icon: 'Home' },
    { name: 'My Tests', path: '/tests', icon: 'FileText' },
    { name: 'Create Test', path: '/tests/create', icon: 'Plus' },
    { name: 'Analytics', path: '/analytics', icon: 'BarChart3' },
    { name: 'Notes', path: '/notes', icon: 'BookOpen' },
    { name: 'Blogs', path: '/blogs', icon: 'PenTool' },
    { name: 'Notices', path: '/notices', icon: 'Bell' },
  ],
  ADMIN: [
    { name: 'Dashboard', path: '/dashboard', icon: 'Home' },
    { name: 'User Management', path: '/admin/users', icon: 'Users' },
    { name: 'Content Management', path: '/admin/content', icon: 'FolderOpen' },
    { name: 'Analytics', path: '/admin/analytics', icon: 'BarChart3' },
    { name: 'System Health', path: '/admin/system', icon: 'Activity' },
    { name: 'All Tests', path: '/tests', icon: 'FileText' },
    { name: 'All Notes', path: '/notes', icon: 'BookOpen' },
    { name: 'All Blogs', path: '/blogs', icon: 'PenTool' },
    { name: 'All Notices', path: '/notices', icon: 'Bell' },
  ],
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type.',
  REQUIRED_FIELD: 'This field is required.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  REGISTER: 'Registration successful!',
  TEST_CREATED: 'Test created successfully!',
  TEST_SUBMITTED: 'Test submitted successfully!',
  NOTE_UPLOADED: 'Note uploaded successfully!',
  BLOG_CREATED: 'Blog post created successfully!',
  BLOG_UPDATED: 'Blog post updated successfully!',
  NOTICE_CREATED: 'Notice created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
};

// Regular expressions for validation
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[\d\s-()]+$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
};