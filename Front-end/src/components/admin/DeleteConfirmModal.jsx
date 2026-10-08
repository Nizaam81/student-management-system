import React, { useState } from 'react';
import { Trash2, X } from 'lucide-react';

export const DeleteConfirmModal = ({ student, onCancel, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-student-title"
        className="relative w-full max-w-md bg-zinc-950 border border-zinc-700 rounded-3xl p-6 shadow-2xl overflow-hidden"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition disabled:opacity-50"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-700 text-white">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 id="delete-student-title" className="text-lg font-bold text-white">
              Delete Student?
            </h3>
            <p className="text-xs text-zinc-400">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs space-y-1.5 my-4">
          <p className="text-zinc-400">Are you sure you want to delete this student?</p>
          <p className="text-sm font-semibold text-white">{student.name}</p>
          <p className="text-[11px] text-zinc-500">
            {student.email} · {student.studentId}
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl border border-zinc-800 text-xs sm:text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition disabled:opacity-50"
          >
            No, Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs sm:text-sm font-semibold transition shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
