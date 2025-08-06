// src/services/blogService.js - Fixed to match backend routes
import { apiRequest, handleApiError, handleApiSuccess } from './api';

export const blogService = {
  // Create new blog post
  createBlog: async (blogData) => {
    try {
      const formData = new FormData();
      formData.append('title', blogData.title);
      formData.append('content', blogData.content);
      
      if (blogData.status) {
        formData.append('status', blogData.status);
      }
      
      if (blogData.file) {
        formData.append('file', blogData.file);
      }

      const response = await apiRequest.upload('/api/blogs/create', formData);
      handleApiSuccess('Blog post created successfully');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get all blog posts
  getBlogs: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/api/blogs?${queryString}` : '/api/blogs';
      return await apiRequest.get(url);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      return { blogs: [] }; // Return empty array to prevent crashes
    }
  },

  // Get specific blog post by ID
  getBlogById: async (blogId) => {
    try {
      return await apiRequest.get(`/api/blogs/${blogId}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get user's own blogs
  getMyBlogs: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/api/blogs/my/blogs?${queryString}` : '/api/blogs/my/blogs';
      return await apiRequest.get(url);
    } catch (error) {
      console.error('Error fetching my blogs:', error);
      return { blogs: [] }; // Return empty array to prevent crashes
    }
  },

  // Update blog post
  updateBlog: async (blogId, blogData) => {
    try {
      const formData = new FormData();
      formData.append('title', blogData.title);
      formData.append('content', blogData.content);
      
      if (blogData.status) {
        formData.append('status', blogData.status);
      }
      
      if (blogData.file) {
        formData.append('file', blogData.file);
      }

      const response = await apiRequest.upload(`/api/blogs/${blogId}`, formData);
      handleApiSuccess('Blog post updated successfully');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Delete blog post
  deleteBlog: async (blogId) => {
    try {
      const response = await apiRequest.delete(`/api/blogs/${blogId}`);
      handleApiSuccess('Blog post deleted successfully');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Like/Unlike blog post
  toggleBlogLike: async (blogId) => {
    try {
      const response = await apiRequest.post(`/api/blogs/${blogId}/like`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get blog likes
  getBlogLikes: async (blogId) => {
    try {
      return await apiRequest.get(`/api/blogs/${blogId}/likes`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Add comment to blog post
  addComment: async (blogId, content) => {
    try {
      const response = await apiRequest.post(`/api/blogs/${blogId}/comments`, { content });
      handleApiSuccess('Comment added successfully');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get comments for a blog post
  getBlogComments: async (blogId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/api/blogs/${blogId}/comments?${queryString}` : `/api/blogs/${blogId}/comments`;
      return await apiRequest.get(url);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Update comment
  updateComment: async (commentId, content) => {
    try {
      const response = await apiRequest.put(`/api/blogs/comments/${commentId}`, { content });
      handleApiSuccess('Comment updated successfully');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Delete comment
  deleteComment: async (commentId) => {
    try {
      const response = await apiRequest.delete(`/api/blogs/comments/${commentId}`);
      handleApiSuccess('Comment deleted successfully');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Search blogs
  searchBlogs: async (searchTerm, params = {}) => {
    try {
      const searchParams = {
        search: searchTerm,
        ...params
      };
      return await this.getBlogs(searchParams);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get blogs by author
  getBlogsByAuthor: async (authorId, params = {}) => {
    try {
      const searchParams = {
        author_id: authorId,
        ...params
      };
      return await this.getBlogs(searchParams);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get blog statistics (admin only)
  getBlogStats: async () => {
    try {
      return await apiRequest.get('/api/blogs/admin/stats');
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get popular blogs (most liked/commented)
  getPopularBlogs: async (params = {}) => {
    try {
      const searchParams = {
        sort: 'popular',
        ...params
      };
      return await this.getBlogs(searchParams);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get recent blogs
  getRecentBlogs: async (params = {}) => {
    try {
      const searchParams = {
        sort: 'recent',
        limit: 10,
        ...params
      };
      return await this.getBlogs(searchParams);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get blog drafts (user's own drafts)
  getMyDrafts: async (params = {}) => {
    try {
      const searchParams = {
        status: 'draft',
        ...params
      };
      return await this.getMyBlogs(searchParams);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Publish draft
  publishBlog: async (blogId) => {
    try {
      const response = await apiRequest.put(`/api/blogs/${blogId}`, { status: 'published' });
      handleApiSuccess('Blog published successfully');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Archive blog
  archiveBlog: async (blogId) => {
    try {
      const response = await apiRequest.put(`/api/blogs/${blogId}`, { status: 'archived' });
      handleApiSuccess('Blog archived successfully');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};

export default blogService;