import { useState, useEffect, useCallback, useRef } from 'react';
import { isRequestCanceled } from '@/services/api';

/**
 * Custom hook for API operations with loading, error, and data management
 * @param {Function} apiFunction - API function to call
 * @param {Object} options - Hook options
 * @returns {Object} Hook state and methods
 */
const useApi = (apiFunction, options = {}) => {
  const {
    immediate = false,
    defaultData = null,
    onSuccess = null,
    onError = null,
    dependencies = [],
  } = options;

  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cancelTokenRef = useRef(null);

  // Execute API call
  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);

      // Cancel previous request if exists
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Request superseded');
      }

      const result = await apiFunction(...args);
      
      if (!isRequestCanceled(result)) {
        setData(result);
        if (onSuccess) {
          onSuccess(result);
        }
      }
      
      return result;
    } catch (err) {
      if (!isRequestCanceled(err)) {
        setError(err);
        if (onError) {
          onError(err);
        }
      }
      throw err;
    } finally {
      if (!isRequestCanceled(error)) {
        setLoading(false);
      }
    }
  }, [apiFunction, onSuccess, onError]);

  // Reset hook state
  const reset = useCallback(() => {
    setData(defaultData);
    setError(null);
    setLoading(false);
  }, [defaultData]);

  // Refresh data
  const refresh = useCallback(() => {
    if (dependencies.length > 0) {
      execute(...dependencies);
    }
  }, [execute, dependencies]);

  // Execute immediately if specified
  useEffect(() => {
    if (immediate) {
      execute(...dependencies);
    }

    // Cleanup function
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
    };
  }, [immediate, execute, ...dependencies]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    refresh,
  };
};

/**
 * Hook for paginated API calls
 * @param {Function} apiFunction - API function that supports pagination
 * @param {Object} options - Hook options
 * @returns {Object} Hook state and methods with pagination
 */
export const usePaginatedApi = (apiFunction, options = {}) => {
  const { pageSize = 10, ...otherOptions } = options;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const apiHook = useApi(apiFunction, {
    ...otherOptions,
    onSuccess: (result) => {
      if (result.pagination) {
        setTotalPages(result.pagination.total_pages || 0);
        setTotalItems(result.pagination.total_items || result.pagination.total_users || result.pagination.total_tests || 0);
        setHasNext(result.pagination.has_next || false);
        setHasPrev(result.pagination.has_prev || false);
      }
      if (otherOptions.onSuccess) {
        otherOptions.onSuccess(result);
      }
    },
  });

  // Load specific page
  const loadPage = useCallback((page) => {
    setCurrentPage(page);
    return apiHook.execute({ page, limit: pageSize });
  }, [apiHook.execute, pageSize]);

  // Load next page
  const loadNext = useCallback(() => {
    if (hasNext) {
      return loadPage(currentPage + 1);
    }
  }, [hasNext, currentPage, loadPage]);

  // Load previous page
  const loadPrev = useCallback(() => {
    if (hasPrev) {
      return loadPage(currentPage - 1);
    }
  }, [hasPrev, currentPage, loadPage]);

  // Load first page
  const loadFirst = useCallback(() => {
    return loadPage(1);
  }, [loadPage]);

  // Load last page
  const loadLast = useCallback(() => {
    if (totalPages > 0) {
      return loadPage(totalPages);
    }
  }, [totalPages, loadPage]);

  return {
    ...apiHook,
    currentPage,
    totalPages,
    totalItems,
    hasNext,
    hasPrev,
    pageSize,
    loadPage,
    loadNext,
    loadPrev,
    loadFirst,
    loadLast,
  };
};

/**
 * Hook for search functionality with debouncing
 * @param {Function} searchFunction - Search API function
 * @param {Object} options - Hook options
 * @returns {Object} Hook state and methods
 */
export const useSearch = (searchFunction, options = {}) => {
  const { debounceMs = 300, minLength = 2, ...otherOptions } = options;
  
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimeoutRef = useRef(null);

  // Debounce search query
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, debounceMs]);

  const apiHook = useApi(searchFunction, otherOptions);

  // Execute search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= minLength) {
      apiHook.execute({ search: debouncedQuery });
    } else if (debouncedQuery.length === 0) {
      apiHook.reset();
    }
  }, [debouncedQuery, minLength, apiHook.execute, apiHook.reset]);

  return {
    ...apiHook,
    query,
    setQuery,
    search: (newQuery) => setQuery(newQuery),
    clear: () => setQuery(''),
  };
};

/**
 * Hook for form submission with API integration
 * @param {Function} submitFunction - Submit API function
 * @param {Object} options - Hook options
 * @returns {Object} Hook state and methods
 */
export const useFormSubmit = (submitFunction, options = {}) => {
  const { onSuccess, onError, resetOnSuccess = false, ...otherOptions } = options;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const submit = useCallback(async (formData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      const result = await submitFunction(formData);
      
      setSubmitSuccess(true);
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      setSubmitError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [submitFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(false);
  }, []);

  return {
    submit,
    isSubmitting,
    submitError,
    submitSuccess,
    reset,
  };
};

export default useApi;