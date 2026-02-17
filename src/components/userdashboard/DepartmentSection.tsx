import { Plus, Building2 } from "lucide-react";

interface Department {
  id: string;
  name: string;
  createdAt: string;
}

interface DepartmentSectionProps {
  departments: Department[];
  isSubUser: boolean;
  onAddDepartment: () => void;
  onDeleteDepartment: (department: Department) => void;
}

export default function DepartmentSection({
  departments,
  isSubUser,
  onAddDepartment,
  onDeleteDepartment,
}: DepartmentSectionProps) {
  if (isSubUser) return null;

  return (
    <div className="bg-slate-800 rounded-lg shadow-md p-4 sm:p-6 border border-purple-500/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6">
        <h3 className="text-xl sm:text-2xl font-semibold text-white">
          Departments
        </h3>
        <button
          onClick={onAddDepartment}
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors flex items-center justify-center sm:justify-start"
        >
          <Plus className="w-5 h-5 mr-2 sm:mr-3" />
          Add Department
        </button>
      </div>
      <div className="space-y-4">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 py-4 px-4 bg-slate-700 rounded-lg border border-slate-600"
          >
            <div>
              <p className="text-base sm:text-lg font-medium text-white break-words">
                {dept.name}
              </p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Created {new Date(dept.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-3 sm:mt-0">
              <button
                onClick={() => onDeleteDepartment(dept)}
                className="flex-1 sm:flex-none px-3 py-1.5 sm:py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
              <span className="px-3 py-1.5 sm:py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Active
              </span>
            </div>
          </div>
        ))}
        {departments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mb-3" />
            <p className="text-gray-400 text-lg">No departments created yet.</p>
            <p className="text-gray-500 mt-2">
              Create your first department to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
