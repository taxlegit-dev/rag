import { useState, useEffect, useMemo } from "react";
import { GeneratedSOP } from "../../../../types";
import ProcessGroupHeader from "./ProcessGroupHeader";
import SubprocessItem from "./SubprocessItem";
import StatsHeader from "./StatsHeader";
import ProcessDownload from "./processDownload";
import RCMDownload from "./RCMDownload";
import RegenerateTaskModal from "./RegenerateTaskModal";
import RegenerateSubprocessModal from "./RegenerateSubprocessModal";
import AssignModal from "./AssignModal";
import AssignedUsersModal from "./AssignedUsersModal";

interface SubUser {
  id: string;
  name: string;
  contactNumber: string;
  departmentId: string;
  department: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface SOPResultsProps {
  generatedSOPs: GeneratedSOP[];
  onRestart: () => void;
  onAssign?: (process: string, subUserId: string) => void;
  onRemove?: (process: string, subUserId: string) => void;
  showAssignButton?: boolean;
  subUsers?: SubUser[];
}

interface Task {
  task: string;
  makers: string;
  checkers: string;
  steps: Step[];
}

interface Step {
  step_no: number;
  action: string;
  risk: string;
  mitigation: string;
}

interface Subprocess {
  id?: string;
  subprocess: string;
  sopId: string;
  tasks: Task[];
  assignedSubUsers?: SubUser[];
}

interface ProcessGroup {
  process: string;
  subprocesses: Subprocess[];
  assignedSubUsers?: SubUser[];
}

interface ExpandedState {
  [processName: string]: {
    expanded: boolean;
    subprocesses: {
      [subprocessName: string]: {
        expanded: boolean;
        tasks: { [taskIndex: number]: boolean };
      };
    };
  };
}

export default function SOPResults({
  generatedSOPs,
  onAssign,
  onRemove,
  showAssignButton = false,
  subUsers,
}: SOPResultsProps) {
  const safeGeneratedSOPs = Array.isArray(generatedSOPs) ? generatedSOPs : [];
  // State management
  const [regeneratedSOPs, setRegeneratedSOPs] = useState<GeneratedSOP[]>(
    safeGeneratedSOPs
  );
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerateData, setRegenerateData] = useState<{
    subprocessId: string;
    taskIndex: number;
    processName: string;
    subprocessName: string;
    taskName: string;
  } | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [showAssignedModal, setShowAssignedModal] = useState(false);
  const [selectedAssignedUsers, setSelectedAssignedUsers] = useState<SubUser[]>(
    []
  );
  const [showDownloadDropdown, setShowDownloadDropdown] = useState<
    string | null
  >(null);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [userPlan, setUserPlan] = useState<{
    canDownloadProcess: boolean;
    canDownloadRCM: boolean;
    canDownloadPDF: boolean;
  } | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [regeneratingSubprocessId, setRegeneratingSubprocessId] =
    useState<string | null>(null);
  const [showSubprocessModal, setShowSubprocessModal] = useState(false);
  const [subprocessRegenerateData, setSubprocessRegenerateData] = useState<{
    subprocessId: string;
    processName: string;
    subprocessName: string;
  } | null>(null);
  const [subprocessCustomMessage, setSubprocessCustomMessage] = useState("");
  const [isSubprocessRegenerating, setIsSubprocessRegenerating] =
    useState(false);

  // Sync regeneratedSOPs with prop changes
  useEffect(() => {
    setRegeneratedSOPs(safeGeneratedSOPs);
  }, [safeGeneratedSOPs]);

  // Fetch user plan
  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const response = await fetch("/api/user/plan");
        if (response.ok) {
          const data = await response.json();
          setUserPlan({
            canDownloadProcess: data.plan.canDownloadProcess,
            canDownloadRCM: data.plan.canDownloadRCM,
            canDownloadPDF: data.plan.canDownloadPDF,
          });
        }
      } catch (error) {
        console.error("Error fetching user plan:", error);
      } finally {
        setLoadingPlan(false);
      }
    };

    fetchUserPlan();
  }, []);

  // Group SOPs by process
  const groupedSOPs: ProcessGroup[] = useMemo(() => {
    return regeneratedSOPs.reduce((acc, sop) => {
      let processGroup = acc.find((p) => p.process === sop.process);
      if (!processGroup) {
        processGroup = {
          process: sop.process,
          subprocesses: [],
          assignedSubUsers: [],
        };
        acc.push(processGroup);
      }
      const safeTasks = Array.isArray(sop.tasks) ? sop.tasks : [];
      processGroup.subprocesses.push({
        id: sop.id,
        subprocess: sop.subprocess,
        sopId: sop.process + "-" + sop.subprocess,
        tasks: safeTasks,
        assignedSubUsers: sop.assignedSubUsers || [],
      });

      if (sop.assignedSubUsers) {
        sop.assignedSubUsers.forEach((subUser) => {
          if (
            !processGroup.assignedSubUsers!.some((asu) => asu.id === subUser.id)
          ) {
            processGroup.assignedSubUsers!.push(subUser);
          }
        });
      }
      return acc;
    }, [] as ProcessGroup[]);
  }, [regeneratedSOPs]);

  // Initialize expanded state
  useEffect(() => {
    const initial: ExpandedState = {};
    groupedSOPs.forEach((group) => {
      initial[group.process] = {
        expanded: true,
        subprocesses: {},
      };
      group.subprocesses.forEach((sub) => {
        initial[group.process].subprocesses[sub.subprocess] = {
          expanded: true,
          tasks: { 0: true },
        };
      });
    });
    setExpanded(initial);
  }, [groupedSOPs]);

  // Sync selectedAssignedUsers with current assignments
  useEffect(() => {
    if (showAssignedModal && selectedProcess) {
      const group = groupedSOPs.find((g) => g.process === selectedProcess);
      if (group) {
        setSelectedAssignedUsers(
          (group.assignedSubUsers || []).filter(
            (subUser) => subUser && subUser.name
          )
        );
      }
    }
  }, [groupedSOPs, showAssignedModal, selectedProcess]);

  // Toggle functions
  const toggleProcess = (processName: string) => {
    setExpanded((prev) => ({
      ...prev,
      [processName]: {
        ...prev[processName],
        expanded: !prev[processName]?.expanded,
      },
    }));
  };

  const toggleSubprocess = (processName: string, subprocessName: string) => {
    setExpanded((prev) => ({
      ...prev,
      [processName]: {
        ...prev[processName],
        subprocesses: {
          ...prev[processName]?.subprocesses,
          [subprocessName]: {
            ...prev[processName]?.subprocesses?.[subprocessName],
            expanded:
              !prev[processName]?.subprocesses?.[subprocessName]?.expanded,
          },
        },
      },
    }));
  };

  const toggleTask = (
    processName: string,
    subprocessName: string,
    taskIndex: number
  ) => {
    setExpanded((prev) => ({
      ...prev,
      [processName]: {
        ...prev[processName],
        subprocesses: {
          ...prev[processName]?.subprocesses,
          [subprocessName]: {
            ...prev[processName]?.subprocesses?.[subprocessName],
            tasks: {
              ...prev[processName]?.subprocesses?.[subprocessName]?.tasks,
              [taskIndex]:
                !prev[processName]?.subprocesses?.[subprocessName]?.tasks?.[
                  taskIndex
                ],
            },
          },
        },
      },
    }));
  };

  const expandAllProcess = (processName: string, group: ProcessGroup) => {
    const allSubprocesses: Record<
      string,
      { expanded: boolean; tasks: Record<number, boolean> }
    > = {};
    group.subprocesses.forEach((sub) => {
      const allTasks: Record<number, boolean> = {};
      const tasks = Array.isArray(sub.tasks) ? sub.tasks : [];
      tasks.forEach((_, i) => {
        allTasks[i] = true;
      });
      allSubprocesses[sub.subprocess] = { expanded: true, tasks: allTasks };
    });
    setExpanded((prev) => ({
      ...prev,
      [processName]: { expanded: true, subprocesses: allSubprocesses },
    }));
  };

  const collapseAllProcess = (processName: string, group: ProcessGroup) => {
    const allSubprocesses: Record<
      string,
      { expanded: boolean; tasks: Record<number, boolean> }
    > = {};
    group.subprocesses.forEach((sub) => {
      allSubprocesses[sub.subprocess] = { expanded: false, tasks: {} };
    });
    setExpanded((prev) => ({
      ...prev,
      [processName]: { expanded: true, subprocesses: allSubprocesses },
    }));
  };

  // Helper functions
  const isProcessExpanded = (processName: string) =>
    expanded[processName]?.expanded ?? true;
  const isSubprocessExpanded = (processName: string, subprocessName: string) =>
    expanded[processName]?.subprocesses?.[subprocessName]?.expanded ?? true;
  const isTaskExpanded = (
    processName: string,
    subprocessName: string,
    taskIndex: number
  ) =>
    expanded[processName]?.subprocesses?.[subprocessName]?.tasks?.[taskIndex] ??
    false;

  const isAllExpanded = (processName: string, group: ProcessGroup) => {
    const processState = expanded[processName];
    if (!processState) return false;
    return group.subprocesses.every((sub) => {
      const subState = processState.subprocesses?.[sub.subprocess];
      if (!subState?.expanded) return false;
      const tasks = Array.isArray(sub.tasks) ? sub.tasks : [];
      return tasks.every((_, i) => subState.tasks?.[i] === true);
    });
  };

  // Regenerate task functionality
  const handleRegenerateTask = (
    subprocessId: string,
    taskIndex: number,
    processName: string,
    subprocessName: string,
    taskName: string
  ) => {
    setRegenerateData({
      subprocessId,
      taskIndex,
      processName,
      subprocessName,
      taskName,
    });
    setCustomMessage("");
    setShowRegenerateModal(true);
  };

  const submitRegenerateTask = async () => {
    if (!regenerateData || !customMessage.trim()) {
      alert("Please enter a customization message");
      return;
    }

    setIsRegenerating(true);
    try {
      const response = await fetch("/api/regenerate-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subprocessId: regenerateData.subprocessId,
          taskIndex: regenerateData.taskIndex,
          customMessage: customMessage.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to regenerate task");
      }

      const data = await response.json();
      setRegeneratedSOPs((prevSOPs) =>
        prevSOPs.map((sop) => {
          if (
            sop.process === regenerateData.processName &&
            sop.subprocess === regenerateData.subprocessName
          ) {
            const updatedTasks = [...sop.tasks];
            updatedTasks[regenerateData.taskIndex] = data.task;
            return { ...sop, tasks: updatedTasks };
          }
          return sop;
        })
      );

      setShowRegenerateModal(false);
      setRegenerateData(null);
      setCustomMessage("");
      alert("Task regenerated successfully!");
    } catch (error) {
      console.error("Error regenerating task:", error);
      alert(
        error instanceof Error ? error.message : "Failed to regenerate task"
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const openSubprocessRegenerateModal = (
    subprocessId: string | undefined,
    processName: string,
    subprocessName: string
  ) => {
    if (!subprocessId) {
      alert("Unable to regenerate because this subprocess is missing an ID.");
      return;
    }

    setSubprocessRegenerateData({
      subprocessId,
      processName,
      subprocessName,
    });
    setSubprocessCustomMessage("");
    setShowSubprocessModal(true);
  };

  const submitRegenerateSubprocess = async () => {
    if (
      !subprocessRegenerateData ||
      !subprocessRegenerateData.subprocessId ||
      !subprocessCustomMessage.trim()
    ) {
      alert("Please enter a customization message.");
      return;
    }

    const { subprocessId, processName, subprocessName } =
      subprocessRegenerateData;

    setIsSubprocessRegenerating(true);
    setRegeneratingSubprocessId(subprocessId);
    try {
      const response = await fetch("/api/regenerate-subprocess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subprocessId,
          customMessage: subprocessCustomMessage.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Failed to regenerate subprocess");
      }

      const data = await response.json();
      if (!Array.isArray(data.tasks)) {
        throw new Error("Invalid response format from server");
      }

      setRegeneratedSOPs((prevSOPs) =>
        prevSOPs.map((sop) => {
          if (
            sop.id === subprocessId ||
            (sop.process === processName && sop.subprocess === subprocessName)
          ) {
            return { ...sop, tasks: data.tasks };
          }
          return sop;
        })
      );

      setShowSubprocessModal(false);
      setSubprocessRegenerateData(null);
      setSubprocessCustomMessage("");
      alert("Subprocess regenerated successfully!");
    } catch (error) {
      console.error("Error regenerating subprocess:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to regenerate subprocess"
      );
    } finally {
      setIsSubprocessRegenerating(false);
      setRegeneratingSubprocessId(null);
    }
  };

  // Calculate totals
  const totalProcesses = groupedSOPs.length;
  const totalSubprocesses = groupedSOPs.reduce(
    (acc, group) => acc + group.subprocesses.length,
    0
  );
  const totalTasks = safeGeneratedSOPs.reduce(
    (acc, sop) => acc + (Array.isArray(sop.tasks) ? sop.tasks.length : 0),
    0
  );
  const totalSteps = safeGeneratedSOPs.reduce(
    (acc, sop) =>
      acc +
      (Array.isArray(sop.tasks)
        ? sop.tasks.reduce(
            (taskAcc, task) =>
              taskAcc + (Array.isArray(task.steps) ? task.steps.length : 0),
            0
          )
        : 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <StatsHeader
          totalProcesses={totalProcesses}
          totalSubprocesses={totalSubprocesses}
          totalTasks={totalTasks}
          totalSteps={totalSteps}
        />

        {/* Hierarchical Structure */}
        <div className="space-y-6">
          {groupedSOPs.map((group, processIndex) => (
            <div
              key={processIndex}
              className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-purple-500/20 overflow-hidden"
            >
              <ProcessGroupHeader
                group={group}
                isProcessExpanded={isProcessExpanded}
                toggleProcess={toggleProcess}
                showAssignButton={showAssignButton}
                onAssign={() => {
                  setSelectedProcess(group.process);
                  setShowAssignModal(true);
                }}
                onViewAssigned={() => {
                  setSelectedProcess(group.process);
                  setShowAssignedModal(true);
                }}
                showDownloadDropdown={showDownloadDropdown}
                setShowDownloadDropdown={setShowDownloadDropdown}
                isAllExpanded={isAllExpanded}
                expandAllProcess={expandAllProcess}
                collapseAllProcess={collapseAllProcess}
                ProcessDownload={ProcessDownload}
                RCMDownload={RCMDownload}
                groupedSOPs={groupedSOPs}
                regeneratedSOPs={regeneratedSOPs}
                setRegeneratedSOPs={setRegeneratedSOPs}
                userPlan={userPlan}
                loadingPlan={loadingPlan}
              />

              {/* Subprocesses */}
              {isProcessExpanded(group.process) && (
                <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                  {group.subprocesses.map((subprocess, subIndex) => (
                    <SubprocessItem
                      key={subIndex}
                      subprocess={subprocess}
                      group={group}
                      isSubprocessExpanded={isSubprocessExpanded}
                      toggleSubprocess={toggleSubprocess}
                      isTaskExpanded={isTaskExpanded}
                      toggleTask={toggleTask}
                      handleRegenerateTask={handleRegenerateTask}
                      regeneratedSOPs={regeneratedSOPs}
                      onRegenerateSubprocess={openSubprocessRegenerateModal}
                      regeneratingSubprocessId={regeneratingSubprocessId}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Restart Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => (window.location.href = "/dashboard/sops")}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm sm:text-base rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105 font-medium"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Modals */}
        <AssignModal
          showAssignModal={showAssignModal}
          selectedProcess={selectedProcess}
          subUsers={subUsers}
          onAssign={onAssign}
          onClose={() => setShowAssignModal(false)}
        />

        <AssignedUsersModal
          showAssignedModal={showAssignedModal}
          selectedProcess={selectedProcess}
          selectedAssignedUsers={selectedAssignedUsers}
          onRemove={onRemove}
          onClose={() => setShowAssignedModal(false)}
        />

        <RegenerateTaskModal
          showRegenerateModal={showRegenerateModal}
          regenerateData={regenerateData}
          customMessage={customMessage}
          isRegenerating={isRegenerating}
          onClose={() => {
            setShowRegenerateModal(false);
            setRegenerateData(null);
            setCustomMessage("");
          }}
          onCustomMessageChange={setCustomMessage}
          onSubmit={submitRegenerateTask}
        />
        <RegenerateSubprocessModal
          show={showSubprocessModal}
          data={subprocessRegenerateData}
          customMessage={subprocessCustomMessage}
          isRegenerating={isSubprocessRegenerating}
          onClose={() => {
            if (isSubprocessRegenerating) return;
            setShowSubprocessModal(false);
            setSubprocessRegenerateData(null);
            setSubprocessCustomMessage("");
          }}
          onCustomMessageChange={setSubprocessCustomMessage}
          onSubmit={submitRegenerateSubprocess}
        />
      </div>
    </div>
  );
}
