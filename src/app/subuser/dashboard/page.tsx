"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import SOPResults from "@/components/pages/sop/SOPResults";
import { Task } from "../../../../types";

interface Department {
  id: string;
  name: string;
  createdAt: string;
}

interface SOP {
  id: string;
  process: string;
  subprocess: string;
  tasks: Task[];
  projectSession: {
    name: string;
  };
  assignedAt: string;
}

export default function SubUserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [assignedSOPs, setAssignedSOPs] = useState<SOP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "loading" && (!session || session.user.role !== "subuser")) {
      router.push("/login");
    }
  }, [status, router, session]);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch("/api/departments");
      const data = await res.json();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAssignedSOPs = useCallback(async () => {
    if (!session?.user?.subUserId) return;

    try {
      const res = await fetch(
        `/api/subuser-sop-assignments?subUserId=${session.user.subUserId}`
      );
      const data = await res.json();
      setAssignedSOPs(
        data.assignments.map(
          (assignment: {
            subprocess: {
              id: string;
              name: string;
              tasks: Task[];
              process: {
                name: string;
                projectSession: { name: string };
              };
            };
            createdAt: string;
          }) => ({
            id: assignment.subprocess.id,
            process: assignment.subprocess.process.name,
            subprocess: assignment.subprocess.name,
            tasks: assignment.subprocess.tasks,
            projectSession: {
              name: assignment.subprocess.process.projectSession.name,
            },
            assignedAt: assignment.createdAt,
          })
        )
      );
    } catch (error) {
      console.error("Error fetching assigned SOPs:", error);
    }
  }, [session?.user?.subUserId]);

  useEffect(() => {
    if (session?.user) {
      fetchDepartments();
      fetchAssignedSOPs();
    }
  }, [session, fetchDepartments, fetchAssignedSOPs]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "subuser") {
    return null; // Will redirect
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Sub-User Dashboard</h1>
          <p className="text-gray-300 mt-2">
            Welcome, {user.firstName} {user.lastName}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Dashboard Cards */}
          <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-purple-500/20">
            <h3 className="text-lg font-semibold text-white mb-2">
              My Department
            </h3>
            <p className="text-4xl font-bold text-purple-400">
              {departments.length}
            </p>
            <p className="text-sm text-gray-300 mt-2">Assigned department</p>
          </div>
          <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-purple-500/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Department Access
            </h3>
            <div className="space-y-4">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center justify-between py-2 border-b border-gray-700"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {dept.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Created {new Date(dept.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Access Granted
                  </span>
                </div>
              ))}
              {departments.length === 0 && (
                <p className="text-gray-400 text-sm">
                  No department assigned yet.
                </p>
              )}
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-purple-500/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Access Information
            </h3>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">
                Contact Number
              </h4>
              <p className="text-gray-300">{user.phone}</p>
            </div>
          </div>
        </div>

        {/* Assigned SOPs Section */}
        {assignedSOPs.length > 0 && (
          <div className="mt-8">
            <SOPResults
              generatedSOPs={assignedSOPs.map((sop) => ({
                id: sop.id,
                process: sop.process,
                subprocess: sop.subprocess,
                tasks: sop.tasks,
                assignedSubUsers: [], // Sub-users don't need to see other assignments
              }))}
              onRestart={() => {}} // No restart functionality for sub-users
              showAssignButton={false} // Sub-users cannot assign
              subUsers={[]} // No sub-users list needed
            />
          </div>
        )}
        {assignedSOPs.length === 0 && (
          <div className="mt-8 bg-slate-800 rounded-lg shadow-md p-6 border border-purple-500/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Assigned SOPs
            </h3>
            <p className="text-gray-400 text-sm">No SOPs assigned yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
