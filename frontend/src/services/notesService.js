// src/services/notesService.js - Fixed Notes Service API Layer
import { apiRequest } from './api';

export const notesService = {
  // Upload/Create new note
  uploadNote: async (formData) => {
    return apiRequest.upload('/notes/upload', formData);
  },

  // Get all notes
  getAllNotes: async () => {
    return apiRequest.get('/notes');
  },

  // Alternative method name for compatibility
  getNotes: async () => {
    return notesService.getAllNotes();
  },

  // Get specific note by ID
  getNoteById: async (noteId) => {
    return apiRequest.get(`/notes/${noteId}`);
  },

  // Download note file
  downloadNote: async (noteId) => {
    try {
      return await apiRequest.download(`/notes/${noteId}/download`);
    } catch (error) {
      throw new Error('Download failed: ' + error.message);
    }
  },

  // Update note (only by uploader or admin)
  updateNote: async (noteId, data) => {
    return apiRequest.put(`/notes/${noteId}`, data);
  },

  // Delete note (only by uploader or admin)
  deleteNote: async (noteId) => {
    return apiRequest.delete(`/notes/${noteId}`);
  },

  // Prepare form data for note upload
  prepareFormData: (noteData, file = null) => {
    const formData = new FormData();
    
    formData.append('title', noteData.title);
    
    if (noteData.description) {
      formData.append('description', noteData.description);
    }
    
    if (file) {
      formData.append('file', file);
    }
    
    return formData;
  },

  // Validate note data
  validateNoteData: (noteData) => {
    const errors = [];
    
    if (!noteData.title || noteData.title.trim().length === 0) {
      errors.push('Title is required');
    }
    
    if (noteData.title && noteData.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }
    
    if (noteData.description && noteData.description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
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
      'text/plain',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (file && file.size > maxSize) {
      errors.push('File size must be less than 10MB');
    }
    
    if (file && !allowedTypes.includes(file.type)) {
      errors.push('File type not supported. Please use images, PDFs, documents, or presentations.');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Format note data for display
  formatNoteData: (note) => {
    return {
      ...note,
      formatted_uploaded_at: new Date(note.uploaded_at).toLocaleDateString(),
      has_file: !!note.file_path,
      file_name: note.file_path ? note.file_path.split('/').pop() : null,
      file_extension: note.file_path ? note.file_path.split('.').pop().toLowerCase() : null
    };
  },

  // Get file icon based on file type
  getFileIcon: (fileName) => {
    if (!fileName) return 'document';
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'document-text';
      case 'doc':
      case 'docx':
        return 'document';
      case 'ppt':
      case 'pptx':
        return 'presentation-chart-bar';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'photograph';
      case 'txt':
        return 'document-text';
      default:
        return 'document';
    }
  }
};