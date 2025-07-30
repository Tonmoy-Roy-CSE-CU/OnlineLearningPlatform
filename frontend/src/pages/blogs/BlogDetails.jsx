// src/pages/blogs/BlogDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { blogService } from '../../services/blogService';
import CommentSection from '../../components/blogs/CommentSection';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import { formatDate, truncateText } from '../../utils/formatters';
import { 
  FaHeart, 
  FaRegHeart, 
  FaComment,
  FaEdit,
  FaTrash,
  FaDownload,
  FaUser,
  FaCalendarAlt,
  FaEye,
  FaShare,
  FaArrowLeft
} from 'react-icons/fa';

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liking, setLiking] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Fetch blog details
  useEffect(() => {
    fetchBlogDetails();
  }, [id]);

  const fetchBlogDetails = async () => {
    try {
      setLoading(true);
      const response = await blogService.getBlogById(id);
      setBlog(response.data.blog);
      setError('');
    } catch (err) {
      console.error('Error fetching blog:', err);
      setError(err.response?.data?.error || 'Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  // Handle like/unlike
  const handleLike = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    try {
      setLiking(true);
      const response = await blogService.toggleLike(id);
      
      // Update blog state with new like status
      setBlog(prev => ({
        ...prev,
        user_liked: response.data.liked,
        likes_count: response.data.likes_count
      }));
    } catch (err) {
      console.error('Error toggling like:', err);
      alert('Failed to update like status');
    } finally {
      setLiking(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await blogService.deleteBlog(id);
      navigate('/blogs');
    } catch (err) {
      console.error('Error deleting blog:', err);
      alert('Failed to delete blog post');
      setDeleting(false);
    }
  };

  // Handle file download
  const handleDownload = () => {
    if (blog.file_path) {
      const link = document.createElement('a');
      link.href = `${import.meta.env.VITE_API_BASE_URL}${blog.file_path}`;
      link.download = blog.file_path.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle share
  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
    setShowShareModal(false);
  };

  // Check if user can edit/delete
  const canEdit = user && (user.id === blog?.author_id || user.role === 'admin');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <Button onClick={() => navigate('/blogs')} variant="outline">
            <FaArrowLeft className="mr-2" />
            Back to Blogs
          </Button>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">Blog post not found</div>
          <Button onClick={() => navigate('/blogs')} variant="outline">
            <FaArrowLeft className="mr-2" />
            Back to Blogs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Actions */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              onClick={() => navigate('/blogs')} 
              variant="outline"
              size="sm"
            >
              <FaArrowLeft className="mr-2" />
              Back to Blogs
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
              >
                <FaShare className="mr-2" />
                Share
              </Button>
              
              {canEdit && (
                <>
                  <Button
                    onClick={() => navigate(`/blogs/edit/${id}`)}
                    variant="outline"
                    size="sm"
                  >
                    <FaEdit className="mr-2" />
                    Edit
                  </Button>
                  
                  <Button
                    onClick={() => setShowDeleteModal(true)}
                    variant="danger"
                    size="sm"
                  >
                    <FaTrash className="mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Blog Header */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <FaUser className="mr-2" />
                <span>{blog.author_name}</span>
                <span className="ml-1 px-2 py-1 bg-gray-100 rounded text-xs">
                  {blog.author_role}
                </span>
              </div>
              
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2" />
                <span>{formatDate(blog.created_at)}</span>
              </div>

              {blog.updated_at !== blog.created_at && (
                <div className="flex items-center">
                  <FaEdit className="mr-2" />
                  <span>Updated {formatDate(blog.updated_at)}</span>
                </div>
              )}

              <div className="flex items-center">
                <FaEye className="mr-2" />
                <span>{blog.comments_count} comments</span>
              </div>
            </div>

            {/* Status Badge */}
            {blog.status !== 'published' && (
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  blog.status === 'draft' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                </span>
              </div>
            )}

            {/* File Attachment */}
            {blog.file_path && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaDownload className="text-blue-500 mr-2" />
                    <span className="text-sm text-blue-700">
                      Attachment: {blog.file_path.split('/').pop()}
                    </span>
                  </div>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="sm"
                  >
                    Download
                  </Button>
                </div>
              </div>
            )}

            {/* Blog Content */}
            <div className="prose max-w-none mb-8">
              <div 
                className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                style={{ wordBreak: 'break-word' }}
              >
                {blog.content}
              </div>
            </div>

            {/* Engagement Actions */}
            <div className="flex items-center gap-4 pt-6 border-t">
              <Button
                onClick={handleLike}
                disabled={liking || !user}
                variant={blog.user_liked ? "primary" : "outline"}
                size="sm"
                className="transition-all duration-200"
              >
                {blog.user_liked ? (
                  <FaHeart className="mr-2 text-red-500" />
                ) : (
                  <FaRegHeart className="mr-2" />
                )}
                {blog.likes_count} {blog.likes_count === 1 ? 'Like' : 'Likes'}
              </Button>

              <div className="flex items-center text-gray-600">
                <FaComment className="mr-2" />
                <span>{blog.comments_count} {blog.comments_count === 1 ? 'Comment' : 'Comments'}</span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          {user ? (
            <CommentSection blogId={id} />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 mb-4">
                Please log in to view and post comments
              </p>
              <Button onClick={() => navigate('/auth/login')}>
                Login to Comment
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Blog Post"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this blog post? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-4">
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="outline"
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="danger"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Blog Post"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">Share this blog post:</p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 w-20">URL:</span>
              <div className="flex-1 flex">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 p-2 border rounded-l text-sm"
                />
                <Button
                  onClick={() => copyToClipboard(window.location.href)}
                  variant="outline"
                  size="sm"
                  className="rounded-l-none"
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 w-20">Title:</span>
              <div className="flex-1 flex">
                <input
                  type="text"
                  value={blog.title}
                  readOnly
                  className="flex-1 p-2 border rounded-l text-sm"
                />
                <Button
                  onClick={() => copyToClipboard(blog.title)}
                  variant="outline"
                  size="sm"
                  className="rounded-l-none"
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 w-20">Share:</span>
              <div className="flex gap-2">
                <Button
                  onClick={() => copyToClipboard(`Check out this blog post: "${blog.title}" ${window.location.href}`)}
                  variant="outline"
                  size="sm"
                >
                  Copy Share Text
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BlogDetails;