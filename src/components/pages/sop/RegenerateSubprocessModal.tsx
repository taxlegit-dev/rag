import { FiRefreshCw, FiX } from "react-icons/fi";

interface RegenerateSubprocessModalProps {
  show: boolean;
  data: {
    subprocessId: string;
    processName: string;
    subprocessName: string;
  } | null;
  customMessage: string;
  isRegenerating: boolean;
  onClose: () => void;
  onCustomMessageChange: (message: string) => void;
  onSubmit: () => void;
}

export default function RegenerateSubprocessModal({
  show,
  data,
  customMessage,
  isRegenerating,
  onClose,
  onCustomMessageChange,
  onSubmit,
}: RegenerateSubprocessModalProps) {
  if (!show || !data) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-slate-700 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <FiRefreshCw className="w-5 h-5 text-blue-400" />
              Regenerate Subprocess
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Provide guidance so every task in this subprocess is regenerated
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            disabled={isRegenerating}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 text-sm space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-gray-400 min-w-[110px]">Process:</span>
            <span className="text-white font-medium">{data.processName}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-400 min-w-[110px]">Subprocess:</span>
            <span className="text-white font-medium">{data.subprocessName}</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            What should change in every regenerated task?
            <span className="text-red-400 ml-1">*</span>
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => onCustomMessageChange(e.target.value)}
            placeholder="E.g., add more detail on approvals, emphasize data privacy, include coordination with external vendors..."
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={5}
            disabled={isRegenerating}
          />
          <p className="text-gray-500 text-xs mt-2">
            The AI will use this context while rewriting every task in the subprocess.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition"
            disabled={isRegenerating}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isRegenerating || !customMessage.trim()}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isRegenerating ? (
              <>
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <FiRefreshCw className="w-4 h-4" />
                Regenerate Subprocess
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


