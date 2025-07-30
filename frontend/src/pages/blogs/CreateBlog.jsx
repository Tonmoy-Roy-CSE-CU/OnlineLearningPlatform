// pages/blogs/CreateBlog.js
// Only keep:
import { useNavigate } from 'react-router-dom';
import BlogForm from '@/components/blogs/BlogForm';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // ✅ Adjusted path
import { blogService } from '../../services/blogService'; // ✅ You’re using blogService methods
import CommentSection from '../../components/blogs/CommentSection'; // ✅ Used at the bottom
import Loading from '../../components/common/Loading'; // ✅ For loading state
import Button from '../../components/common/Button'; // ✅ Used in Like button

export const CreateBlog = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/blogs');
  };

  const handleCancel = () => {
    navigate('/blogs');
  };

  return (
    <div>
      <BlogForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
};

// pages/blogs/BlogDetails.js
export const BlogDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const response = await blogService.getBlog(id);
      setBlog(response.blog);
      setLiked(response.blog.user_liked);
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await blogService.toggleLike(id);
      setLiked(!liked);
      // Refresh blog to get updated like count
      fetchBlog();
    } catch (error) {
      alert('Error liking blog: ' + error.message);
    }
  };

  const handleAddComment = async (blogId, content) => {
    await blogService.addComment(blogId, content);
    fetchBlog(); // Refresh to show new comment
  };

  const handleEditComment = async (commentId, content) => {
    await blogService.updateComment(commentId, content);
    fetchBlog(); // Refresh to show updated comment
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await blogService.deleteComment(commentId);
      fetchBlog(); // Refresh to remove deleted comment
    }
  };

  if (loading) return <Loading />;
  if (!blog) return <div>Blog not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <article className="bg-white rounded-lg shadow-md p-8">
        {/* Blog Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>By {blog.author_name}</span>
              <span>•</span>
              <span>{new Date(blog.created_at).toLocaleDateString()}</span>
              {blog.updated_at !== blog.created_at && (
                <>
                  <span>•</span>
                  <span>Updated {new Date(blog.updated_at).toLocaleDateString()}</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {blog.likes_count}
              </span>
              <span className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {blog.comments_count}
              </span>
            </div>
          </div>
        </header>

        {/* Blog Content */}
        <div className="prose max-w-none mb-8">
          <div className="whitespace-pre-wrap">{blog.content}</div>
        </div>

        {/* File Attachment */}
        {blog.file_path && (
          <div className="border-t border-gray-200 pt-6 mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Attachment</h3>
            <a
              href={blog.file_path}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Attachment
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleLike}
              variant={liked ? "primary" : "secondary"}
              size="sm"
            >
              <svg className="h-4 w-4 mr-1" fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {liked ? 'Liked' : 'Like'} ({blog.likes_count})
            </Button>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <CommentSection
        comments={blog.comments}
        blogId={blog.id}
        onAddComment={handleAddComment}
        onEditComment={handleEditComment}
        onDeleteComment={handleDeleteComment}
        userRole={user.role}
        currentUserId={user.id}
      />
    </div>
  );
};