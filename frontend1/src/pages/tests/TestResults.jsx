// pages/tests/TestResults.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { testService } from '../../services/testService';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';

const TestResults = () => {
  const { testId } = useParams();
  const { user } = useAuth();
  const [results, setResults] = useState(null);
  const [detailedResult, setDetailedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'detailed', 'analytics'

  useEffect(() => {
    fetchResults();
  }, [testId]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      if (user.role === 'student') {
        // Student view - get their own result
        const result = await testService.getTestResult(testId, user.id);
        setDetailedResult(result);
      } else {
        // Teacher/Admin view - get all student performance
        const performance = await testService.getStudentPerformance(testId);
        setResults(performance);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportResults = async () => {
    try {
      await testService.exportTestResults(testId);
    } catch (error) {
      alert('Error exporting results: ' + error.message);
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) return <Loading />;

  // Student View
  if (user.role === 'student' && detailedResult) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Results</h1>
          
          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 px-4 py-2 rounded-lg ${getGradeColor(detailedResult.summary.percentage)}`}>
                {detailedResult.summary.percentage}%
              </div>
              <p className="text-gray-600">Your Score</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {detailedResult.summary.correct_answers}/{detailedResult.summary.total_questions}
              </div>
              <p className="text-gray-600">Correct Answers</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {detailedResult.summary.time_taken_minutes}m
              </div>
              <p className="text-gray-600">Time Taken</p>
            </div>
          </div>

          {/* Grade */}
          <div className="text-center mb-8">
            <span className={`inline-block px-4 py-2 rounded-full text-lg font-semibold ${getGradeColor(detailedResult.summary.percentage)}`}>
              Grade: {detailedResult.summary.grade}
            </span>
          </div>

          {/* Detailed Answers */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Question Review</h2>
            {detailedResult.answers.map((answer, index) => (
              <div key={answer.question_id} className={`border rounded-lg p-4 ${
                answer.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900">
                    {index + 1}. {answer.question_text}
                  </h3>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    answer.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {answer.is_correct ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {['A', 'B', 'C', 'D'].map(option => (
                    <div key={option} className={`p-2 rounded ${
                      option === answer.correct_option ? 'bg-green-100 text-green-800' :
                      option === answer.selected_option && !answer.is_correct ? 'bg-red-100 text-red-800' :
                      'bg-white'
                    }`}>
                      {option}) {answer[`option_${option.toLowerCase()}`]}
                      {option === answer.correct_option && ' ✓ (Correct)'}
                      {option === answer.selected_option && option !== answer.correct_option && ' ✗ (Your answer)'}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Teacher/Admin View
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Test Results</h1>
        <div className="flex space-x-4">
          <Button variant="secondary" onClick={exportResults}>
            Export Results
          </Button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                viewMode === 'overview' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                viewMode === 'detailed' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'
              }`}
            >
              Detailed
            </button>
          </div>
        </div>
      </div>

      {results && (
        <>
          {/* Test Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{results.test_details.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{results.summary.total_submissions}</div>
                <p className="text-gray-600">Submissions</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{results.summary.average_score}%</div>
                <p className="text-gray-600">Average Score</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{results.summary.highest_score}%</div>
                <p className="text-gray-600">Highest Score</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{results.summary.lowest_score}%</div>
                <p className="text-gray-600">Lowest Score</p>
              </div>
            </div>
          </div>

          {/* Student Performance */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Student Performance</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {results.student_performance.map((student) => (
                <li key={student.student_id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            #{student.rank}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{student.student_name}</p>
                        <p className="text-sm text-gray-500">{student.student_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className={`font-semibold ${getGradeColor(student.percentage).split(' ')[0]}`}>
                          {student.percentage}%
                        </div>
                        <div className="text-gray-500">{student.score}/{student.total_questions}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{student.time_taken_minutes}m</div>
                        <div className="text-gray-500">Time</div>
                      </div>
                      <div className="text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(student.percentage)}`}>
                          {student.grade}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
export default TestResults;