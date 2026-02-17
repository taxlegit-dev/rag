// components/SubprocessSelection.tsx
import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

interface SubprocessSelectionProps {
  processes: string[];
  subprocesses: Record<string, string[]>;
  initialSelected: Record<string, string[]>;
  onSubmit: (selectedSubprocesses: Record<string, string[]>) => void;
  onBack: () => void;
  subprocessLimit: number;
  isUnlimited?: boolean;
}

export default function SubprocessSelection({
  processes,
  subprocesses,
  initialSelected,
  onSubmit,
  onBack,
  subprocessLimit,
  isUnlimited = false,
}: SubprocessSelectionProps) {
  const { showWarning } = useToast();
  const [selectedSubprocesses, setSelectedSubprocesses] =
    useState<Record<string, string[]>>(initialSelected);
  const [activeTab, setActiveTab] = useState<string>(processes[0] || "");
  const [loading, setLoading] = useState(false);
  const [customSubprocesses, setCustomSubprocesses] = useState<
    Record<string, string[]>
  >({});
  const [newSubprocess, setNewSubprocess] = useState<string>("");

  const addCustomSubprocess = () => {
    if (newSubprocess.trim() && activeTab) {
      const currentCustom = customSubprocesses[activeTab] || [];
      const totalSelected =
        (selectedSubprocesses[activeTab]?.length || 0) +
        currentCustom.length +
        1;
      if (!isUnlimited && totalSelected > subprocessLimit) {
        showWarning(
          "Subprocess limit exceeded. Upgrade your plan to generate more subprocesses."
        );
        return;
      }
      if (
        !currentCustom.includes(newSubprocess.trim()) &&
        !(subprocesses[activeTab] || []).includes(newSubprocess.trim())
      ) {
        setCustomSubprocesses((prev) => ({
          ...prev,
          [activeTab]: [...currentCustom, newSubprocess.trim()],
        }));
        setNewSubprocess("");
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    await onSubmit(selectedSubprocesses);
    setLoading(false);
  };

  const allSubprocessesSelected = (process: string) => {
    const aiSubs = subprocesses[process] || [];
    const customSubs = customSubprocesses[process] || [];
    const allSubs = [...aiSubs, ...customSubs];
    return (
      selectedSubprocesses[process]?.length === allSubs.length &&
      allSubs.length > 0
    );
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Select Subprocesses
        </h2>
        <p className="text-gray-300 text-lg">
          Choose specific subprocesses to generate detailed SOPs
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-600 pb-4">
        {processes.map((process) => (
          <button
            key={process}
            onClick={() => setActiveTab(process)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === process
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
            }`}
          >
            {process}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab && subprocesses[activeTab] && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white mb-4">
            {activeTab} Subprocesses
          </h3>

          {/* Add Custom Subprocess Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSubprocess}
              onChange={(e) => setNewSubprocess(e.target.value)}
              placeholder="Enter custom subprocess name"
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
              onKeyPress={(e) => e.key === "Enter" && addCustomSubprocess()}
            />
            <button
              onClick={addCustomSubprocess}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Add
            </button>
          </div>

          <label
          className={`flex items-center space-x-3 p-3 rounded-lg border mb-4 transition-all duration-200 ${
              !isUnlimited &&
              (selectedSubprocesses[activeTab]?.length || 0) >= subprocessLimit
                ? "bg-gray-600/20 cursor-not-allowed opacity-50 border-gray-500/20"
                : "bg-purple-500/20 cursor-pointer hover:bg-purple-500/30 border-purple-500/40"
            }`}
          >
            <input
              type="checkbox"
              checked={allSubprocessesSelected(activeTab)}
              disabled={
                !isUnlimited &&
                (selectedSubprocesses[activeTab]?.length || 0) >=
                  subprocessLimit
              }
              onChange={(e) => {
                const aiSubs = subprocesses[activeTab] || [];
                const customSubs = customSubprocesses[activeTab] || [];
                const allSubs = [...aiSubs, ...customSubs];
                if (e.target.checked) {
                  if (!isUnlimited && allSubs.length > subprocessLimit) {
                    showWarning(
                      "Subprocess limit exceeded. Upgrade your plan to generate more subprocesses."
                    );
                    return;
                  }
                  setSelectedSubprocesses((prev) => ({
                    ...prev,
                    [activeTab]: allSubs,
                  }));
                } else {
                  setSelectedSubprocesses((prev) => ({
                    ...prev,
                    [activeTab]: [],
                  }));
                }
              }}
              className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2 disabled:opacity-50"
            />
            <span
              className={`font-semibold text-base ${
                !isUnlimited &&
                (selectedSubprocesses[activeTab]?.length || 0) >=
                  subprocessLimit
                  ? "text-gray-400"
                  : "text-white"
              }`}
            >
              Select All Subprocesses
              {!isUnlimited &&
                (selectedSubprocesses[activeTab]?.length || 0) >=
                  subprocessLimit &&
                " (Plan limit reached)"}
            </span>
          </label>

          {subprocesses[activeTab].map((subprocess, index) => {
            const isDisabled =
              !isUnlimited &&
              (selectedSubprocesses[activeTab]?.length || 0) >=
                subprocessLimit &&
              !selectedSubprocesses[activeTab]?.includes(subprocess);
            return (
              <label
                key={`ai-${index}`}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 border ${
                  isDisabled
                    ? "bg-gray-600/20 cursor-not-allowed opacity-50 border-gray-500/20"
                    : "bg-white/5 hover:bg-white/10 cursor-pointer border-transparent hover:border-white/20"
                }`}
              >
                <input
                  type="checkbox"
                  checked={
                    selectedSubprocesses[activeTab]?.includes(subprocess) ||
                    false
                  }
                  disabled={isDisabled}
                  onChange={(e) => {
                    const currentSelected =
                      selectedSubprocesses[activeTab] || [];
                    if (e.target.checked) {
                      setSelectedSubprocesses((prev) => ({
                        ...prev,
                        [activeTab]: [...currentSelected, subprocess],
                      }));
                    } else {
                      setSelectedSubprocesses((prev) => ({
                        ...prev,
                        [activeTab]: currentSelected.filter(
                          (s) => s !== subprocess
                        ),
                      }));
                    }
                  }}
                  className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2 disabled:opacity-50"
                />
                <span
                  className={`font-medium text-base ${
                    isDisabled ? "text-gray-400" : "text-white"
                  }`}
                >
                  {subprocess}
                  {isDisabled && " (Plan limit reached)"}
                </span>
              </label>
            );
          })}

          {(customSubprocesses[activeTab] || []).map((subprocess, index) => {
            const isDisabled =
              !isUnlimited &&
              (selectedSubprocesses[activeTab]?.length || 0) >=
                subprocessLimit &&
              !selectedSubprocesses[activeTab]?.includes(subprocess);
            return (
              <label
                key={`custom-${index}`}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 cursor-pointer border ${
                  isDisabled
                    ? "bg-gray-600/20 cursor-not-allowed opacity-50 border-gray-500/20"
                    : "bg-green-500/10 hover:bg-green-500/20 border-green-500/20 hover:border-green-500/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={
                    selectedSubprocesses[activeTab]?.includes(subprocess) ||
                    false
                  }
                  disabled={isDisabled}
                  onChange={(e) => {
                    const currentSelected =
                      selectedSubprocesses[activeTab] || [];
                    if (e.target.checked) {
                      setSelectedSubprocesses((prev) => ({
                        ...prev,
                        [activeTab]: [...currentSelected, subprocess],
                      }));
                    } else {
                      setSelectedSubprocesses((prev) => ({
                        ...prev,
                        [activeTab]: currentSelected.filter(
                          (s) => s !== subprocess
                        ),
                      }));
                    }
                  }}
                  className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2 disabled:opacity-50"
                />
                <span
                  className={`font-medium text-base ${
                    isDisabled ? "text-gray-400" : "text-white"
                  }`}
                >
                  {subprocess} (Custom)
                  {isDisabled && " (Plan limit reached)"}
                </span>
              </label>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex gap-4 justify-center">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={
            Object.values(selectedSubprocesses).every(
              (arr) => arr.length === 0
            ) || loading
          }
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating SOPs..." : "Generate SOPs"}
        </button>
      </div>
    </div>
  );
}
