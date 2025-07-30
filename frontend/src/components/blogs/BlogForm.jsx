// components/blogs/BlogForm.js
import React, { useState } from 'react';
import { blogService } from '../../services/blogService';
import Button from '../common/Button';
import Input from '../common/Input';

const BlogForm = ({ blog = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: blog?.title || '',
    content: blog?.content || '',
    status: blog?.status || 'published'
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('status', formData.status);
      
      if (file) {
        formDataToSend.append('file', file);
      }

      if (blog) {
        await blogService.updateBlog(blog.id, formDataToSend);
        alert('Blog updated successfully!');
      } else {
        await blogService.createBlog(formDataToSend);
        alert('Blog created successfully!');
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      alert(`Error ${blog ? 'updating' : 'creating'} blog: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {blog ? 'Edit Blog' : 'Create New Blog'}
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={() => setPreview(!preview)}
          >
            {preview ? 'Edit' : 'Preview'}
          </Button>
          {onCancel && (
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {!preview ? (
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter blog title"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write your blog content here..."
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                You can use markdown formatting
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach File (Optional)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                />
                {file && (
                  <p className="mt-1 text-sm text-gray-600">
                    Selected: {file.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <Button type="submit" loading={loading}>
              {blog ? 'Update Blog' : 'Create Blog'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="prose max-w-none">
          <h1>{formData.title}</h1>
          <div className="whitespace-pre-wrap">{formData.content}</div>
        </div>
      )}
    </div>
  );
};

export default BlogForm;