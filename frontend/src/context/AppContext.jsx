// context/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AppContext = createContext();

// App reducer for managing global app state
const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_NOTIFICATION':
      return {
        ...state,
        notification: action.payload
      };
    case 'CLEAR_NOTIFICATION':
      return {
        ...state,
        notification: null
      };
    case 'SET_SIDEBAR_OPEN':
      return {
        ...state,
        sidebarOpen: action.payload
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload
      };
    case 'SET_UNREAD_NOTICES':
      return {
        ...state,
        unreadNotices: action.payload
      };
    case 'INCREMENT_UNREAD_NOTICES':
      return {
        ...state,
        unreadNotices: state.unreadNotices + 1
      };
    case 'DECREMENT_UNREAD_NOTICES':
      return {
        ...state,
        unreadNotices: Math.max(0, state.unreadNotices - 1)
      };
    default:
      return state;
  }
};

const initialAppState = {
  loading: false,
  error: null,
  notification: null,
  sidebarOpen: true,
  theme: 'light',
  unreadNotices: 0
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  const { user } = useAuth();

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', state.theme);
  }, [state.theme]);

  // Auto-clear notifications after 5 seconds
  useEffect(() => {
    if (state.notification) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_NOTIFICATION' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.notification]);

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const showNotification = (message, type = 'info') => {
    dispatch({ 
      type: 'SET_NOTIFICATION', 
      payload: { message, type, id: Date.now() } 
    });
  };

  const clearNotification = () => {
    dispatch({ type: 'CLEAR_NOTIFICATION' });
  };

  const toggleSidebar = () => {
    dispatch({ type: 'SET_SIDEBAR_OPEN', payload: !state.sidebarOpen });
  };

  const setSidebarOpen = (open) => {
    dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open });
  };

  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  const setTheme = (theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const setUnreadNotices = (count) => {
    dispatch({ type: 'SET_UNREAD_NOTICES', payload: count });
  };

  const incrementUnreadNotices = () => {
    dispatch({ type: 'INCREMENT_UNREAD_NOTICES' });
  };

  const decrementUnreadNotices = () => {
    dispatch({ type: 'DECREMENT_UNREAD_NOTICES' });
  };

  const value = {
    ...state,
    setLoading,
    setError,
    clearError,
    showNotification,
    clearNotification,
    toggleSidebar,
    setSidebarOpen,
    toggleTheme,
    setTheme,
    setUnreadNotices,
    incrementUnreadNotices,
    decrementUnreadNotices
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};