import { FiAlertTriangle, FiCheckSquare } from "react-icons/fi";

interface Step {
  step_no: number;
  action: string;
  risk: string;
  mitigation: string;
}

interface StepsListProps {
  steps: Step[];
}

export default function StepsList({ steps }: StepsListProps) {
  return (
    <div className="px-3 sm:px-4 pb-4 space-y-3 bg-slate-900/20">
      {steps.map((step, stepIndex) => (
        <div
          key={stepIndex}
          className="ml-8 sm:ml-12 border-l-2 border-purple-500/30 pl-4 sm:pl-6 py-3"
        >
          <div className="flex-1">
            <p className="text-gray-200 text-xs sm:text-sm font-medium mb-3">
              Step {step.step_no}- {step.action}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded px-3 py-2">
                <p className="text-amber-300 text-xs font-semibold mb-1 flex items-center gap-1">
                  <FiAlertTriangle className="w-3 h-3" />
                  Risk
                </p>
                <p className="text-amber-100 text-xs leading-relaxed">
                  {step.risk}
                </p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded px-3 py-2">
                <p className="text-emerald-300 text-xs font-semibold mb-1 flex items-center gap-1">
                  <FiCheckSquare className="w-3 h-3" />
                  Mitigation
                </p>
                <p className="text-emerald-100 text-xs leading-relaxed">
                  {step.mitigation}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
