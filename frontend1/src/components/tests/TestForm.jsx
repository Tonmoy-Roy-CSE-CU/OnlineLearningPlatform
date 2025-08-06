// components/test/TestForm.jsx
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useForm } from '../../hooks/useForm';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

const TestForm = ({ onSubmit, loading, error, onCancel }) => {
  const initialValues = {
    title: '',
    description: '',
    duration_minutes: 30,
    questions: [{
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A'
    }]
  };

  const validationRules = {
    title: { required: true, message: 'Title is required' },
    description: { required: true, message: 'Description is required' },
    duration_minutes: { 
      required: true, 
      custom: (value) => value > 0 ? '' : 'Duration must be greater than 0'
    }
  };

  const { values, errors, handleChange, handleBlur, validateAll } = useForm(initialValues, validationRules);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate questions
    const questionsValid = values.questions.every(q => 
      q.question_text && q.option_a && q.option_b && q.option_c && q.option_d
    );
    
    if (!questionsValid) {
      alert('Please fill in all question fields');
      return;
    }

    if (validateAll()) {
      await onSubmit(values);
    }
  };

  const addQuestion = () => {
    const newQuestions = [...values.questions, {
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A'
    }];
    handleChange('questions', newQuestions);
  };

  const removeQuestion = (index) => {
    if (values.questions.length > 1) {
      const newQuestions = values.questions.filter((_, i) => i !== index);
      handleChange('questions', newQuestions);
    }
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = values.questions.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    );
    handleChange('questions', newQuestions);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold mb-4">Create New Test</h3>
      
      <ErrorMessage error={error} className="mb-4" />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={values.title}
              onChange={(e) => handleChange('title', e.target.value)}
              onBlur={() => handleBlur('title')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter test title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes) *
            </label>
            <input
              type="number"
              value={values.duration_minutes}
              onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value))}
              onBlur={() => handleBlur('duration_minutes')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
            {errors.duration_minutes && (
              <p className="text-red-500 text-sm mt-1">{errors.duration_minutes}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={values.description}
            onChange={(e) => handleChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Enter test description"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Questions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium">Questions</h4>
            <Button
              type="button"
              variant="outline"
              size="small"
              icon={Plus}
              onClick={addQuestion}
            >
              Add Question
            </Button>
          </div>

          <div className="space-y-6">
            {values.questions.map((question, index) => (
              <QuestionEditor
                key={index}
                question={question}
                index={index}
                onUpdate={updateQuestion}
                onRemove={() => removeQuestion(index)}
                canRemove={values.questions.length > 1}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Create Test
          </Button>
        </div>
      </form>
    </div>
  );
};

// Question Editor Component
const QuestionEditor = ({ question, index, onUpdate, onRemove, canRemove }) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h5 className="font-medium">Question {index + 1}</h5>
        {canRemove && (
          <Button
            type="button"
            variant="outline"
            size="small"
            icon={Trash2}
            onClick={onRemove}
            className="text-red-600 hover:text-red-800"
          >
            Remove
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Text *
          </label>
          <textarea
            value={question.question_text}
            onChange={(e) => onUpdate(index, 'question_text', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            placeholder="Enter question text"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['A', 'B', 'C', 'D'].map(option => (
            <div key={option}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Option {option} *
              </label>
              <input
                type="text"
                value={question[`option_${option.toLowerCase()}`]}
                onChange={(e) => onUpdate(index, `option_${option.toLowerCase()}`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Option ${option}`}
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correct Answer *
          </label>
          <select
            value={question.correct_option}
            onChange={(e) => onUpdate(index, 'correct_option', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TestForm;