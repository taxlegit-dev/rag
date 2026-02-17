import React, { useState, useEffect, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { GeneratedSOP, Task } from "../../../../types";
import { FiDownload } from "react-icons/fi";

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

interface ProcessGroup {
  process: string;
  subprocesses: {
    subprocess: string;
    sopId: string;
    tasks: Task[];
    assignedSubUsers?: SubUser[];
  }[];
  assignedSubUsers?: SubUser[];
}

interface RCMDownloadProps {
  processName: string;
  groupedSOPs: ProcessGroup[];
  regeneratedSOPs: GeneratedSOP[];
  setRegeneratedSOPs: (sops: GeneratedSOP[]) => void;
  onDownloadComplete?: () => void;
}

const RCMDownload: React.FC<RCMDownloadProps> = ({
  processName,
  groupedSOPs,
  regeneratedSOPs,
  setRegeneratedSOPs,
  onDownloadComplete,
}) => {
  const [isDownloadingRCM, setIsDownloadingRCM] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Use ref to track if download has been triggered
  const hasDownloadedRef = useRef(false);

  // Wrap downloadRCM in useCallback to stabilize the function reference
  const downloadRCM = useCallback(async () => {
    // Prevent multiple simultaneous downloads
    if (isDownloadingRCM || hasDownloadedRef.current) {
      return;
    }

    hasDownloadedRef.current = true;
    const group = groupedSOPs.find((g) => g.process === processName);
    if (!group) {
      console.error("No group found for process:", processName);
      alert("No data found for this process. Please check the process name.");
      if (onDownloadComplete) {
        onDownloadComplete();
      }
      return;
    }

    setIsDownloadingRCM(true);

    try {
      // Collect all tasks that need RCM fields generated
      const tasksToGenerate: {
        subprocessId: string;
        taskIndex: number;
        taskName: string;
      }[] = [];

      for (const subprocess of group.subprocesses) {
        const currentSOP = regeneratedSOPs.find(
          (sop) =>
            sop.process === group.process &&
            sop.subprocess === subprocess.subprocess
        );

        if (currentSOP?.id) {
          subprocess.tasks.forEach((task, taskIndex) => {
            const missingFields = [];
            if (!task.riskDescription) missingFields.push("riskDescription");
            if (!task.riskRating) missingFields.push("riskRating");
            if (!task.fraudRisk) missingFields.push("fraudRisk");
            if (!task.financialStatementAssertionControl)
              missingFields.push("financialStatementAssertionControl");
            if (!task.controlReference) missingFields.push("controlReference");
            if (task.isOperationalFinancialKeyControl === undefined)
              missingFields.push("isOperationalFinancialKeyControl");
            if (!task.frequencyOfControl)
              missingFields.push("frequencyOfControl");
            if (!task.natureOfControl) missingFields.push("natureOfControl");
            if (!task.itApplicationUsed)
              missingFields.push("itApplicationUsed");
            if (!task.spocControlOwner) missingFields.push("spocControlOwner");
            if (!task.controlAsIs) missingFields.push("controlAsIs");

            if (missingFields.length > 0) {
              tasksToGenerate.push({
                subprocessId: currentSOP.id!,
                taskIndex,
                taskName: task.task,
              });
            }
          });
        }
      }

      // Generate RCM fields for tasks that need them and collect updated tasks
      const updatedTasks: {
        subprocessId: string;
        taskIndex: number;
        task: Task;
      }[] = [];

      for (const taskInfo of tasksToGenerate) {
        try {
          const response = await fetch("/api/generate-rcm-fields", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              subprocessId: taskInfo.subprocessId,
              taskIndex: taskInfo.taskIndex,
              taskName: taskInfo.taskName,
              processName: group.process,
              subprocessName: group.subprocesses.find((sub) =>
                regeneratedSOPs.find(
                  (sop) =>
                    sop.id === taskInfo.subprocessId &&
                    sop.subprocess === sub.subprocess
                )
              )?.subprocess,
            }),
          });

          if (!response.ok) {
            console.warn(
              `Failed to generate RCM for task ${taskInfo.taskName}: ${response.statusText}`
            );
            continue;
          }

          const responseData = await response.json();
          updatedTasks.push({
            subprocessId: taskInfo.subprocessId,
            taskIndex: taskInfo.taskIndex,
            task: {
              ...responseData.task,
              controlAsIs: responseData.task.controlAsIs || "",
            },
          });
        } catch (error) {
          console.warn(
            `Error generating RCM for task ${taskInfo.taskName}:`,
            error
          );
        }
      }

      // Update the regeneratedSOPs state with the new tasks
      const updatedSOPs = regeneratedSOPs.map((sop) => {
        const updated = updatedTasks.find((u) => u.subprocessId === sop.id);
        if (updated) {
          const newTasks = [...sop.tasks];
          newTasks[updated.taskIndex] = updated.task;
          return { ...sop, tasks: newTasks };
        }
        return sop;
      });

      setRegeneratedSOPs(updatedSOPs);

      // Create RCM Excel with improved data structure
      interface RCMRow {
        Process: string;
        Subprocess: string;
        Task: string;
        Steps: string;
        Risk: string;
        "Risk Description": string;
        "Risk Rating": string;
        "Fraud Risk (Yes/No)": string;
        "Control Reference": string;
        "Financial Statement Assertion": string;
        "Key Control (Yes/No)": string;
        "Frequency of Control": string;
        "Nature of Control": string;
        "IT Application Used": string;
        "SPOC/Control Owner": string;
        "Control As-Is (Current Procedure)": string;
      }

      const excelData: RCMRow[] = [];
      let lastProcess = "";
      let lastSubprocess = "";
      let lastTask = "";

      group.subprocesses.forEach((subprocess) => {
        const currentSOP = updatedSOPs.find(
          (sop) =>
            sop.process === group.process &&
            sop.subprocess === subprocess.subprocess
        );

        const tasksToUse = currentSOP ? currentSOP.tasks : subprocess.tasks;

        tasksToUse.forEach((task) => {
          const controlAsIs =
            (typeof task.controlAsIs === "string" && task.controlAsIs.trim()) ||
            `Control performed by ${task.makers} involving ${task.steps.length} steps`;

          task.steps.forEach((step) => {
            const showProcess = group.process !== lastProcess;
            const showSubprocess = subprocess.subprocess !== lastSubprocess;
            const showTask = task.task !== lastTask;

            excelData.push({
              Process: showProcess ? group.process : "",
              Subprocess: showSubprocess ? subprocess.subprocess : "",
              Task: showTask ? task.task : "",
              Steps: `Step ${step.step_no}: ${step.action}`,
              Risk: step.risk || "",
              "Risk Description": task.riskDescription || "",
              "Risk Rating": task.riskRating || "",
              "Fraud Risk (Yes/No)":
                String(task.fraudRisk || "no").toLowerCase() === "yes"
                  ? "Yes"
                  : "No",
              "Control Reference": task.controlReference || "TBD",
              "Financial Statement Assertion":
                task.financialStatementAssertionControl || "",
              "Key Control (Yes/No)": task.isOperationalFinancialKeyControl
                ? "Yes"
                : "No",
              "Frequency of Control": task.frequencyOfControl || "",
              "Nature of Control": task.natureOfControl || "",
              "IT Application Used": task.itApplicationUsed || "Manual",
              "SPOC/Control Owner":
                task.spocControlOwner || task.makers || "TBD",
              "Control As-Is (Current Procedure)": controlAsIs,
            });

            lastProcess = group.process;
            lastSubprocess = subprocess.subprocess;
            lastTask = task.task;
          });
        });
      });

      if (excelData.length === 0) {
        console.error("No data to download for RCM:", processName);
        alert("No data available to download for RCM.");
        if (onDownloadComplete) {
          onDownloadComplete();
        }
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths for better readability
      worksheet["!cols"] = [
        { wch: 20 }, // Process
        { wch: 25 }, // Subprocess
        { wch: 30 }, // Task
        { wch: 50 }, // Steps
        { wch: 30 }, // Risk
        { wch: 50 }, // Risk Description
        { wch: 12 }, // Risk Rating
        { wch: 15 }, // Fraud Risk
        { wch: 25 }, // Control Reference
        { wch: 25 }, // Financial Statement Assertion
        { wch: 15 }, // Key Control
        { wch: 20 }, // Frequency of Control
        { wch: 20 }, // Nature of Control
        { wch: 20 }, // IT Application Used
        { wch: 25 }, // SPOC/Control Owner
        { wch: 60 }, // Control As-Is
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "RCM Matrix");

      // Generate filename
      const fileName = `${processName.replace(
        /[^a-z0-9]/gi,
        "_"
      )}_RCM_Matrix.xlsx`;
      console.log("Attempting to download RCM file:", fileName);

      // Try direct writeFile first
      try {
        XLSX.writeFile(workbook, fileName);
        console.log("RCM download successful using writeFile");
      } catch (writeError) {
        console.warn("writeFile failed, trying blob method:", writeError);

        // Fallback to blob method
        const buffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);

        console.log("RCM download successful using blob method");
      }

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error("Error generating RCM:", error);
      alert(
        `Failed to generate RCM: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsDownloadingRCM(false);
      if (onDownloadComplete) {
        onDownloadComplete();
      }
    }
  }, [
    isDownloadingRCM,
    groupedSOPs,
    processName,
    onDownloadComplete,
    regeneratedSOPs,
    setRegeneratedSOPs,
  ]);

  // Auto-trigger download when component mounts (only once)
  useEffect(() => {
    // Skip if already downloaded or if currently downloading
    if (hasDownloadedRef.current || isDownloadingRCM) {
      if (onDownloadComplete) {
        onDownloadComplete();
      }
      return;
    }

    const triggerDownload = async () => {
      await downloadRCM();
    };

    triggerDownload();

    return () => {
      // Cleanup if component unmounts during download
    };
  }, [downloadRCM, isDownloadingRCM, onDownloadComplete]);

  return (
    <>
      {/* RCM Download Loading Toast */}
      {isDownloadingRCM && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-purple-500/90 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg border border-purple-400/50 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
          <div>
            <p className="font-medium">Generating RCM Matrix</p>
            <p className="text-purple-100 text-sm">
              Please wait while we prepare your file...
            </p>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-green-500/90 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg border border-green-400/50 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
            <FiDownload className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium">RCM Matrix Downloaded</p>
            <p className="text-green-100 text-sm">
              Your file is ready in your downloads folder
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default RCMDownload;
