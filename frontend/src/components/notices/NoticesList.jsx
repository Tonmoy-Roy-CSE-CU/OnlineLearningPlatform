// components/notices/NoticesList.js
export const NoticesList = ({ notices, onView, onEdit, onDelete, onMarkRead, userRole, currentUserId, readStatus = {} }) => {
  if (!notices || notices.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No notices found</h3>
        <p className="mt-1 text-sm text-gray-500">There are no notices to display at the moment.</p>
      </div>
    );
  }

  // Group notices by priority for better organization
  const groupedNotices = notices.reduce((acc, notice) => {
    const priority = notice.priority;
    if (!acc[priority]) {
      acc[priority] = [];
    }
    acc[priority].push(notice);
    return acc;
  }, {});

  const priorityOrder = ['urgent', 'high', 'medium', 'low'];

  return (
    <div className="space-y-8">
      {priorityOrder.map(priority => {
        if (!groupedNotices[priority] || groupedNotices[priority].length === 0) {
          return null;
        }

        return (
          <div key={priority}>
            <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">
              {priority} Priority ({groupedNotices[priority].length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedNotices[priority].map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onMarkRead={onMarkRead}
                  userRole={userRole}
                  currentUserId={currentUserId}
                  isRead={readStatus[notice.id]?.read || false}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};