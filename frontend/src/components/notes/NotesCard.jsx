// components/notes/NotesCard.js
export const NotesCard = ({ note, onDownload, onEdit, onDelete, userRole, currentUserId }) => {
  const canEdit = userRole === 'admin' || note.uploaded_by === currentUserId;
  const canDelete = userRole === 'admin' || note.uploaded_by === currentUserId;

  const handleDownload = () => {
    if (note.has_file && onDownload) {
      onDownload(note.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {note.title}
        </h3>
        {note.has_file && (
          <span className="flex-shrink-0 ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            File
          </span>
        )}
      </div>

      {note.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {note.description}
        </p>
      )}

      <div className="text-xs text-gray-500 mb-4">
        <div className="flex justify-between items-center">
          <span>By: {note.uploaded_by_name}</span>
          <span>{new Date(note.uploaded_at).toLocaleDateString()}</span>
        </div>
        {note.uploader_role && (
          <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {note.uploader_role}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {note.has_file && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDownload}
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download
            </Button>
          )}
        </div>

        {(canEdit || canDelete) && (
          <div className="flex space-x-2">
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(note)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(note)}
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

