"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import SOPResults from "@/components/pages/sop/SOPResults";
import DeleteConfirmationModal from "@/components/userdashboard/DeleteConfirmationModal";
import { ProjectSession, GeneratedSOP } from "../../../../types/index";
import { ArrowLeft, Lightbulb, ScrollText } from "lucide-react";

interface Department {
  id: string;
  name: string;
  createdAt: string;
}

import { SubUser } from "../../../../types/index";

interface SOPResponse {
  id: string;
  process: string;
  subprocess: string;
  tasks: string[];
  subUserAssignments?: {
    subUser: SubUser;
  }[];
}

export default function SOPsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [, setDepartments] = useState<Department[]>([]);
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [projectSessions, setProjectSessions] = useState<ProjectSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingSOPs, setViewingSOPs] = useState<GeneratedSOP[] | null>(null);
  const [, setViewingSessionName] = useState<string>("");
  const [, setViewingSessionId] = useState<string>("");
  const [deletingSession, setDeletingSession] = useState<ProjectSession | null>(
    null
  );

  const fetchData = useCallback(async () => {
    if (!session?.user) return;

    try {
      const [departmentsRes, subUsersRes, sessionsRes] = await Promise.all([
        fetch("/api/departments"),
        session.user.role !== "subuser"
          ? fetch("/api/subusers")
          : Promise.resolve(null),
        fetch("/api/sessions"),
      ]);

      const departmentsData = await departmentsRes.json();
      setDepartments(departmentsData);

      if (subUsersRes) {
        const subUsersData = await subUsersRes.json();
        setSubUsers(subUsersData);
      }

      const sessionsData = await sessionsRes.json();
      setProjectSessions(sessionsData.sessions);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [fetchData, session?.user]);

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isSubUser = session.user.role === "subuser";
  // const user = session.user;

  const handleViewSOPs = async (sessionId: string, sessionName: string) => {
    try {
      const response = await fetch(`/api/sops?sessionId=${sessionId}`);
      if (!response.ok) throw new Error("Failed to fetch SOPs");

      const data = await response.json();
      const sops = data.sops.map((sop: SOPResponse) => ({
        id: sop.id,
        process: sop.process,
        subprocess: sop.subprocess,
        tasks: sop.tasks,
        assignedSubUsers:
          sop.subUserAssignments?.map((assignment) => assignment.subUser) || [],
      }));

      setViewingSOPs(sops);
      setViewingSessionName(sessionName);
      setViewingSessionId(sessionId);
    } catch (error) {
      console.error("Error fetching SOPs:", error);
      alert("Failed to load SOPs");
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProjectSessions((prev) => prev.filter((s) => s.id !== sessionId));
        setViewingSOPs(null);
        setViewingSessionName("");
        setViewingSessionId("");
      } else {
        alert("Failed to delete session");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Something went wrong");
    }
  };

  return (
    <>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-white break-words">
          SOPs
        </h1>
        <p className="text-gray-300 mt-2 text-sm md:text-base">
          Manage your SOPs
        </p>
      </div>

      {!isSubUser &&
        (viewingSOPs ? (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setViewingSOPs(null)}
                className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-3" />
                Back to Sessions
              </button>
            </div>
            <SOPResults
              generatedSOPs={viewingSOPs}
              onRestart={() => setViewingSOPs(null)}
              onAssign={async (process: string, subUserId: string) => {
                try {
                  const response = await fetch("/api/sops/assign", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ process, subUserId }),
                  });

                  if (!response.ok) {
                    throw new Error("Failed to assign SOP");
                  }

                  setViewingSOPs(
                    (prev) =>
                      prev?.map((sop) => {
                        if (sop.process === process) {
                          const subUser = subUsers.find(
                            (su) => su.id === subUserId
                          );
                          if (
                            subUser &&
                            !sop.assignedSubUsers?.some(
                              (asu) => asu.id === subUserId
                            )
                          ) {
                            return {
                              ...sop,
                              assignedSubUsers: [
                                ...(sop.assignedSubUsers || []),
                                subUser,
                              ],
                            };
                          }
                        }
                        return sop;
                      }) || null
                  );
                } catch (error) {
                  console.error("Error assigning SOP:", error);
                  alert("Failed to assign SOP. Please try again.");
                }
              }}
              onRemove={async (process: string, subUserId: string) => {
                try {
                  const response = await fetch("/api/sops/assign", {
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ process, subUserId }),
                  });

                  if (!response.ok) {
                    throw new Error("Failed to remove SOP assignment");
                  }

                  setViewingSOPs(
                    (prev) =>
                      prev?.map((sop) => {
                        if (sop.process === process) {
                          return {
                            ...sop,
                            assignedSubUsers:
                              sop.assignedSubUsers?.filter(
                                (asu) => asu.id !== subUserId
                              ) || [],
                          };
                        }
                        return sop;
                      }) || null
                  );
                } catch (error) {
                  console.error("Error removing SOP assignment:", error);
                  alert("Failed to remove SOP assignment. Please try again.");
                }
              }}
              showAssignButton={true}
              subUsers={subUsers}
            />
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-purple-500/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
              <h3 className="text-xl sm:text-2xl font-semibold text-white">
                SOPs
              </h3>
              <button
                onClick={() => router.push("/generate-sop")}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors flex items-center justify-center"
              >
                <Lightbulb className="w-5 h-5 mr-2 sm:mr-3 text-yellow-400" />
                Generate SOP
              </button>
            </div>
            <div className="space-y-4">
              {projectSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-4 px-4 bg-slate-700 rounded-lg border border-slate-600"
                >
                  <div>
                    <p className="text-lg font-medium text-white">
                      {session.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      Created {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewSOPs(session.id, session.name)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setDeletingSession(session)}
                      className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {projectSessions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ScrollText className="w-16 h-16 text-gray-400 mb-3" />
                  <p className="text-gray-400 text-lg">No SOPs created yet.</p>
                  <p className="text-gray-500 mt-2">
                    Generate your first SOP to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

      <DeleteConfirmationModal
        isOpen={!!deletingSession}
        title="Delete Session"
        message={`Are you sure you want to delete ${deletingSession?.name}? This action cannot be undone and will remove all associated SOPs.`}
        onCancel={() => setDeletingSession(null)}
        onConfirm={() => {
          if (deletingSession) {
            handleDeleteSession(deletingSession.id);
            setDeletingSession(null);
          }
        }}
      />
    </>
  );
}
