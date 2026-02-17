import { useMemo, useState } from "react";

interface SubProcessSelectionSingleProps {
  process: string;
  subprocesses: string[];
  initialSelected: string[];
  subprocessLimit: number;
  isUnlimited?: boolean;
  onSubmit: (selected: string[]) => Promise<void> | void;
  onBack: () => void;
}

export default function SubProcessSelectionSingle({
  process,
  subprocesses,
  initialSelected,
  subprocessLimit,
  isUnlimited = false,
  onSubmit,
  onBack,
}: SubProcessSelectionSingleProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [customSubprocesses, setCustomSubprocesses] = useState<string[]>([]);
  const [newSubprocess, setNewSubprocess] = useState("");
  const [loading, setLoading] = useState(false);

  const allOptions = useMemo(
    () => [...subprocesses, ...customSubprocesses],
    [subprocesses, customSubprocesses]
  );

  const handleToggle = (name: string) => {
    const isSelected = selected.includes(name);
    setSelected((prev) =>
      isSelected ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleSelectAll = () => {
    setSelected(allOptions);
  };

  const handleAddCustom = () => {
    const trimmed = newSubprocess.trim();
    if (!trimmed) return;

    if (allOptions.includes(trimmed)) {
      setNewSubprocess("");
      return;
    }

    setCustomSubprocesses((prev) => [...prev, trimmed]);
    setSelected((prev) => [...prev, trimmed]);
    setNewSubprocess("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    await onSubmit(selected);
    setLoading(false);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
      <div className="text-center mb-8">
        <p className="text-sm uppercase tracking-widest text-purple-300">
          Select Subprocess Below
        </p>
        <h2 className="text-4xl font-bold text-white mt-2">
          {process || "Process"}
        </h2>
        <p className="text-gray-300 text-lg mt-3">
          Choose the subprocesses you want to include for this process.
        </p>
        <p className="text-gray-400 text-sm mt-2">
          {isUnlimited
            ? "Credits left: Unlimited. We will generate all selected subprocesses."
            : `Credits left: ${subprocessLimit}. We will generate up to ${subprocessLimit} subprocess(es).`}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-gray-300">
            Add custom subprocess
          </label>
          <div className="flex gap-3 flex-col sm:flex-row">
            <input
              type="text"
              value={newSubprocess}
              onChange={(e) => setNewSubprocess(e.target.value)}
              placeholder="Enter custom subprocess name"
              className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
            />
            <button
              onClick={handleAddCustom}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Add
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 border border-white/10">
          <div>
            <p className="text-white font-semibold">Selected</p>
            <p className="text-sm text-gray-400">
              {selected.length} subprocesses selected
            </p>
          </div>
          <button
            onClick={handleSelectAll}
            className="text-sm font-semibold text-purple-300 hover:text-white transition"
          >
            Select All
          </button>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-auto pr-2">
          {allOptions.map((subprocess) => {
            const isSelected = selected.includes(subprocess);
            const isDisabled =
              !isUnlimited && !isSelected && selected.length >= subprocessLimit;

            return (
              <label
                key={subprocess}
                className={`flex items-center gap-4 p-4 rounded-lg border transition ${
                  isSelected
                    ? "border-purple-400 bg-purple-500/10"
                    : "border-white/10 hover:border-purple-400/50"
                } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => handleToggle(subprocess)}
                  className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-white font-medium">{subprocess}</span>
                {customSubprocesses.includes(subprocess) && (
                  <span className="text-xs text-emerald-300 bg-emerald-900/50 px-2 py-0.5 rounded-full">
                    Custom
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex gap-4 flex-col sm:flex-row">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={selected.length === 0 || loading}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Generate SOP"}
        </button>
      </div>
    </div>
  );
}
