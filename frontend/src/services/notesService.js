// src/services/notesService.js - Fixed to match backend routes
import { apiRequest, handleApiError, handleApiSuccess } from './api';

export const notesService = {
  // Upload/Create new note
  uploadNote: async (noteData) => {
    try {
      const formData = new FormData();
      formData.append('title', noteData.title);
      
      if (noteData.description) {
        formData.append('description', noteData.description);
      }
      
      if (noteData.file) {
        formData.append('file', noteData.file);
      }

      const response = await apiRequest.upload('/api/notes/upload', formData);
      handleApiSuccess('Note uploaded successfully');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get all notes
  getNotes: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/api/notes?${queryString}` : '/api/notes';
      return await apiRequest.get(url);
    } catch (error) {
      console.error('Error fetching notes:', error);
      return { notes: [] }; // Return empty array to prevent crashes
    }
  },

  // Get specific note by ID
  getNoteById: async (noteId) => {
    try {
      return await apiRequest.get(`/api/notes/${noteId}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Download note file
  downloadNote: async (noteId, filename = null) => {
    try {
      return await apiRequest.download(`/api/notes/${noteId}/download`, filename);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Update note
  updateNote: async (noteId, noteData) => {
    try {
      const response = await apiRequest.put(`/api/notes/${noteId}`, noteData);
      handleApiSuccess('Note updated successfully');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Delete note
  deleteNote: async (noteId) => {
    try {
      const response = await apiRequest.delete(`/api/notes/${noteId}`);
      handleApiSuccess('Note deleted successfully');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Search notes
  searchNotes: async (searchTerm, params = {}) => {
    try {
      const searchParams = {
        search: searchTerm,
        ...params
      };
      const queryString = new URLSearchParams(searchParams).toString();
      return await apiRequest.get(`/api/notes?${queryString}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get notes by uploader (for teachers to see their own notes)
  getNotesByUploader: async (uploaderId, params = {}) => {
    try {
      const searchParams = {
        uploader: uploaderId,
        ...params
      };
      const queryString = new URLSearchParams(searchParams).toString();
      return await apiRequest.get(`/api/notes?${queryString}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get my uploaded notes (current user)
  getMyNotes: async (params = {}) => {
    try {
      // Since there's no specific endpoint, we'll use the general notes endpoint
      // The backend should filter based on the authenticated user
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/api/notes?${queryString}` : '/api/notes';
      const response = await apiRequest.get(url);
      
      // Filter notes by current user if needed (though backend should handle this)
      return response;
    } catch (error) {
      console.error('Error fetching my notes:', error);
      return { notes: [] };
    }
  },

  // Bulk upload notes (if you want to add this feature)
  bulkUploadNotes: async (notesArray) => {
    try {
      const uploadPromises = notesArray.map(noteData => this.uploadNote(noteData));
      const results = await Promise.allSettled(uploadPromises);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      handleApiSuccess(`Bulk upload completed: ${successful} successful, ${failed} failed`);
      
      return {
        successful,
        failed,
        results
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Get notes statistics (for dashboard)
  getNotesStats: async () => {
    try {
      // This would need to be implemented in the backend
      // For now, we'll get all notes and calculate stats on the frontend
      const response = await apiRequest.get('/api/notes');
      const notes = response.notes || [];
      
      return {
        total_notes: notes.length,
        my_notes: notes.filter(note => note.uploaded_by === 'current_user_id').length, // This needs proper user ID
        recent_notes: notes.filter(note => {
          const uploadDate = new Date(note.uploaded_at);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return uploadDate > weekAgo;
        }).length
      };
    } catch (error) {
      console.error('Error fetching notes stats:', error);
      return {
        total_notes: 0,
        my_notes: 0,
        recent_notes: 0
      };
    }
  }
};

export default notesService;