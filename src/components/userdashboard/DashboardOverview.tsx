import { Department, SubUser } from "../../types/index";

interface DashboardOverviewProps {
  departments: Department[];
  subUsers: SubUser[];
  isSubUser: boolean;
  isAdmin?: boolean;
  remainingProcesses: number | null;
  remainingSubprocesses: number | null;
}

export default function DashboardOverview({
  departments,
  subUsers,
  isSubUser,
  isAdmin = false,
  remainingProcesses,
  remainingSubprocesses,
}: DashboardOverviewProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-purple-500/20">
          <h3 className="text-lg font-semibold text-white mb-2">
            {isSubUser ? "My Department" : "Total Departments"}
          </h3>
          <p className="text-4xl font-bold text-purple-400">
            {departments.length}
          </p>
          <p className="text-sm text-gray-300 mt-2">
            {isSubUser ? "Assigned department" : "Departments created"}
          </p>
        </div>

        {!isSubUser && (
          <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-purple-500/20">
            <h3 className="text-lg font-semibold text-white mb-2">
              Total Sub-users
            </h3>
            <p className="text-4xl font-bold text-green-400">
              {subUsers.length}
            </p>
            <p className="text-sm text-gray-300 mt-2">Sub-users created</p>
          </div>
        )}

        <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-purple-500/20">
          <h3 className="text-lg font-semibold text-white mb-2">
            Remaining Processes
          </h3>
          <p className="text-4xl font-bold text-yellow-400">
            {isAdmin
              ? "Unlimited"
              : remainingProcesses !== null
              ? remainingProcesses
              : "N/A"}
          </p>
          <p className="text-sm text-gray-300 mt-2">Processes left in plan</p>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-purple-500/20">
          <h3 className="text-lg font-semibold text-white mb-2">
            Remaining Subprocesses
          </h3>
          <p className="text-4xl font-bold text-yellow-400">
            {isAdmin
              ? "Unlimited"
              : remainingSubprocesses !== null
              ? remainingSubprocesses
              : "N/A"}
          </p>
          <p className="text-sm text-gray-300 mt-2">
            Subprocesses left in plan
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-purple-500/20">
          <h3 className="text-lg font-semibold text-white mb-2">
            Account Status
          </h3>
          <p className="text-4xl font-bold text-green-400">Active</p>
          <p className="text-sm text-gray-300 mt-2">Account is active</p>
        </div>
      </div>

      {isSubUser && (
        <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-purple-500/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Department Access
          </h3>
          <p className="text-gray-300">
            You have access to data from your assigned department:{" "}
            <span className="text-purple-400">{departments[0]?.name}</span>
          </p>
        </div>
      )}
    </>
  );
}
