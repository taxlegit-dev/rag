import { GeneratedSOP } from "../../../../types";

interface SingleSOPResultsProps {
  processName: string;
  generatedSOPs: GeneratedSOP[];
  onNext: () => void;
  hasNext: boolean;
}

export default function SingleSOPResults({
  processName,
  generatedSOPs,
  onNext,
  hasNext,
}: SingleSOPResultsProps) {
  const safeSOPs = Array.isArray(generatedSOPs) ? generatedSOPs : [];
  const totalTasks = safeSOPs.reduce(
    (acc, sop) => acc + (Array.isArray(sop.tasks) ? sop.tasks.length : 0),
    0,
  );
  const totalSteps = safeSOPs.reduce(
    (acc, sop) =>
      acc +
      (Array.isArray(sop.tasks)
        ? sop.tasks.reduce(
            (taskAcc, task) =>
              taskAcc + (Array.isArray(task.steps) ? task.steps.length : 0),
            0,
          )
        : 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/30 shadow-2xl shadow-purple-500/10 p-6 mb-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <p className="text-xs uppercase tracking-[0.3em] text-purple-300 font-semibold">
                SOP Results
              </p>
            </div>

            <h1 className="text-4xl md:text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              {processName}
            </h1>

            <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
              Review the generated SOP before moving to the next process.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-6">
              <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">
                  {safeSOPs.length}
                </div>

                <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">
                  Subprocesses
                </div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">
                  {totalTasks}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">
                  Tasks
                </div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">
                  {totalSteps}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">
                  Steps
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SOP Content */}
        <div className="space-y-6">
          {safeSOPs.map((sop, sopIndex) => {
            const tasks = Array.isArray(sop.tasks) ? sop.tasks : [];
            return (
              <div
                key={`${sop.process}-${sop.subprocess}`}
                className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden"
              >
                {/* Subprocess Header */}
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-white/10 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                      <span className="text-sm font-bold text-purple-300">
                        {sopIndex + 1}
                      </span>
                    </div>
                    <p className="text-sm uppercase tracking-wider text-purple-300 font-semibold">
                      Subprocess
                    </p>
                  </div>
                  <h2 className="text-2xl font-bold text-white leading-tight">
                    {sop.subprocess}
                  </h2>
                </div>

                {/* Tasks */}
                <div className="p-6 space-y-4">
                  {tasks.length === 0 && (
                    <div className="text-sm text-gray-300">
                      No tasks were generated for this subprocess.
                    </div>
                  )}
                  {tasks.map((task, taskIndex) => {
                    const steps = Array.isArray(task.steps) ? task.steps : [];
                    return (
                      <div
                        key={`${task.task}-${taskIndex}`}
                        className="bg-slate-800/40 rounded-xl border border-white/5 p-5 space-y-4 hover:border-white/10 transition-all duration-300"
                      >
                        {/* Task Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">
                                Task {taskIndex + 1}
                              </p>
                            </div>
                            <h3 className="text-xl font-semibold text-white leading-relaxed">
                              {task.task}
                            </h3>
                          </div>

                          {/* Roles */}
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full text-sm text-blue-300">
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                              Maker: {task.makers || "N/A"}
                            </span>
                            <span className="inline-flex items-center gap-1 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full text-sm text-green-300">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                              Checker: {task.checkers || "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Steps */}
                        <div className="space-y-3 mt-4">
                          {steps.length === 0 && (
                            <div className="text-sm text-gray-400">
                              No steps were generated for this task.
                            </div>
                          )}
                          {steps.map((step, stepIndex) => (
                            <div
                              key={`${step.step_no}-${stepIndex}`}
                              className="group bg-slate-900/60 rounded-xl border border-white/5 p-4 space-y-3 hover:border-purple-500/30 transition-all duration-300"
                            >
                              {/* Step Header */}
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-purple-500/20 border border-purple-500/30 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                                  <span className="text-sm font-bold text-purple-300">
                                    {step.step_no}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-purple-200">
                                    Step {step.step_no}
                                  </p>
                                </div>
                              </div>

                              {/* Step Content */}
                              <div className="grid gap-3 pl-11">
                                {/* Action */}
                                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                                  <span className="text-white font-medium text-sm min-w-[60px]">
                                    Action:
                                  </span>
                                  <span className="text-gray-200 text-sm leading-relaxed flex-1">
                                    {step.action}
                                  </span>
                                </div>

                                {/* Risk */}
                                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                                  <span className="text-red-300 font-medium text-sm min-w-[60px]">
                                    Risk:
                                  </span>
                                  <span className="text-red-100 text-sm leading-relaxed flex-1">
                                    {step.risk}
                                  </span>
                                </div>

                                {/* Mitigation */}
                                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                                  <span className="text-emerald-300 font-medium text-sm min-w-[60px]">
                                    Mitigation:
                                  </span>
                                  <span className="text-emerald-100 text-sm leading-relaxed flex-1">
                                    {step.mitigation}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => (window.location.href = "/dashboard/sops")}
              className="flex-1 px-8 py-4 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-all duration-300 hover:border-white/30 hover:shadow-lg backdrop-blur-sm font-medium"
            >
              Go to Dashboard
            </button>
            <button
              onClick={onNext}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 font-semibold transform hover:-translate-y-0.5"
            >
              {hasNext ? (
                <span className="flex items-center justify-center gap-2">
                  Next Process
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Finish
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
