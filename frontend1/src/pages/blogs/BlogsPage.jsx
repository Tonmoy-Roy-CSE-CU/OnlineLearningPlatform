// src/pages/blogs/BlogsPage.js - Blogs Page
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { blogService } from '../../services/blogService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';

const BlogsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'published',
    author_id: '',
    page: 1
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchBlogs();
  }, [filters]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await blogService.getAllBlogs(params);
      setBlogs(response.blogs || []);
      setPagination(response.pagination || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchBlogs();
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleLike = async (blogId) => {
    try {
      const response = await blogService.toggleLike(blogId);
      
      // Update the blog in the list
      setBlogs(prev => prev.map(blog => 
        blog.id === blogId 
          ? { 
              ...blog, 
              likes_count: response.likes_count,
              user_liked: response.liked 
            }
          : blog
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading && blogs.length === 0) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blogs</h1>
          <p className="text-gray-600 mt-1">
            Share knowledge and experiences with the community
          </p>
        </div>
        
        <Link to="/blogs/create">
          <Button className="btn-primary">
            Write Blog Post
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
          <Button type="submit" loading={loading}>
            Search
          </Button>
        </form>

        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="input-field"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          {user?.role === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author
              </label>
              <select
                className="input-field"
                value={filters.author_id}
                onChange={(e) => handleFilterChange('author_id', e.target.value)}
              >
                <option value="">All Authors</option>
                {/* You would populate this with actual authors */}
              </select>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Blog Posts */}
      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            {searchTerm ? 'No blogs found matching your search' : 'No blog posts available'}
          </div>
          <Link to="/blogs/create">
            <Button className="btn-primary">
              Write Your First Blog Post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {blogs.map((blog) => (
            <article key={blog.id} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link 
                      to={`/blogs/${blog.id}`}
                      className="block group"
                    >
                      <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                        {blog.title}
                      </h2>
                    </Link>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold text-sm">
                            {blog.author_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{blog.author_name}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(blog.created_at)}</span>
                          <span className="mx-2">•</span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            {blog.author_role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {blog.status !== 'published' && (
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      blog.status === 'draft' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {blog.status.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    {truncateContent(blog.content)}
                  </p>
                </div>

                {blog.file_path && (
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      Has attachment
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleLike(blog.id)}
                      className={`flex items-center space-x-2 text-sm transition-colors ${
                        blog.user_liked 
                          ? 'text-red-600 hover:text-red-700' 
                          : 'text-gray-500 hover:text-red-600'
                      }`}
                    >
                      <svg className={`w-5 h-5 ${blog.user_liked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{blog.likes_count || 0}</span>
                    </button>

                    <Link
                      to={`/blogs/${blog.id}`}
                      className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{blog.comments_count || 0} Comments</span>
                    </Link>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link to={`/blogs/${blog.id}`}>
                      <Button variant="outline" size="sm">
                        Read More
                      </Button>
                    </Link>

                    {(user?.id === blog.author_id || user?.role === 'admin') && (
                      <Link to={`/blogs/${blog.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={!pagination.has_prev}
          >
            Previous
          </Button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
              const page = i + 1;
              const isActive = page === pagination.current_page;
              
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm rounded ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={!pagination.has_next}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlogsPage;