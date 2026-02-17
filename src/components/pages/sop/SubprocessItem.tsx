import { FiChevronRight, FiFile, FiRefreshCw } from "react-icons/fi";
import TaskItem from "./TaskItem";

interface Task {
  task: string;
  makers: string;
  checkers: string;
  steps: {
    step_no: number;
    action: string;
    risk: string;
    mitigation: string;
  }[];
}

interface Subprocess {
  id?: string;
  subprocess: string;
  sopId: string;
  tasks: Task[];
  assignedSubUsers?: {
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
}

interface ProcessGroup {
  process: string;
  subprocesses: Subprocess[];
  assignedSubUsers?: {
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
}

interface GeneratedSOP {
  process: string;
  subprocess: string;
  tasks: Task[];
  assignedSubUsers?: {
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
}

interface SubprocessItemProps {
  subprocess: Subprocess;
  group: ProcessGroup;
  isSubprocessExpanded: (
    processName: string,
    subprocessName: string
  ) => boolean;
  toggleSubprocess: (processName: string, subprocessName: string) => void;
  isTaskExpanded: (
    processName: string,
    subprocessName: string,
    taskIndex: number
  ) => boolean;
  toggleTask: (
    processName: string,
    subprocessName: string,
    taskIndex: number
  ) => void;
  handleRegenerateTask: (
    subprocessId: string,
    taskIndex: number,
    processName: string,
    subprocessName: string,
    taskName: string
  ) => void;
  regeneratedSOPs: GeneratedSOP[];
  onRegenerateSubprocess: (
    subprocessId: string | undefined,
    processName: string,
    subprocessName: string
  ) => void;
  regeneratingSubprocessId: string | null;
}

export default function SubprocessItem({
  subprocess,
  group,
  isSubprocessExpanded,
  toggleSubprocess,
  isTaskExpanded,
  toggleTask,
  handleRegenerateTask,
  regeneratedSOPs,
  onRegenerateSubprocess,
  regeneratingSubprocessId,
}: SubprocessItemProps) {
  return (
    <div className="bg-slate-900/40 rounded-lg border border-slate-700/50 overflow-hidden">
      {/* Subprocess Header */}
      <div className="p-3 sm:p-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <button
              onClick={() =>
                toggleSubprocess(group.process, subprocess.subprocess)
              }
              className="text-purple-400 hover:text-purple-300 transition flex-shrink-0"
            >
              <FiChevronRight
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${
                  isSubprocessExpanded(group.process, subprocess.subprocess)
                    ? "rotate-90"
                    : ""
                }`}
              />
            </button>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="p-1.5 bg-pink-500/30 rounded flex-shrink-0">
                <FiFile className="w-4 h-4 sm:w-5 sm:h-5 text-pink-200" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                {subprocess.subprocess}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <span className="w-full sm:w-auto px-2 sm:px-3 py-1 bg-slate-700/50 text-gray-400 rounded text-xs sm:text-sm text-center">
              {subprocess.tasks.length} Tasks
            </span>
            <button
              type="button"
              className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded text-xs sm:text-sm hover:bg-blue-600/30 transition flex items-center gap-1.5 disabled:opacity-60"
              disabled={
                !subprocess.id ||
                regeneratingSubprocessId === subprocess.id
              }
              onClick={(e) => {
                e.stopPropagation();
                onRegenerateSubprocess(
                  subprocess.id,
                  group.process,
                  subprocess.subprocess
                );
              }}
              title={
                subprocess.id
                  ? "Regenerate every task in this subprocess"
                  : "Subprocess identifier missing"
              }
            >
              <FiRefreshCw
                className={`w-3 h-3 ${
                  regeneratingSubprocessId === subprocess.id
                    ? "animate-spin"
                    : ""
                }`}
              />
              {regeneratingSubprocessId === subprocess.id
                ? "Regenerating..."
                : "Regenerate"}
            </button>
          </div>
        </div>
      </div>

      {/* Tasks */}
      {isSubprocessExpanded(group.process, subprocess.subprocess) && (
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          {subprocess.tasks.map((task, taskIndex: number) => (
            <TaskItem
              key={taskIndex}
              task={task}
              taskIndex={taskIndex}
              group={group}
              subprocess={subprocess}
              isTaskExpanded={isTaskExpanded}
              toggleTask={toggleTask}
              handleRegenerateTask={handleRegenerateTask}
              regeneratedSOPs={regeneratedSOPs}
            />
          ))}
        </div>
      )}
    </div>
  );
}
