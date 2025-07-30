// components/tests/TestForm.js
import React, { useState } from 'react';
import { testService } from '../../services/testService';
import Button from '../common/Button';
import Input from '../common/Input';
import QuestionForm from './QuestionForm';

const TestForm = ({ onSuccess = () => {} }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_minutes: 10
  });

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const addQuestion = (question) => {
    setQuestions((prev) => [
      ...prev,
      { ...question, id: crypto.randomUUID?.() || Date.now() }
    ]);
  };

  const removeQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    setLoading(true);
    try {
      await testService.createTest({
        ...formData,
        questions: questions.map(({ id, ...q }) => q)
      });
      alert('Test created successfully!');
      onSuccess();
    } catch (error) {
      alert('Error creating test: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 1
                ? 'bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-600'
            }`}
          >
            1
          </div>
          <div
            className={`flex-1 h-1 mx-4 ${
              currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          ></div>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 2
                ? 'bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-600'
            }`}
          >
            2
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-600">Test Details</span>
          <span className="text-sm text-gray-600">Questions</span>
        </div>
      </div>

      {/* Step 1: Test Details */}
      {currentStep === 1 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Test Details</h2>
          <form onSubmit={(e) => { e.preventDefault(); setCurrentStep(2); }}>
            <div className="grid grid-cols-1 gap-6">
              <Input
                label="Test Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter test title"
              />

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter test description"
                />
              </div>

              <Input
                label="Duration (minutes)"
                name="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={handleInputChange}
                min="1"
                max="300"
                required
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="submit" disabled={!formData.title}>
                Next: Add Questions
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2: Add Questions */}
      {currentStep === 2 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add Questions</h2>
            <Button variant="secondary" onClick={() => setCurrentStep(1)}>
              Back to Details
            </Button>
          </div>

          <div className="mb-6">
            <QuestionForm onAddQuestion={addQuestion} />
          </div>

          {questions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Questions ({questions.length})
              </h3>
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {index + 1}. {question.question_text}
                        </h4>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>A) {question.option_a}</div>
                          <div>B) {question.option_b}</div>
                          <div>C) {question.option_c}</div>
                          <div>D) {question.option_d}</div>
                        </div>
                        <p className="mt-2 text-sm text-green-600">
                          Correct Answer: {question.correct_option}
                        </p>
                      </div>
                      <button
                        onClick={() => removeQuestion(question.id)}
                        className="ml-4 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentStep(1)}
              >
                Back
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={questions.length === 0}
              >
                Create Test
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TestForm;
