// src/components/blogs/CommentSection.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { blogService } from '../../services/blogService';
import Button from '../common/Button';
import Loading from '../common/Loading';
import Modal from '../common/Modal';
import { formatDate } from '../../utils/formatters';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaEdit, 
  FaTrash, 
  FaReply,
  FaSave,
  FaTimes
} from 'react-icons/fa';

const CommentSection = ({ blogId }) => {
  const { user } = useAuth();
  
  // State management
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    has_next: false
  });

  // Fetch comments
  useEffect(() => {
    fetchComments();
  }, [blogId]);

  const fetchComments = async (page = 1) => {
    try {
      setLoading(true);
      const response = await blogService.getComments(blogId, { page, limit: 10 });
      
      if (page === 1) {
        setComments(response.data.comments);
      } else {
        setComments(prev => [...prev, ...response.data.comments]);
      }
      
      setPagination(response.data.pagination);
      setError('');
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  // Handle new comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await blogService.addComment(blogId, {
        content: newComment.trim()
      });

      // Add new comment to the list
      const newCommentData = {
        id: response.data.comment.id,
        content: response.data.comment.content,
        created_at: response.data.comment.created_at,
        updated_at: response.data.comment.created_at,
        commenter_name: user.name,
        commenter_role: user.role,
        commenter_id: user.id
      };

      setComments(prev => [newCommentData, ...prev]);
      setNewComment('');
      setError('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err.response?.data?.error || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle comment editing
  const startEdit = (comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) {
      return;
    }

    try {
      await blogService.updateComment(commentId, {
        content: editContent.trim()
      });

      // Update comment in the list
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: editContent.trim(), updated_at: new Date().toISOString() }
          : comment
      ));

      setEditingComment(null);
      setEditContent('');
      setError('');
    } catch (err) {
      console.error('Error updating comment:', err);
      setError(err.response?.data?.error || 'Failed to update comment');
    }
  };

  // Handle comment deletion
  const confirmDelete = (comment) => {
    setCommentToDelete(comment);
    setShowDeleteModal(true);
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      setDeleting(true);
      await blogService.deleteComment(commentToDelete.id);

      // Remove comment from the list
      setComments(prev => prev.filter(comment => comment.id !== commentToDelete.id));
      setShowDeleteModal(false);
      setCommentToDelete(null);
      setError('');
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(err.response?.data?.error || 'Failed to delete comment');
    } finally {
      setDeleting(false);
    }
  };

  // Load more comments
  const loadMoreComments = () => {
    if (pagination.has_next) {
      fetchComments(pagination.current_page + 1);
    }
  };

  // Check if user can edit/delete comment
  const canEditComment = (comment) => {
    return user && (user.id === comment.commenter_id || user.role === 'admin');
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b">
        <h3 className="text-xl font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      {user && (
        <div className="p-6 border-b bg-gray-50">
          <form onSubmit={handleSubmitComment}>
            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting || !newComment.trim()}
                loading={submitting}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Comments List */}
      <div className="p-6">
        {loading && comments.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loading />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                {/* Comment Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                      <FaUser className="text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">
                        {comment.commenter_name}
                      </span>
                      <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                        {comment.commenter_role}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <FaCalendarAlt className="mr-1" />
                      <span>{formatDate(comment.created_at)}</span>
                      {comment.updated_at !== comment.created_at && (
                        <span className="ml-2 text-xs">(edited)</span>
                      )}
                    </div>
                  </div>

                  {/* Comment Actions */}
                  {canEditComment(comment) && (
                    <div className="flex items-center gap-2">
                      {editingComment === comment.id ? (
                        <>
                          <Button
                            onClick={() => handleUpdateComment(comment.id)}
                            variant="primary"
                            size="sm"
                            disabled={!editContent.trim()}
                          >
                            <FaSave className="mr-1" />
                            Save
                          </Button>
                          <Button
                            onClick={cancelEdit}
                            variant="outline"
                            size="sm"
                          >
                            <FaTimes className="mr-1" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => startEdit(comment)}
                            variant="outline"
                            size="sm"
                          >
                            <FaEdit className="mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => confirmDelete(comment)}
                            variant="danger"
                            size="sm"
                          >
                            <FaTrash className="mr-1" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Comment Content */}
                <div className="ml-8">
                  {editingComment === comment.id ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {pagination.has_next && (
              <div className="text-center pt-4">
                <Button
                  onClick={loadMoreComments}
                  variant="outline"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Comments'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Comment"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this comment? This action cannot be undone.
          </p>
          
          {commentToDelete && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 italic">
                "{commentToDelete.content.length > 100 
                  ? commentToDelete.content.substring(0, 100) + '...' 
                  : commentToDelete.content}"
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-4">
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="outline"
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteComment}
              variant="danger"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Comment'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CommentSection;