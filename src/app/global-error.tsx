"use client";

export default function GlobalError({
  reset,
}: {
  error?: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center">
          <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-600 mb-6">
            Please try again. If the problem continues, contact support.
          </p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
