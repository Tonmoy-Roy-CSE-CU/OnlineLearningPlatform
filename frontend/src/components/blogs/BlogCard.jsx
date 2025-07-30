// components/blogs/BlogCard.js
export const BlogCard = ({ blog, onView, onEdit, onDelete, onLike, userRole, currentUserId }) => {
  const canEdit = userRole === 'admin' || blog.author_id === currentUserId;
  const canDelete = userRole === 'admin' || blog.author_id === currentUserId;

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600"
            onClick={() => onView(blog)}>
          {blog.title}
        </h3>
        <span className={`flex-shrink-0 ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(blog.status)}`}>
          {blog.status}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {blog.content.substring(0, 150)}...
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <span>By: {blog.author_name}</span>
          <span>{new Date(blog.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {blog.likes_count || 0}
          </span>
          <span className="flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {blog.comments_count || 0}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button size="sm" onClick={() => onView(blog)}>
            Read More
          </Button>
          {onLike && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onLike(blog.id)}
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Like
            </Button>
          )}
        </div>

        {(canEdit || canDelete) && (
          <div className="flex space-x-2">
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(blog)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(blog)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};