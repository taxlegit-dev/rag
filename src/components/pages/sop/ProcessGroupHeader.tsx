import {
  FiChevronRight,
  FiFolder,
  FiUserPlus,
  FiDownload,
  FiMinus,
  FiPlus,
  FiUsers,
} from "react-icons/fi";
import { GeneratedSOP } from "../../../../types";
import { useState, useRef } from "react";

interface Subprocess {
  subprocess: string;
  sopId: string;
  tasks: {
    task: string;
    makers: string;
    checkers: string;
    steps: {
      step_no: number;
      action: string;
      risk: string;
      mitigation: string;
    }[];
  }[];
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

interface ProcessGroupHeaderProps {
  group: ProcessGroup;
  isProcessExpanded: (name: string) => boolean;
  toggleProcess: (name: string) => void;
  showAssignButton: boolean;
  onAssign: () => void;
  onViewAssigned?: () => void;
  showDownloadDropdown: string | null;
  setShowDownloadDropdown: (name: string | null) => void;
  isAllExpanded: (name: string, group: ProcessGroup) => boolean;
  expandAllProcess: (name: string, group: ProcessGroup) => void;
  collapseAllProcess: (name: string, group: ProcessGroup) => void;
  ProcessDownload: React.ComponentType<{
    processName: string;
    groupedSOPs: ProcessGroup[];
    onDownloadComplete: () => void;
  }>;
  RCMDownload: React.ComponentType<{
    processName: string;
    groupedSOPs: ProcessGroup[];
    regeneratedSOPs: GeneratedSOP[];
    setRegeneratedSOPs: (sops: GeneratedSOP[]) => void;
    onDownloadComplete: () => void;
  }>;
  groupedSOPs: ProcessGroup[];
  regeneratedSOPs: GeneratedSOP[];
  setRegeneratedSOPs: (sops: GeneratedSOP[]) => void;
  userPlan: {
    canDownloadProcess: boolean;
    canDownloadRCM: boolean;
    canDownloadPDF: boolean;
  } | null;
  loadingPlan: boolean;
}

export default function ProcessGroupHeader({
  group,
  isProcessExpanded,
  toggleProcess,
  showAssignButton,
  onAssign,
  onViewAssigned,
  showDownloadDropdown,
  setShowDownloadDropdown,
  isAllExpanded,
  expandAllProcess,
  collapseAllProcess,
  ProcessDownload,
  RCMDownload,
  groupedSOPs,
  regeneratedSOPs,
  setRegeneratedSOPs,
  userPlan,
  loadingPlan,
}: ProcessGroupHeaderProps) {
  const [showProcessDownload, setShowProcessDownload] = useState(false);
  const [showRCMDownload, setShowRCMDownload] = useState(false);

  // Add ref to track if RCM download was already triggered
  const rcmDownloadTriggeredRef = useRef(false);

  console.log("🔍 DEBUG ProcessGroupHeader:");
  console.log("userPlan:", userPlan);
  console.log("loadingPlan:", loadingPlan);
  console.log("userPlan?.canDownloadProcess:", userPlan?.canDownloadProcess);
  console.log("userPlan?.canDownloadRCM:", userPlan?.canDownloadRCM);
  console.log("userPlan?.canDownloadPDF:", userPlan?.canDownloadPDF);

  const handleRCMDownloadComplete = () => {
    setShowRCMDownload(false);
    rcmDownloadTriggeredRef.current = false; // Reset when complete
  };

  const handleRCMDownloadClick = () => {
    if (userPlan?.canDownloadRCM) {
      // Prevent multiple triggers
      if (!rcmDownloadTriggeredRef.current) {
        rcmDownloadTriggeredRef.current = true;
        setShowRCMDownload(true);
      }
      setShowDownloadDropdown(null);
    } else {
      alert(
        "This feature is not included in your current plan. Please upgrade your plan to access this download option."
      );
      setShowDownloadDropdown(null);
    }
  };

  const handleProcessDownloadClick = () => {
    if (userPlan?.canDownloadProcess) {
      setShowProcessDownload(true);
      setShowDownloadDropdown(null);
    } else {
      alert(
        "This feature is not included in your current plan. Please upgrade your plan to access this download option."
      );
      setShowDownloadDropdown(null);
    }
  };

  const handlePDFDownloadClick = () => {
    if (userPlan?.canDownloadPDF) {
      alert("Download PDF functionality to be implemented");
      setShowDownloadDropdown(null);
    } else {
      alert(
        "This feature is not included in your current plan. Please upgrade your plan to access this download option."
      );
      setShowDownloadDropdown(null);
    }
  };

  return (
    <>
      <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => toggleProcess(group.process)}
              className="text-purple-400 hover:text-purple-300 transition"
            >
              <FiChevronRight
                className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform ${
                  isProcessExpanded(group.process) ? "rotate-90" : ""
                }`}
              />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-1">
                <div className="p-1.5 sm:p-2 bg-purple-500/30 rounded-lg flex-shrink-0">
                  <FiFolder className="w-5 h-5 sm:w-6 sm:h-6 text-purple-200" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-white break-words">
                  {group.process}
                </h2>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 ml-11 sm:ml-0">
            <span className="px-3 sm:px-4 py-1.5 bg-slate-700/50 text-gray-300 rounded-full text-xs sm:text-sm font-medium">
              {group.subprocesses.length} Subprocesses
            </span>
            {showAssignButton && (
              <>
                <button
                  onClick={onAssign}
                  className="px-2 sm:px-3 py-1 bg-purple-500/20 text-purple-300 rounded text-xs hover:bg-purple-500/30 transition flex items-center gap-1"
                >
                  <FiUserPlus className="w-3 h-3" />
                  Assign
                </button>
                {group.assignedSubUsers &&
                  group.assignedSubUsers.length > 0 && (
                    <button
                      onClick={onViewAssigned}
                      className="px-2 sm:px-3 py-1 bg-green-500/20 text-green-300 rounded text-xs hover:bg-green-500/30 transition flex items-center gap-1"
                    >
                      <FiUsers className="w-3 h-3" />
                      View Assigned ({group.assignedSubUsers.length})
                    </button>
                  )}
              </>
            )}
            <div className="relative">
              <button
                onClick={() =>
                  setShowDownloadDropdown(
                    showDownloadDropdown === group.process
                      ? null
                      : group.process
                  )
                }
                className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded text-xs hover:bg-blue-500/30 transition flex items-center gap-1"
              >
                <FiDownload className="w-3 h-3" />
                Download
              </button>
              {showDownloadDropdown === group.process && (
                <div className="absolute top-full mt-1 right-0  border border-slate-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                  {loadingPlan ? (
                    <div className="px-3 py-2 text-xs text-gray-400">
                      Loading...
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleProcessDownloadClick}
                        className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-slate-700 hover:text-white transition"
                      >
                        Download SOP
                      </button>
                      <button
                        onClick={handleRCMDownloadClick}
                        className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-slate-700 hover:text-white transition"
                      >
                        Download RCM
                      </button>
                      <button
                        onClick={handlePDFDownloadClick}
                        className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-slate-700 hover:text-white transition"
                      >
                        Download PDF
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (isAllExpanded(group.process, group)) {
                  collapseAllProcess(group.process, group);
                } else {
                  expandAllProcess(group.process, group);
                }
              }}
              className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded text-xs hover:bg-purple-500/30 transition flex items-center gap-1"
            >
              {isAllExpanded(group.process, group) ? (
                <>
                  <FiMinus className="w-3 h-3" />
                  Collapse All
                </>
              ) : (
                <>
                  <FiPlus className="w-3 h-3" />
                  Expand All
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showProcessDownload && (
        <ProcessDownload
          processName={group.process}
          groupedSOPs={groupedSOPs}
          onDownloadComplete={() => setShowProcessDownload(false)}
        />
      )}

      {showRCMDownload && (
        <RCMDownload
          processName={group.process}
          groupedSOPs={groupedSOPs}
          regeneratedSOPs={regeneratedSOPs}
          setRegeneratedSOPs={setRegeneratedSOPs}
          onDownloadComplete={handleRCMDownloadComplete}
        />
      )}
    </>
  );
}
