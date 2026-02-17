import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Task } from "../../../../types";
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

interface ProcessDownloadProps {
  processName: string;
  groupedSOPs: ProcessGroup[];
  onDownloadComplete?: () => void;
}

export const downloadExcel = (
  processName: string,
  groupedSOPs: ProcessGroup[]
) => {
  console.log("Starting downloadExcel for process:", processName);
  const group = groupedSOPs.find((g) => g.process === processName);

  if (!group) {
    console.error("No group found for process:", processName);
    alert("No data found for this process. Please check the process name.");
    return false;
  }

  console.log("Group found:", group);

  try {
    interface ProcessRow {
      Process: string;
      Subprocess: string;
      Task: string;
      Makers: string;
      Checkers: string;
      "Step Action": string;
      "Step Risk": string;
      "Step Mitigation": string;
    }

    const excelData: ProcessRow[] = [];
    let lastProcess = "";
    let lastSubprocess = "";
    let lastTask = "";

    // Check if subprocesses exist and have tasks
    if (!group.subprocesses || group.subprocesses.length === 0) {
      console.error("No subprocesses found for process:", processName);
      alert("No subprocesses available to download for this process.");
      return false;
    }

    group.subprocesses.forEach((subprocess) => {
      if (!subprocess.tasks || subprocess.tasks.length === 0) {
        console.warn("No tasks in subprocess:", subprocess.subprocess);
        return;
      }

      subprocess.tasks.forEach((task) => {
        if (!task.steps || task.steps.length === 0) {
          console.warn("No steps in task:", task.task);
          return;
        }

        task.steps.forEach((step) => {
          const showProcess = group.process !== lastProcess;
          const showSubprocess = subprocess.subprocess !== lastSubprocess;
          const showTask = task.task !== lastTask;

          excelData.push({
            Process: showProcess ? group.process : "",
            Subprocess: showSubprocess ? subprocess.subprocess : "",
            Task: showTask ? task.task : "",
            Makers: showTask ? task.makers || "" : "",
            Checkers: showTask ? task.checkers || "" : "",
            "Step Action": step.action || "",
            "Step Risk": step.risk || "",
            "Step Mitigation": step.mitigation || "",
          });

          lastProcess = group.process;
          lastSubprocess = subprocess.subprocess;
          lastTask = task.task;
        });
      });
    });

    if (excelData.length === 0) {
      console.error("No data to download for process:", processName);
      alert("No data available to download for this process.");
      return false;
    }

    console.log("Excel data created with", excelData.length, "rows");

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 20 }, // Process
      { wch: 25 }, // Subprocess
      { wch: 40 }, // Task
      { wch: 20 }, // Makers
      { wch: 20 }, // Checkers
      { wch: 50 }, // Step Action
      { wch: 40 }, // Step Risk
      { wch: 40 }, // Step Mitigation
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Process Details");

    // Generate filename
    const fileName = `${processName.replace(
      /[^a-z0-9]/gi,
      "_"
    )}_Process_Details.xlsx`;
    console.log("Attempting to download file:", fileName);

    // Try direct writeFile first (works in most cases)
    try {
      XLSX.writeFile(workbook, fileName);
      console.log("Download successful using writeFile");
      return true;
    } catch (writeError) {
      console.warn("writeFile failed, trying blob method:", writeError);

      // Fallback to blob method
      const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
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

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      console.log("Download successful using blob method");
      return true;
    }
  } catch (error) {
    console.error("Error generating Process Excel:", error);
    alert(
      `Failed to generate Excel file: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return false;
  }
};

const ProcessDownload: React.FC<ProcessDownloadProps> = ({
  processName,
  groupedSOPs,
  onDownloadComplete,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Use ref to track if download has been triggered
  const hasDownloadedRef = useRef(false);

  // Auto-trigger download when component mounts (only once)
  React.useEffect(() => {
    // Skip if already downloaded or if currently downloading
    if (hasDownloadedRef.current || isDownloading) {
      if (onDownloadComplete) {
        onDownloadComplete();
      }
      return;
    }

    const triggerDownload = async () => {
      // Prevent multiple simultaneous downloads
      if (isDownloading || hasDownloadedRef.current) {
        console.log("Download already in progress or completed, skipping...");
        return;
      }

      hasDownloadedRef.current = true;
      console.log("Download button clicked for process:", processName);
      setIsDownloading(true);

      // Small delay to ensure UI updates
      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        const success = downloadExcel(processName, groupedSOPs);

        if (success) {
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 3000);
        }
      } catch (error) {
        console.error("Error downloading process:", error);
        alert(
          `Failed to download process: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setIsDownloading(false);
        if (onDownloadComplete) {
          onDownloadComplete();
        }
      }
    };

    triggerDownload();

    return () => {
      // Cleanup if component unmounts during download
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - this should run only once on mount

  return (
    <>
      {/* Process Download Loading Toast */}
      {isDownloading && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-purple-500/90 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg border border-purple-400/50 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
          <div>
            <p className="font-medium">Generating Process Excel</p>
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
            <p className="font-medium">Process Excel Downloaded</p>
            <p className="text-green-100 text-sm">
              Your file is ready in your downloads folder
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ProcessDownload;
