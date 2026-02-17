interface AssignModalProps {
  showAssignModal: boolean;
  selectedProcess: string | null;
  subUsers?: {
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
  onAssign?: (process: string, subUserId: string) => void;
  onClose: () => void;
}

export default function AssignModal({
  showAssignModal,
  selectedProcess,
  subUsers,
  onAssign,
  onClose,
}: AssignModalProps) {
  if (!showAssignModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-purple-500/20 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-white break-words pr-4">
            Assign Process: {selectedProcess}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-1"
          >
            ✕
          </button>
        </div>
        <div className="space-y-2">
          {subUsers?.map((subUser) => (
            <div
              key={subUser.id}
              className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
            >
              <div>
                <p className="text-white font-medium">{subUser.name}</p>
                <p className="text-gray-400 text-sm">{subUser.contactNumber}</p>
              </div>
              <button
                onClick={() => {
                  if (selectedProcess) {
                    onAssign?.(selectedProcess, subUser.id);
                    onClose();
                  }
                }}
                className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded hover:bg-purple-500/30 transition"
              >
                Assign
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
