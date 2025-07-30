// components/notices/NoticeCard.js
export const NoticeCard = ({ notice, onView, onEdit, onDelete, onMarkRead, userRole, currentUserId, isRead }) => {
  const canEdit = userRole === 'admin' || notice.author_id === currentUserId;
  const canDelete = userRole === 'admin' || notice.author_id === currentUserId;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'high':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const isExpired = notice.expires_at && new Date(notice.expires_at) < new Date();

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 ${
      isRead ? 'opacity-75' : ''
    } ${
      isExpired ? 'border-l-gray-400' : 
      notice.priority === 'urgent' ? 'border-l-red-500' :
      notice.priority === 'high' ? 'border-l-orange-500' :
      notice.priority === 'medium' ? 'border-l-yellow-500' :
      'border-l-green-500'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className={`text-lg font-semibold cursor-pointer hover:text-blue-600 ${
              isRead ? 'text-gray-600' : 'text-gray-900'
            }`} onClick={() => onView(notice)}>
              {notice.title}
            </h3>
            {!isRead && (
              <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
            )}
          </div>
          
          <div className="flex items-center space-x-3 mb-3">
            <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full border ${getPriorityColor(notice.priority)}`}>
              {getPriorityIcon(notice.priority)}
              <span className="ml-1 capitalize">{notice.priority}</span>
            </span>
            
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
              {notice.target_audience}
            </span>
            
            {isExpired && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                Expired
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {notice.content.substring(0, 200)}...
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <span>By: {notice.author_name}</span>
          <span>{new Date(notice.posted_at).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-2">
          {notice.expires_at && (
            <span>
              Expires: {new Date(notice.expires_at).toLocaleDateString()}
            </span>
          )}
          <span className="flex items-center">
            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {notice.view_count || 0}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button size="sm" onClick={() => onView(notice)}>
            Read More
          </Button>
          {!isRead && onMarkRead && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onMarkRead(notice.id)}
            >
              Mark as Read
            </Button>
          )}
        </div>

        {(canEdit || canDelete) && (
          <div className="flex space-x-2">
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(notice)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(notice)}
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