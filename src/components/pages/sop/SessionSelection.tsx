"use client";

import { useState } from "react";
import { ProjectSession } from "../../../../types";
import { Plus, FolderOpen, Calendar } from "lucide-react";

interface SessionSelectionProps {
  sessions: ProjectSession[];
  onSelect: (session: ProjectSession | null) => void;
}

export default function SessionSelection({
  sessions,
  onSelect,
}: SessionSelectionProps) {
  const [newSessionName, setNewSessionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSessionName.trim() }),
      });

      if (!response.ok) throw new Error("Failed to create session");

      const newSession = await response.json();
      onSelect(newSession.session);
    } catch (error) {
      console.error("Error creating session:", error);
    } finally {
      setIsCreating(false);
      setNewSessionName("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newSessionName.trim() && !isCreating) {
      handleCreateSession();
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 ">
          <h1 className="text-xl md:text-4xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
            Generate Your ICFR in
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}
              Mintue ✨
            </span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Select an existing session or create a new one to start generating
            Standard Operating Procedures
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Existing Sessions */}
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FolderOpen className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-white text-2xl font-semibold">History</h2>
                <p className="text-gray-400 text-sm">
                  {sessions.length} History{sessions.length !== 1 ? "s" : ""}{" "}
                  available
                </p>
              </div>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
                  <FolderOpen className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400 mb-2">No sessions found</p>
                <p className="text-gray-500 text-sm">
                  Create your first session to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="group p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-all duration-200 cursor-pointer"
                    onClick={() => onSelect(session)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate group-hover:text-blue-300 transition-colors">
                          {session.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          <p className="text-gray-400 text-sm">
                            Created{" "}
                            {new Date(session.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(session);
                        }}
                        className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-blue-500/25"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create New Session */}
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <div>
              <h2 className="text-white text-2xl font-semibold">
                Create New ICFR(SOP)
              </h2>
              <p className="text-gray-400 text-sm">
                Start fresh with a new SOP project
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-white font-medium block">
                  Company Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter company name (e.g., Google, Amazon, Microsoft)"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-white rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200"
                  />
                  {newSessionName && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleCreateSession}
                disabled={!newSessionName.trim() || isCreating}
                className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                  isCreating
                    ? "bg-emerald-700 cursor-not-allowed"
                    : !newSessionName.trim()
                      ? "bg-gray-700 cursor-not-allowed text-gray-400"
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-emerald-500/25"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Session...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Create New </span>
                    </>
                  )}
                </div>
              </button>

              <div className="pt-6 border-t border-slate-700/50">
                <h3 className="text-white font-medium mb-3">💡 Quick Tips</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                    <span>
                      Use a descriptive company name for easy reference
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                    <span>Each session contains multiple SOP documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                    <span>You can switch between sessions anytime</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.8);
        }
      `}</style>
    </div>
  );
}
