// src/services/blogService.js - Fixed to match backend routes
import { apiRequest } from './api';

export const blogService = {
  // ===== BLOG CRUD OPERATIONS =====
  
  // Get all blogs with filters and pagination
  getBlogs: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.author_id) queryParams.append('author_id', params.author_id);
    if (params.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    return apiRequest.get(`/blogs${queryString ? '?' + queryString : ''}`);
  },

  // Get specific blog by ID
  getBlogById: async (id) => {
    return apiRequest.get(`/blogs/${id}`);
  },

  // Create new blog post
  createBlog: async (formData) => {
    return apiRequest.upload('/blogs/create', formData);
  },

  // Update existing blog post
  updateBlog: async (id, formData) => {
    return apiRequest.upload(`/blogs/${id}`, formData);
  },

  // Delete blog post
  deleteBlog: async (id) => {
    return apiRequest.delete(`/blogs/${id}`);
  },

  // ===== BLOG ENGAGEMENT =====
  
  // Toggle like/unlike on blog post
  toggleLike: async (blogId) => {
    return apiRequest.post(`/blogs/${blogId}/like`);
  },

  // Get likes for a blog post
  getLikes: async (blogId) => {
    return apiRequest.get(`/blogs/${blogId}/likes`);
  },

  // ===== COMMENT OPERATIONS =====
  
  // Add comment to blog post
  addComment: async (blogId, commentData) => {
    return apiRequest.post(`/blogs/${blogId}/comments`, commentData);
  },

  // Get comments for a blog post
  getComments: async (blogId, params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const queryString = queryParams.toString();
    return apiRequest.get(`/blogs/${blogId}/comments${queryString ? '?' + queryString : ''}`);
  },

  // Update comment
  updateComment: async (commentId, commentData) => {
    return apiRequest.put(`/blogs/comments/${commentId}`, commentData);
  },

  // Delete comment
  deleteComment: async (commentId) => {
    return apiRequest.delete(`/blogs/comments/${commentId}`);
  },

  // ===== USER BLOG OPERATIONS =====
  
  // Get current user's own blogs (all statuses)
  getMyBlogs: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    return apiRequest.get(`/blogs/my/blogs${queryString ? '?' + queryString : ''}`);
  },

  // ===== ADMIN OPERATIONS =====
  
  // Get blog statistics (admin only)
  getBlogStats: async () => {
    return apiRequest.get('/blogs/admin/stats');
  },

  // ===== UTILITY FUNCTIONS =====
  
  // Format blog data for display
  formatBlogData: (blog) => {
    return {
      ...blog,
      formatted_created_at: new Date(blog.created_at).toLocaleDateString(),
      formatted_updated_at: new Date(blog.updated_at).toLocaleDateString(),
      content_preview: blog.content.length > 200 
        ? blog.content.substring(0, 200) + '...' 
        : blog.content,
      has_attachment: !!blog.file_path,
      attachment_name: blog.file_path ? blog.file_path.split('/').pop() : null,
      is_draft: blog.status === 'draft',
      is_published: blog.status === 'published',
      is_archived: blog.status === 'archived'
    };
  },

  // Prepare form data for blog creation/update
  prepareFormData: (blogData, file = null) => {
    const formData = new FormData();
    
    formData.append('title', blogData.title);
    formData.append('content', blogData.content);
    
    if (blogData.status) {
      formData.append('status', blogData.status);
    }
    
    if (file) {
      formData.append('file', file);
    }
    
    return formData;
  },

  // Validate blog data
  validateBlogData: (blogData) => {
    const errors = [];
    
    if (!blogData.title || blogData.title.trim().length === 0) {
      errors.push('Title is required');
    }
    
    if (blogData.title && blogData.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }
    
    if (!blogData.content || blogData.content.trim().length === 0) {
      errors.push('Content is required');
    }
    
    if (blogData.content && blogData.content.length > 50000) {
      errors.push('Content must be less than 50,000 characters');
    }
    
    if (blogData.status && !['draft', 'published', 'archived'].includes(blogData.status)) {
      errors.push('Invalid status');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Check file upload constraints
  validateFile: (file) => {
    const errors = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'text/markdown'
    ];
    
    if (file && file.size > maxSize) {
      errors.push('File size must be less than 10MB');
    }
    
    if (file && !allowedTypes.includes(file.type)) {
      errors.push('File type not supported. Please use images, PDFs, or documents.');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // ===== SEARCH AND FILTER HELPERS =====
  
  // Build search parameters
  buildSearchParams: (filters) => {
    const params = {};
    
    if (filters.search && filters.search.trim()) {
      params.search = filters.search.trim();
    }
    
    if (filters.status && filters.status !== 'all') {
      params.status = filters.status;
    }
    
    if (filters.author_id) {
      params.author_id = filters.author_id;
    }
    
    if (filters.page && filters.page > 1) {
      params.page = filters.page;
    }
    
    if (filters.limit && filters.limit !== 10) {
      params.limit = filters.limit;
    }
    
    return params;
  },

  // Get blog status options
  getStatusOptions: () => [
    { value: 'all', label: 'All Statuses' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' }
  ],

  // ===== ERROR HANDLING =====
  
  // Handle API errors
  handleApiError: (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return data.error || 'Invalid request';
        case 401:
          return 'Please log in to continue';
        case 403:
          return 'You do not have permission to perform this action';
        case 404:
          return 'Blog post not found';
        case 413:
          return 'File too large';
        case 500:
          return 'Server error. Please try again later';
        default:
          return data.error || 'An error occurred';
      }
    } else if (error.request) {
      // Network error
      return 'Network error. Please check your connection';
    } else {
      // Other error
      return 'An unexpected error occurred';
    }
  },

  // ===== SOCIAL FEATURES =====
  
  // Share blog post
  shareBlog: (blog) => {
    const shareData = {
      title: blog.title,
      text: blog.content.substring(0, 200) + '...',
      url: `${window.location.origin}/blogs/${blog.id}`
    };
    
    if (navigator.share) {
      return navigator.share(shareData);
    } else {
      // Fallback to clipboard
      const shareText = `${shareData.title}\n\n${shareData.text}\n\nRead more: ${shareData.url}`;
      return navigator.clipboard.writeText(shareText);
    }
  },

  // Generate blog excerpt
  generateExcerpt: (content, maxLength = 200) => {
    if (content.length <= maxLength) {
      return content;
    }
    
    // Find the last complete word within the limit
    const truncated = content.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return truncated.substring(0, lastSpace) + '...';
  },

  // Calculate reading time
  calculateReadingTime: (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    
    return readingTime === 1 ? '1 min read' : `${readingTime} mins read`;
  }
};

export default blogService;