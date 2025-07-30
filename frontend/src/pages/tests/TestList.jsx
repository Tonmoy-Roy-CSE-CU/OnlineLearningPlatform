// src/pages/tests/TestList.js - Test List Page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { testService } from '../../services/testService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const TestList = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await testService.getAllTests();
      setTests(response.tests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tests</h1>
        {user?.role === 'teacher' && (
          <Link to="/tests/create">
            <Button className="btn-primary">
              Create New Test
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {tests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No tests available</div>
          {user?.role === 'teacher' && (
            <Link to="/tests/create">
              <Button className="btn-primary">
                Create Your First Test
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <div key={test.id} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {test.title}
                </h3>
                
                {test.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {test.description}
                  </p>
                )}

                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <span className="font-medium">Duration:</span>
                    <span className="ml-2">{test.duration_minutes} minutes</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium">Questions:</span>
                    <span className="ml-2">{test.question_count || 0}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium">Created:</span>
                    <span className="ml-2">{formatDate(test.created_at)}</span>
                  </div>
                  
                  {test.teacher_name && (
                    <div className="flex items-center">
                      <span className="font-medium">Teacher:</span>
                      <span className="ml-2">{test.teacher_name}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  {user?.role === 'student' ? (
                    <Link to={`/tests/${test.test_link}`} className="flex-1">
                      <Button className="btn-primary w-full">
                        Take Test
                      </Button>
                    </Link>
                  ) : (
                    <div className="flex space-x-2 flex-1">
                      <Link to={`/tests/${test.id}/results`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Results
                        </Button>
                      </Link>
                      
                      {user?.id === test.teacher_id && (
                        <Link to={`/tests/${test.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestList;