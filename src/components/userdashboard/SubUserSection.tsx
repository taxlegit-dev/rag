import { SubUser } from "../../../types/index";
import { UserPlus, PersonStanding } from "lucide-react";

interface SubUserSectionProps {
  subUsers: SubUser[];
  isSubUser: boolean;
  onAddSubUser: () => void;
  onEditSubUser: (subUser: SubUser) => void;
  onDeleteSubUser: (subUser: SubUser) => void;
}

export default function SubUserSection({
  subUsers,
  isSubUser,
  onAddSubUser,
  onEditSubUser,
  onDeleteSubUser,
}: SubUserSectionProps) {
  if (isSubUser) return null;

  return (
    <div className="bg-slate-800 rounded-lg shadow-md p-4 sm:p-6 border border-purple-500/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6">
        <h3 className="text-xl sm:text-2xl font-semibold text-white">
          Sub-users
        </h3>
        <button
          onClick={onAddSubUser}
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors flex items-center justify-center sm:justify-start"
        >
          <UserPlus className="w-5 h-5 mr-2 sm:mr-3" />
          Add Sub-user
        </button>
      </div>
      <div className="space-y-4">
        {subUsers.map((subUser) => (
          <div
            key={subUser.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 px-4 bg-slate-700 rounded-lg border border-slate-600"
          >
            <div className="flex items-center space-x-4 mb-3 sm:mb-0">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold">
                  {subUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base sm:text-lg font-medium text-white break-words">
                  {subUser.name}
                </p>
                <p className="text-xs sm:text-sm text-gray-400 break-words">
                  {subUser.contactNumber} • {subUser.department.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => onEditSubUser(subUser)}
                className="flex-1 sm:flex-none px-3 py-1.5 sm:py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDeleteSubUser(subUser)}
                className="flex-1 sm:flex-none px-3 py-1.5 sm:py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {subUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <PersonStanding className="w-16 h-16 text-gray-400 mb-3" />
            <p className="text-gray-400 text-lg">No sub-users created yet.</p>
            <p className="text-gray-500 mt-2">
              Create your first sub-user to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
