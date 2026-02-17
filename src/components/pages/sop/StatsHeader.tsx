import { FiFolder, FiFile, FiList, FiCheckSquare } from "react-icons/fi";

interface StatsHeaderProps {
  totalProcesses: number;
  totalSubprocesses: number;
  totalTasks: number;
  totalSteps: number;
}

export default function StatsHeader({
  totalProcesses,
  totalSubprocesses,
  totalTasks,
  totalSteps,
}: StatsHeaderProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-purple-500/20 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
            Generated SOPs
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Complete workflow breakdown
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex justify-center gap-3 sm:gap-6">
          <StatItem icon={FiFolder} value={totalProcesses} label="Processes" />
          <StatItem
            icon={FiFile}
            value={totalSubprocesses}
            label="Subprocesses"
          />
          <StatItem icon={FiList} value={totalTasks} label="Tasks" />
          <StatItem icon={FiCheckSquare} value={totalSteps} label="Steps" />
        </div>
      </div>
    </div>
  );
}

function StatItem({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
}) {
  return (
    <div className="text-center">
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mx-auto mb-1" />
      <div className="text-white font-bold text-sm sm:text-base">{value}</div>
      <div className="text-purple-300 text-[10px] sm:text-xs">{label}</div>
    </div>
  );
}
