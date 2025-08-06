// src/pages/notes/NotesPage.js - Notes Management Page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notesService } from '../../services/notesService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';

const NotesPage = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, note: null });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await notesService.getAllNotes();
      setNotes(response.notes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (noteId, title) => {
    try {
      const blob = await notesService.downloadNote(noteId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.pdf`; // You might want to get the actual filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteClick = (note) => {
    setDeleteModal({ isOpen: true, note });
  };

  const confirmDelete = async () => {
    const { note } = deleteModal;
    try {
      setDeleting(note.id);
      await notesService.deleteNote(note.id);
      setNotes(prev => prev.filter(n => n.id !== note.id));
      setDeleteModal({ isOpen: false, note: null });
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEdit = (note) => {
    return user?.role === 'admin' || user?.id === note.uploaded_by;
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-600 mt-1">
            Study materials and resources shared by teachers
          </p>
        </div>
        
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <Link to="/notes/upload">
            <Button className="btn-primary">
              Upload Notes
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No notes available</div>
          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <Link to="/notes/upload">
              <Button className="btn-primary">
                Upload First Notes
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                    {note.title}
                  </h3>
                  
                  {note.has_file && (
                    <div className="ml-2 flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {note.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {note.description}
                  </p>
                )}

                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <div className="flex items-center">
                    <span className="font-medium">Uploaded by:</span>
                    <span className="ml-2">{note.uploaded_by_name}</span>
                    <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {note.uploader_role}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium">Date:</span>
                    <span className="ml-2">{formatDate(note.uploaded_at)}</span>
                  </div>
                  
                  {note.file_name && (
                    <div className="flex items-center">
                      <span className="font-medium">File:</span>
                      <span className="ml-2 truncate">{note.file_name}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    {note.has_file && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(note.id, note.title)}
                      >
                        Download
                      </Button>
                    )}
                    
                    <Link to={`/notes/${note.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>

                  {canEdit(note) && (
                    <div className="flex space-x-1">
                      <Link to={`/notes/${note.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Button>
                      </Link>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteClick(note)}
                        loading={deleting === note.id}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, note: null })}
        title="Delete Note"
        type="confirm"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete <strong>"{deleteModal.note?.title}"</strong>?
          This action cannot be undone.
        </p>
        
        {deleteModal.note?.has_file && (
          <p className="text-amber-600 text-sm mb-4">
            ⚠️ The associated file will also be permanently deleted.
          </p>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setDeleteModal({ isOpen: false, note: null })}
          >
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={confirmDelete}
            loading={deleting === deleteModal.note?.id}
          >
            Delete Note
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default NotesPage;