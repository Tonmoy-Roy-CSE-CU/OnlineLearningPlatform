import { apiRequest, handleApiError, handleApiSuccess } from './api';
import { API_ENDPOINTS, STORAGE_KEYS, SUCCESS_MESSAGES } from '@/utils/constants';

class AuthService {
  /**
   * Login user
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} User data and token
   */
  async login(credentials) {
    try {
      const response = await apiRequest.post(API_ENDPOINTS.LOGIN, credentials);
      
      if (response.token && response.user) {
        // Store auth data
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
        
        handleApiSuccess(SUCCESS_MESSAGES.LOGIN);
        return response;
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User full name
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.role - User role (student, teacher)
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    try {
      const response = await apiRequest.post(API_ENDPOINTS.REGISTER, userData);
      handleApiSuccess(SUCCESS_MESSAGES.REGISTER);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout() {
    try {
      // Clear stored auth data
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Get current user data from localStorage
   * @returns {Object|null} User data or null if not authenticated
   */
  getCurrentUser() {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get authentication token
   * @returns {string|null} Auth token or null
   */
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Is authenticated
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Check if user has specific role
   * @param {string|Array} roles - Required role(s)
   * @returns {boolean} Has required role
   */
  hasRole(roles) {
    const user = this.getCurrentUser();
    if (!user || !user.role) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  }

  /**
   * Check if user is admin
   * @returns {boolean} Is admin
   */
  isAdmin() {
    return this.hasRole('admin');
  }

  /**
   * Check if user is teacher
   * @returns {boolean} Is teacher
   */
  isTeacher() {
    return this.hasRole('teacher');
  }

  /**
   * Check if user is student
   * @returns {boolean} Is student
   */
  isStudent() {
    return this.hasRole('student');
  }

  /**
   * Check if user is teacher or admin
   * @returns {boolean} Is teacher or admin
   */
  isTeacherOrAdmin() {
    return this.hasRole(['teacher', 'admin']);
  }

  /**
   * Update user data in localStorage
   * @param {Object} userData - Updated user data
   */
  updateUserData(userData) {
    try {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  }
/**
 * Update user profile
 * @param {Object} updateData - Profile update data
 * @returns {Promise<Object>} Updated user data
 */
async updateProfile(updateData) {
  try {
    const response = await apiRequest.put(API_ENDPOINTS.UPDATE_PROFILE, updateData);
    
    // Update stored user data
    if (response.user) {
      this.updateUserData(response.user);
    }
    
    handleApiSuccess(SUCCESS_MESSAGES.PROFILE_UPDATE);
    return response;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
  /**
   * Refresh user session by validating token
   * @returns {Promise<boolean>} Is session valid
   */
  async refreshSession() {
    try {
      if (!this.isAuthenticated()) {
        return false;
      }

      // You can add a token validation endpoint here
      // For now, we'll just check if token exists
      return true;
    } catch (error) {
      console.error('Session refresh error:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Set up automatic token refresh
   * @param {Function} callback - Callback function for token expiry
   */
  setupTokenRefresh(callback) {
    // Check session every 5 minutes
    const interval = setInterval(async () => {
      const isValid = await this.refreshSession();
      if (!isValid && callback) {
        callback();
        clearInterval(interval);
      }
    }, 5 * 60 * 1000);

    return interval;
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService;