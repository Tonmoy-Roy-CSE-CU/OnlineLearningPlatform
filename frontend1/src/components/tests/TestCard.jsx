// components/tests/TestCard.js
export const TestCard = ({ test, onTakeTest, onViewResults, userRole }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{test.title}</h3>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          {test.duration_minutes} min
        </span>
      </div>
      
      {test.description && (
        <p className="text-gray-600 mb-4">{test.description}</p>
      )}
      
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span>Created: {new Date(test.created_at).toLocaleDateString()}</span>
        {test.questions_count && (
          <span>{test.questions_count} questions</span>
        )}
      </div>
      
      <div className="flex space-x-3">
        {userRole === 'student' && (
          <Button onClick={() => onTakeTest(test)} size="sm">
            Take Test
          </Button>
        )}
        {(userRole === 'teacher' || userRole === 'admin') && (
          <Button
            onClick={() => onViewResults(test)}
            variant="secondary"
            size="sm"
          >
            View Results
          </Button>
        )}
      </div>
    </div>
  );
};