// components/ProcessSelection.tsx
import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

interface ProcessSelectionProps {
  processes: string[];
  initialSelected: string[];
  onSubmit: (selectedProcesses: string[]) => void;
  onBack: () => void;
  processLimit: number;
  isUnlimited?: boolean;
}

export default function ProcessSelection({
  processes,
  initialSelected,
  onSubmit,
  onBack,
  processLimit,
  isUnlimited = false,
}: ProcessSelectionProps) {
  const [selectedProcesses, setSelectedProcesses] =
    useState<string[]>(initialSelected);
  const [customProcesses, setCustomProcesses] = useState<string[]>([]);
  const [newProcess, setNewProcess] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Correct toast usage - aapke ToastProvider ke according
  const { showError, showWarning } = useToast();

  const addCustomProcess = () => {
    if (
      newProcess.trim() &&
      !customProcesses.includes(newProcess.trim()) &&
      !processes.includes(newProcess.trim())
    ) {
      setCustomProcesses([...customProcesses, newProcess.trim()]);
      setNewProcess("");
    }
  };

  const handleSubmit = async () => {
    if (selectedProcesses.length === 0) {
      showWarning("Please select at least one process");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(selectedProcesses);
    } catch {
      showError("Failed to get subprocesses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const allAvailable = [...processes, ...customProcesses];
  const allSelected =
    selectedProcesses.length === allAvailable.length && allAvailable.length > 0;

  const toggleProcess = (process: string) => {
    if (selectedProcesses.includes(process)) {
      // Remove process
      setSelectedProcesses((prev) => prev.filter((p) => p !== process));
    } else {
      // Add process - check limit
      if (!isUnlimited && selectedProcesses.length >= processLimit) {
        showWarning(
          `You can only select up to ${processLimit} processes. Upgrade your plan to select more.`
        );
        return;
      }
      setSelectedProcesses((prev) => [...prev, process]);
    }
  };

  const toggleAllProcesses = () => {
    if (allSelected) {
      // Deselect all
      setSelectedProcesses([]);
    } else {
      // Select all - check limit
      if (!isUnlimited && allAvailable.length > processLimit) {
        showWarning(
          `Cannot select all processes. You can only select up to ${processLimit} processes.`
        );
        return;
      }
      setSelectedProcesses(allAvailable);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Select Processes for SOP Generation
        </h2>
        <p className="text-gray-300 text-lg">
          Choose the business processes you want to generate SOPs for
        </p>
        <p className="text-gray-400 text-sm mt-2">
          {isUnlimited
            ? "Credits left: Unlimited. We will generate all selected processes."
            : `Credits left: ${processLimit}. We will generate up to ${processLimit} process(es).`}
        </p>
      </div>

      <div className="space-y-3">
        {/* Add Custom Process Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newProcess}
            onChange={(e) => setNewProcess(e.target.value)}
            placeholder="Enter custom process name"
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
            onKeyPress={(e) => e.key === "Enter" && addCustomProcess()}
          />
          <button
            onClick={addCustomProcess}
            disabled={!newProcess.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>

        {/* Select All Checkbox */}
        <label className="flex items-center space-x-3 p-3 rounded-lg border mb-4 transition-all duration-200 bg-purple-500/20 cursor-pointer hover:bg-purple-500/30 border-purple-500/40">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAllProcesses}
            className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2 disabled:opacity-50"
          />
          <span className="font-semibold text-base text-white">
            Select All Processes
          </span>
        </label>

        {/* AI Suggested Processes */}
        {processes.map((process, index) => {
          const isSelected = selectedProcesses.includes(process);

          return (
            <label
              key={`ai-${index}`}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 border cursor-pointer ${
                isSelected
                  ? "bg-purple-500/20 border-purple-500/40"
                  : "bg-white/5 hover:bg-white/10 border-transparent hover:border-white/20"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleProcess(process)}
                className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2 disabled:opacity-50"
              />
              <span className="font-medium text-base text-white">
                {process}
              </span>
            </label>
          );
        })}

        {/* Custom Processes */}
        {customProcesses.map((process, index) => {
          const isSelected = selectedProcesses.includes(process);

          return (
            <label
              key={`custom-${index}`}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 border cursor-pointer ${
                isSelected
                  ? "bg-green-500/20 border-green-500/40"
                  : "bg-green-500/10 hover:bg-green-500/20 border-green-500/20 hover:border-green-500/40"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleProcess(process)}
                className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2 disabled:opacity-50"
              />
              <span className="font-medium text-base text-white">
                {process}
                <span className="text-green-400 ml-1">(Custom)</span>
              </span>
            </label>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4 justify-center">
        <button
          onClick={onBack}
          disabled={loading}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={selectedProcesses.length === 0 || loading}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Getting Subprocesses...
            </span>
          ) : (
            `Get Subprocesses (${selectedProcesses.length})`
          )}
        </button>
      </div>
    </div>
  );
}
