"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
      <div className="bg-red-50 text-red-500 p-4 rounded-full mb-6">
        <AlertCircle size={48} strokeWidth={1.5} />
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-4">
        Something went wrong!
      </h2>
      <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
        We encountered an unexpected error while rendering this page. Our systems have been notified.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
      >
        <RefreshCcw size={18} />
        Try again
      </button>
    </div>
  );
}
