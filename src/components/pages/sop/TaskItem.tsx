import { FiChevronRight, FiList, FiRefreshCw } from "react-icons/fi";
import StepsList from "./StepsList";

interface Step {
  step_no: number;
  action: string;
  risk: string;
  mitigation: string;
}

interface Task {
  task: string;
  makers: string;
  checkers: string;
  steps: Step[];
}

interface Subprocess {
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
  id?: string;
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

interface TaskItemProps {
  task: Task;
  taskIndex: number;
  group: ProcessGroup;
  subprocess: Subprocess;
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
}

export default function TaskItem({
  task,
  taskIndex,
  group,
  subprocess,
  isTaskExpanded,
  toggleTask,
  handleRegenerateTask,
  regeneratedSOPs,
}: TaskItemProps) {
  return (
    <div className="bg-slate-800/40 rounded-lg border border-slate-700/50 overflow-hidden">
      {/* Task Header */}
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0">
        <button
          onClick={() =>
            toggleTask(group.process, subprocess.subprocess, taskIndex)
          }
          className="flex-1 text-left hover:bg-slate-800/70 transition flex items-center gap-2 sm:gap-4 -m-3 sm:-m-4 p-3 sm:p-4 rounded-lg sm:rounded-l-lg"
        >
          <FiChevronRight
            className={`w-4 h-4 sm:w-5 sm:h-5 text-purple-400 transition-transform ${
              isTaskExpanded(group.process, subprocess.subprocess, taskIndex)
                ? "rotate-90"
                : ""
            }`}
          />
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500/20 text-purple-300 rounded flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
            {taskIndex + 1}
          </div>
          <h4 className="text-sm sm:text-base font-medium text-gray-100 break-words min-w-0">
            {task.task}
          </h4>
        </button>

        <div className="flex flex-wrap items-center gap-2 ml-8 sm:ml-0">
          <span className="w-full sm:w-auto px-2 sm:px-3 py-1 bg-slate-700/50 text-gray-400 rounded text-xs flex items-center justify-center gap-1">
            <FiList className="w-3 h-3" />
            {task.steps.length} Steps
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const currentSOP = regeneratedSOPs.find(
                (sop) =>
                  sop.process === group.process &&
                  sop.subprocess === subprocess.subprocess
              );
              if (currentSOP?.id) {
                handleRegenerateTask(
                  currentSOP.id,
                  taskIndex,
                  group.process,
                  subprocess.subprocess,
                  task.task
                );
              }
            }}
            className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded text-xs hover:bg-blue-600/30 transition flex items-center gap-1.5"
            title="Regenerate this task with custom instructions"
          >
            <FiRefreshCw className="w-3 h-3" />
            Regenerate
          </button>
        </div>
      </div>

      {/* Makers & Checkers Card */}
      <div className="mx-4 mb-3 p-3 bg-slate-900/40 border border-slate-700/60 rounded-lg shadow-sm">
        <div className="space-y-2 text-xs sm:text-sm">
          {/* Makers */}
          <div className="flex items-start gap-2">
            <span className="font-semibold text-blue-300 min-w-[70px]">
              Makers:
            </span>
            <span className="text-gray-300 leading-relaxed">{task.makers}</span>
          </div>

          {/* Checkers */}
          <div className="flex items-start gap-2">
            <span className="font-semibold text-green-300 min-w-[70px]">
              Checkers:
            </span>
            <span className="text-gray-300 leading-relaxed">
              {task.checkers}
            </span>
          </div>
        </div>
      </div>

      {isTaskExpanded(group.process, subprocess.subprocess, taskIndex) && (
        <StepsList steps={task.steps} />
      )}
    </div>
  );
}
