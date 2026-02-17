interface CompletedStepProps {
  totalProcesses: number;
  totalSubprocesses: number;
  onRestart: () => void;
}

export default function CompletedStep({
  totalProcesses,
  totalSubprocesses,
  onRestart,
}: CompletedStepProps) {
  return (
    <div className="bg-slate-900/60 rounded-2xl p-10 border border-emerald-400/20 text-center space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">
          All done
        </p>
        <h2 className="text-4xl font-bold text-white mt-3">
          SOP generation completed
        </h2>
        <p className="text-gray-300 mt-4">
          You have generated SOPs for {totalProcesses} process
          {totalProcesses === 1 ? "" : "es"} covering {totalSubprocesses}{" "}
          subprocess{totalSubprocesses === 1 ? "" : "es"}.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => (window.location.href = "/dashboard/sops")}
          className="px-8 py-3 bg-emerald-500/20 text-emerald-200 rounded-lg border border-emerald-400/30 hover:bg-emerald-500/30 transition"
        >
          View in Dashboard
        </button>
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-white/10 text-white rounded-lg border border-white/10 hover:bg-white/20 transition"
        >
          Generate another SOP
        </button>
      </div>
    </div>
  );
}

