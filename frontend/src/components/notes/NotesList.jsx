// components/notes/NotesList.js
import NotesCard from './NotesCard'; // if not already imported
export const NotesList = ({ notes, onDownload, onEdit, onDelete, userRole, currentUserId }) => {
  if (!notes || notes.length === 0) {
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No notes found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by uploading your first note.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {notes.map((note) => (
        <NotesCard
          key={note.id}
          note={note}
          onDownload={onDownload}
          onEdit={onEdit}
          onDelete={onDelete}
          userRole={userRole}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
};
