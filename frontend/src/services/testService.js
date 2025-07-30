// src/services/testService.js - Fixed to match backend routes
import { apiRequest, buildUrl, buildQueryString, handleApiError, handleApiSuccess } from './api';

class TestService {
  /**
   * Create a new test
   * @param {Object} testData - Test data
   * @returns {Promise<Object>} Created test
   */
  async createTest(testData) {
    try {
      const response = await apiRequest.post('/api/tests/create', testData);
      handleApiSuccess('Test created successfully');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get test by link
   * @param {string} link - Test link
   * @returns {Promise<Object>} Test data
   */
  async getTestByLink(link) {
    try {
      const response = await apiRequest.get(`/api/tests/${link}`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Submit test answers
   * @param {string} testId - Test ID
   * @param {Object} submissionData - Submission data
   * @returns {Promise<Object>} Test result
   */
  async submitTest(testId, submissionData) {
    try {
      const response = await apiRequest.post(`/api/tests/${testId}/submit`, submissionData);
      handleApiSuccess('Test submitted successfully');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get student's test results
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Test results
   */
  async getMyResults(filters = {}) {
    try {
      const queryString = buildQueryString(filters);
      const response = await apiRequest.get(`/api/tests/my/results${queryString}`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get tests created by the logged-in teacher
   * This is a workaround since your backend doesn't have a specific "my tests" endpoint
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Tests list
   */
  async getMyTests(filters = {}) {
    try {
      // Since your backend doesn't have a dedicated "my tests" endpoint,
      // we'll get all tests and filter on the frontend or you'll need to add this endpoint
      const queryString = buildQueryString(filters);
      const response = await apiRequest.get(`/api/tests${queryString}`);
      
      // Return in expected format for compatibility
      return {
        tests: response.tests || response || [],
        ...response
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get all tests (for admin/teacher view)
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Tests list
   */
  async getAllTests(filters = {}) {
    try {
      const queryString = buildQueryString(filters);
      const response = await apiRequest.get(`/api/tests${queryString}`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get test result by test and student ID
   * @param {string} testId - Test ID
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Test result
   */
  async getTestResult(testId, studentId) {
    try {
      const response = await apiRequest.get(`/api/tests/${testId}/result/${studentId}`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get detailed result for a specific submission
   * @param {string} submissionId - Submission ID
   * @returns {Promise<Object>} Detailed result
   */
  async getDetailedResult(submissionId) {
    try {
      const response = await apiRequest.get(`/api/tests/submission/${submissionId}/detailed`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get teacher's test analytics
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Analytics data
   */
  async getTestAnalytics(filters = {}) {
    try {
      const queryString = buildQueryString(filters);
      const response = await apiRequest.get(`/api/tests/my/analytics${queryString}`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get student performance for a specific test (teacher view)
   * @param {string} testId - Test ID
   * @returns {Promise<Object>} Student performance data
   */
  async getStudentPerformance(testId) {
    try {
      const response = await apiRequest.get(`/api/tests/${testId}/students/performance`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get performance comparison for a test
   * @param {string} testId - Test ID
   * @returns {Promise<Object>} Comparison data
   */
  async getTestComparison(testId) {
    try {
      const response = await apiRequest.get(`/api/tests/${testId}/comparison`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Export test results as CSV
   * @param {string} testId - Test ID
   * @returns {Promise<boolean>} Export success
   */
  async exportTestResults(testId) {
    try {
      await apiRequest.download(`/api/tests/${testId}/export`, `test_${testId}_results.csv`);
      handleApiSuccess('Test results exported successfully');
      return true;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get comprehensive analytics (admin only)
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Comprehensive analytics
   */
  async getComprehensiveAnalytics(filters = {}) {
    try {
      const queryString = buildQueryString(filters);
      const response = await apiRequest.get(`/api/tests/admin/comprehensive-analytics${queryString}`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Update test (if endpoint exists in backend)
   * @param {string} testId - Test ID
   * @param {Object} testData - Updated test data
   * @returns {Promise<Object>} Updated test
   */
  async updateTest(testId, testData) {
    try {
      const response = await apiRequest.put(`/api/tests/${testId}`, testData);
      handleApiSuccess('Test updated successfully');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Delete test (if endpoint exists in backend)
   * @param {string} testId - Test ID
   * @returns {Promise<Object>} Delete confirmation
   */
  async deleteTest(testId) {
    try {
      const response = await apiRequest.delete(`/api/tests/${testId}`);
      handleApiSuccess('Test deleted successfully');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Validate test data before submission
   * @param {Object} testData - Test data to validate
   * @returns {Object} Validation result
   */
  validateTestData(testData) {
    const errors = {};

    // Title validation
    if (!testData.title || testData.title.trim().length === 0) {
      errors.title = 'Test title is required';
    } else if (testData.title.trim().length > 200) {
      errors.title = 'Test title must be less than 200 characters';
    }

    // Duration validation
    if (!testData.duration_minutes || testData.duration_minutes < 1) {
      errors.duration_minutes = 'Test duration must be at least 1 minute';
    } else if (testData.duration_minutes > 180) {
      errors.duration_minutes = 'Test duration cannot exceed 180 minutes';
    }

    // Questions validation
    if (!testData.questions || !Array.isArray(testData.questions)) {
      errors.questions = 'Questions are required';
    } else if (testData.questions.length === 0) {
      errors.questions = 'At least one question is required';
    } else {
      // Validate each question
      testData.questions.forEach((question, index) => {
        const questionErrors = this.validateQuestion(question, index);
        if (Object.keys(questionErrors).length > 0) {
          errors[`question_${index}`] = questionErrors;
        }
      });
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate individual question
   * @param {Object} question - Question data
   * @param {number} index - Question index
   * @returns {Object} Question validation errors
   */
  validateQuestion(question, index) {
    const errors = {};

    if (!question.question_text || question.question_text.trim().length === 0) {
      errors.question_text = `Question ${index + 1}: Question text is required`;
    }

    if (!question.option_a || question.option_a.trim().length === 0) {
      errors.option_a = `Question ${index + 1}: Option A is required`;
    }

    if (!question.option_b || question.option_b.trim().length === 0) {
      errors.option_b = `Question ${index + 1}: Option B is required`;
    }

    if (!question.option_c || question.option_c.trim().length === 0) {
      errors.option_c = `Question ${index + 1}: Option C is required`;
    }

    if (!question.option_d || question.option_d.trim().length === 0) {
      errors.option_d = `Question ${index + 1}: Option D is required`;
    }

    if (!question.correct_option || !['A', 'B', 'C', 'D'].includes(question.correct_option)) {
      errors.correct_option = `Question ${index + 1}: Valid correct option is required`;
    }

    return errors;
  }

  /**
   * Calculate test statistics
   * @param {Array} submissions - Test submissions
   * @returns {Object} Test statistics
   */
  calculateTestStats(submissions) {
    if (!submissions || submissions.length === 0) {
      return {
        totalSubmissions: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0
      };
    }

    const scores = submissions.map(s => s.percentage || 0);
    const passThreshold = 60; // 60% pass threshold
    const passCount = scores.filter(score => score >= passThreshold).length;

    return {
      totalSubmissions: submissions.length,
      averageScore: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      passRate: Math.round((passCount / submissions.length) * 100)
    };
  }
}

// Create singleton instance
const testService = new TestService();
export default testService;