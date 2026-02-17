"use client";

import { useState } from "react";

interface DepartmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DepartmentForm({
  onSuccess,
  onCancel,
}: DepartmentFormProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Department name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create department");
      }
    } catch (error) {
      console.error("Error creating department:", error);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/5 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 border border-purple-500/20 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Create New Department
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Department Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter department name"
              required
            />
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Department"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
