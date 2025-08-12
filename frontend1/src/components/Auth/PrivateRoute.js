import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Auth Context
const AuthContext = createContext();

// Auth Actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  TOKEN_VALIDATION_START: 'TOKEN_VALIDATION_START',
  TOKEN_VALIDATION_SUCCESS: 'TOKEN_VALIDATION_SUCCESS',
  TOKEN_VALIDATION_FAILURE: 'TOKEN_VALIDATION_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial State
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.TOKEN_VALIDATION_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.TOKEN_VALIDATION_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.TOKEN_VALIDATION_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// API utility function
const apiCall = async (endpoint, options = {}) => {
  const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';
  const url = `${baseUrl}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Validate token on app initialization
  useEffect(() => {
    validateStoredToken();
  }, []);

  const validateStoredToken = async () => {
    dispatch({ type: AUTH_ACTIONS.TOKEN_VALIDATION_START });
    
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (!savedToken || !savedUser) {
        throw new Error('No stored credentials found');
      }

      // Verify token with backend
      await apiCall('/api/auth/verify', {
        method: 'GET',
        headers: { 
          Authorization: `Bearer ${savedToken}` 
        }
      });

      const userData = JSON.parse(savedUser);
      dispatch({
        type: AUTH_ACTIONS.TOKEN_VALIDATION_SUCCESS,
        payload: { token: savedToken, user: userData }
      });
    } catch (error) {
      console.error('Token validation failed:', error);
      // Clear invalid tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({
        type: AUTH_ACTIONS.TOKEN_VALIDATION_FAILURE,
        payload: 'Session expired. Please log in again.',
      });
    }
  };

  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const { token, user } = response;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { token, user },
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please try again.';

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      // If registration is successful but requires approval
      if (response.requiresApproval) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: response.message,
        });
        return { success: true, requiresApproval: true, message: response.message };
      }

      // If auto-approved, log them in
      const { token, user } = response;
      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { token, user },
        });
      }

      return { success: true, message: response.message };
    } catch (error) {
      const errorMessage = error.message || 'Registration failed. Please try again.';

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const hasRole = (roles) => {
    if (!state.user) return false;
    return Array.isArray(roles) 
      ? roles.includes(state.user.role) 
      : state.user.role === roles;
  };

  // API call helper with automatic token attachment
  const authenticatedApiCall = async (endpoint, options = {}) => {
    if (!state.token) {
      throw new Error('No authentication token available');
    }

    try {
      return await apiCall(endpoint, {
        ...options,
        headers: {
          Authorization: `Bearer ${state.token}`,
          ...options.headers,
        },
      });
    } catch (error) {
      // If we get a 401 or 403, the token is invalid
      if (error.message.includes('401') || error.message.includes('403')) {
        logout();
      }
      throw error;
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    hasRole,
    validateStoredToken,
    authenticatedApiCall,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;