// components/admin/ContentModeration.js
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

export const ContentModeration = () => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tests');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await adminService.getContent();
      setContent(response);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (type, id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await adminService.deleteContent(type, id);
        alert('Content deleted successfully');
        fetchContent();
      } catch (error) {
        alert('Error deleting content: ' + error.message);
      }
    }
  };

  const tabs = [
    { id: 'tests', name: 'Tests', count: content.tests?.length || 0 },
    { id: 'notes', name: 'Notes', count: content.notes?.length || 0 },
    { id: 'blogs', name: 'Blogs', count: content.blogs?.length || 0 },
    { id: 'notices', name: 'Notices', count: content.notices?.length || 0 }
  ];

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Content Moderation</h2>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Content List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {content[activeTab] && content[activeTab].length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {content[activeTab].map((item) => (
              <li key={item.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.description || item.content_preview || 'No description'}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400 mt-2">
                      <span>By: {item.creator_name || item.uploader_name || item.author_name || item.poster_name}</span>
                      <span>Created: {new Date(item.created_at || item.uploaded_at || item.posted_at).toLocaleDateString()}</span>
                      {item.question_count && <span>Questions: {item.question_count}</span>}
                      {item.submission_count && <span>Submissions: {item.submission_count}</span>}
                      {item.comment_count && <span>Comments: {item.comment_count}</span>}
                      {item.has_file && <span className="text-green-600">Has File</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteContent(activeTab.slice(0, -1), item.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No {activeTab} found</p>
          </div>
        )}
      </div>
    </div>
  );
};