import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">

      {/* Success Toast */}
      <div className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white shadow-2xl shadow-black/80 backdrop-blur-md">

        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />

          <span className="text-xs font-medium text-zinc-200">
            Student added successfully!
          </span>
        </div>

        <button
          className="p-1 text-zinc-400 hover:text-white rounded-lg transition"
          aria-label="Dismiss toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Error Toast */}
      <div className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white shadow-2xl shadow-black/80 backdrop-blur-md">

        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-zinc-300 shrink-0" />

          <span className="text-xs font-medium text-zinc-200">
            Something went wrong.
          </span>
        </div>

        <button
          className="p-1 text-zinc-400 hover:text-white rounded-lg transition"
          aria-label="Dismiss toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Info Toast */}
      <div className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white shadow-2xl shadow-black/80 backdrop-blur-md">

        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-zinc-400 shrink-0" />

          <span className="text-xs font-medium text-zinc-200">
            Student information updated.
          </span>
        </div>

        <button
          className="p-1 text-zinc-400 hover:text-white rounded-lg transition"
          aria-label="Dismiss toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};