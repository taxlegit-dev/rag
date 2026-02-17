"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function RagPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      status !== "loading" &&
      (!session || session.user.email !== "admin@taxlegit.com")
    ) {
      router.push("/");
    }
  }, [session, status, router]);

  const canSubmit = useMemo(() => {
    return selectedFile || text.trim().length > 0;
  }, [selectedFile, text]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setProcessing(true);
    setSuccess(false);
    setError(null);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      formData.append("text", text);

      const response = await fetch("/api/rag/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message =
          typeof data?.error === "string" && data.error.trim().length > 0
            ? data.error
            : "Upload failed";
        throw new Error(message);
      }

      setSuccess(true);
      setSelectedFile(null);
      setText("");
    } catch (err) {
      const message =
        err instanceof Error && err.message ? err.message : "Upload failed";
      setError(message);
    } finally {
      setProcessing(false);
    }
  };

  if (status === "loading") return null;
  if (!session || session.user.email !== "admin@taxlegit.com") return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">RAG</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File
            </label>
            <input
              type="file"
              accept=".doc,.docx,.xls,.xlsx,.txt"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                if (file?.name.toLowerCase().endsWith(".pdf")) {
                  setSelectedFile(null);
                  setError(
                    "PDF upload is temporarily disabled. Use DOC/DOCX/XLS/XLSX/TXT.",
                  );
                  return;
                }
                setError(null);
                setSelectedFile(file);
              }}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste Text
            </label>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste content here"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit || processing}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? "Processing..." : "Submit"}
          </button>
        </form>

        {processing && (
          <p className="mt-4 text-sm text-gray-600">Processing...</p>
        )}

        {success && (
          <p className="mt-4 text-sm text-green-600">
            File uploaded successfully
          </p>
        )}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
