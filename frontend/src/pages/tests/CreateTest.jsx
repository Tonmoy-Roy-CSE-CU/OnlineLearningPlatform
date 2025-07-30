// src/pages/tests/CreateTest.js - Create Test Page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { testService } from '../../services/testService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const CreateTest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    duration_minutes: 10,
    questions: [
      {
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A'
      }
    ]
  });

  const handleTestChange = (field, value) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...testData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setTestData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const addQuestion = () => {
    setTestData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question_text: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_option: 'A'
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    if (testData.questions.length > 1) {
      const updatedQuestions = testData.questions.filter((_, i) => i !== index);
      setTestData(prev => ({
        ...prev,
        questions: updatedQuestions
      }));
    }
  };

  const validateForm = () => {
    if (!testData.title.trim()) {
      setError('Test title is required');
      return false;
    }

    if (testData.questions.length === 0) {
      setError('At least one question is required');
      return false;
    }

    for (let i = 0; i < testData.questions.length; i++) {
      const q = testData.questions[i];
      if (!q.question_text.trim() || !q.option_a.trim() || !q.option_b.trim() || 
          !q.option_c.trim() || !q.option_d.trim()) {
        setError(`Question ${i + 1} is incomplete. All fields are required.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await testService.createTest(testData);
      navigate('/tests', { 
        state: { message: 'Test created successfully!' }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Test</h1>
        <p className="text-gray-600">
          Create a multiple-choice test for your students
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Test Details */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Details</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Input
                label="Test Title *"
                value={testData.title}
                onChange={(e) => handleTestChange('title', e.target.value)}
                placeholder="Enter test title"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="input-field min-h-[100px]"
                value={testData.description}
                onChange={(e) => handleTestChange('description', e.target.value)}
                placeholder="Enter test description (optional)"
                rows={4}
              />
            </div>
            
            <div>
              <Input
                type="number"
                label="Duration (minutes) *"
                value={testData.duration_minutes}
                onChange={(e) => handleTestChange('duration_minutes', parseInt(e.target.value))}
                min="1"
                max="300"
                required
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Questions ({testData.questions.length})
            </h2>
            <Button
              type="button"
              variant="outline"
              onClick={addQuestion}
            >
              Add Question
            </Button>
          </div>

          <div className="space-y-6">
            {testData.questions.map((question, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Question {index + 1}
                  </h3>
                  {testData.questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Input
                      label="Question Text *"
                      value={question.question_text}
                      onChange={(e) => handleQuestionChange(index, 'question_text', e.target.value)}
                      placeholder="Enter the question"
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Option A *"
                      value={question.option_a}
                      onChange={(e) => handleQuestionChange(index, 'option_a', e.target.value)}
                      placeholder="Enter option A"
                      required
                    />
                    
                    <Input
                      label="Option B *"
                      value={question.option_b}
                      onChange={(e) => handleQuestionChange(index, 'option_b', e.target.value)}
                      placeholder="Enter option B"
                      required
                    />
                    
                    <Input
                      label="Option C *"
                      value={question.option_c}
                      onChange={(e) => handleQuestionChange(index, 'option_c', e.target.value)}
                      placeholder="Enter option C"
                      required
                    />
                    
                    <Input
                      label="Option D *"
                      value={question.option_d}
                      onChange={(e) => handleQuestionChange(index, 'option_d', e.target.value)}
                      placeholder="Enter option D"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer *
                    </label>
                    <select
                      className="input-field"
                      value={question.correct_option}
                      onChange={(e) => handleQuestionChange(index, 'correct_option', e.target.value)}
                      required
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/tests')}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            className="btn-primary"
            loading={loading}
          >
            Create Test
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTest;