interface AssignedUsersModalProps {
  showAssignedModal: boolean;
  selectedProcess: string | null;
  selectedAssignedUsers: {
    id: string;
    name: string;
    contactNumber: string;
    departmentId: string;
    department: {
      id: string;
      name: string;
    };
    createdAt: string;
  }[];
  onRemove?: (process: string, subUserId: string) => void;
  onClose: () => void;
}

export default function AssignedUsersModal({
  showAssignedModal,
  selectedProcess,
  selectedAssignedUsers,
  onRemove,
  onClose,
}: AssignedUsersModalProps) {
  if (!showAssignedModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-6 border border-purple-500/20 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Assigned Sub-users
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>
        <div className="space-y-2">
          {selectedAssignedUsers.map((subUser) => (
            <div
              key={subUser.id}
              className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 text-green-300 rounded-full flex items-center justify-center text-sm font-bold">
                  {subUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">{subUser.name}</p>
                  <p className="text-gray-400 text-sm">
                    {subUser.contactNumber} •{" "}
                    {subUser.department?.name || "No Department"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (selectedProcess) {
                    onRemove?.(selectedProcess, subUser.id);
                  }
                }}
                className="px-3 py-1 bg-red-500/20 text-red-300 rounded text-xs hover:bg-red-500/30 transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
