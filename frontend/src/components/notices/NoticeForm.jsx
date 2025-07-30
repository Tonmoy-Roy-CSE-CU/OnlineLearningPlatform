// components/notices/NoticeForm.js
import React, { useState } from 'react';
import { noticeService } from '../../services/noticeService';
import Button from '../common/Button';
import Input from '../common/Input';

const NoticeForm = ({ notice = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: notice?.title || '',
    content: notice?.content || '',
    priority: notice?.priority || 'medium',
    target_audience: notice?.target_audience || 'all',
    expires_at: notice?.expires_at ? notice.expires_at.split('T')[0] : ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        expires_at: formData.expires_at || null
      };

      if (notice) {
        await noticeService.updateNotice(notice.id, dataToSend);
        alert('Notice updated successfully!');
      } else {
        await noticeService.createNotice(dataToSend);
        alert('Notice created successfully!');
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      alert(`Error ${notice ? 'updating' : 'creating'} notice: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {notice ? 'Edit Notice' : 'Create New Notice'}
        </h2>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Enter notice title"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter notice content"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${getPriorityColor(formData.priority)}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <select
                name="target_audience"
                value={formData.target_audience}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Users</option>
                <option value="students">Students Only</option>
                <option value="teachers">Teachers Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              name="expires_at"
              value={formData.expires_at}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave empty for notices that don't expire
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <Button type="submit" loading={loading}>
            {notice ? 'Update Notice' : 'Create Notice'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NoticeForm;