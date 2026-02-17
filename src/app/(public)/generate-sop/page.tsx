"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loader from "@/components/shared/Loader";
import QuestionForm from "@/components/pages/sop/QuestionForm";
import ProcessSelection from "@/components/pages/sop/ProcessSelection";
import SubProcessSelectionSingle from "@/components/pages/sop/SubProcessSelectionSingle";
import SingleSOPResults from "@/components/pages/sop/SingleSOPResults";
import CompletedStep from "@/components/pages/sop/CompletedStep";
import SessionSelection from "@/components/pages/sop/SessionSelection";
import {
  Question,
  AnswerValue,
  GeneratedSOP,
  ProjectSession,
} from "../../../../types";
import { useToast } from "@/components/ui/ToastProvider";

export default function GenerateSOPPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<
    | "session"
    | "form"
    | "processes"
    | "subprocesses"
    | "generating"
    | "results"
    | "completed"
  >("session");
  const [sessions, setSessions] = useState<ProjectSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ProjectSession | null>(
    null
  );
  const [processes, setProcesses] = useState<string[]>([]);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [subprocesses, setSubprocesses] = useState<Record<string, string[]>>(
    {}
  );
  const [selectedSubprocesses, setSelectedSubprocesses] = useState<
    Record<string, string[]>
  >({});
  const [generatedSOPs, setGeneratedSOPs] = useState<GeneratedSOP[]>([]);
  const [currentProcessIndex, setCurrentProcessIndex] = useState(0);
  const [currentProcessSOPs, setCurrentProcessSOPs] = useState<GeneratedSOP[]>(
    []
  );
  const [loadingMessage, setLoadingMessage] = useState("");
  const [userPlan, setUserPlan] = useState<{
    processLimit: number;
    subprocessLimit: number;
    name: string;
    remainingProcesses: number;
    remainingSubprocesses: number;
    isAdmin?: boolean;
  } | null>(null);
  const { showError, showSuccess, showWarning } = useToast();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    fetchSessions();
    fetchQuestions();
    fetchUserPlan();
  }, [session, status, router]);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions");
      if (!response.ok) throw new Error("Failed to fetch sessions");

      const data = await response.json();
      setSessions(data.sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/questions");
      if (!response.ok) throw new Error("Failed to fetch questions");

      const data: { questions: Question[] } = await response.json();
      const sorted = [...data.questions].sort((a, b) => {
        const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
        const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
        if (aOrder !== bOrder) return aOrder - bOrder;
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aTime - bTime; // fallback: oldest first
      });

      setQuestions(sorted);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPlan = async () => {
    try {
      const response = await fetch("/api/user/plan");
      if (!response.ok) throw new Error("Failed to fetch user plan");

      const data = await response.json();
      setUserPlan({
        ...data.plan,
        processLimit: data.remainingProcesses,
        subprocessLimit: data.remainingSubprocesses,
        remainingProcesses: data.remainingProcesses,
        remainingSubprocesses: data.remainingSubprocesses,
        isAdmin: data.isAdmin ?? false,
      });
    } catch (error) {
      console.error("Error fetching user plan:", error);
      // Set default limits if no plan found
      setUserPlan({
        processLimit: 1,
        subprocessLimit: 2,
        name: "Free",
        remainingProcesses: 1,
        remainingSubprocesses: 2,
        isAdmin: false,
      });
    }
  };

  const handleSessionSelect = (session: ProjectSession | null) => {
    setSelectedSession(session);
    setCurrentStep("form");
  };

  const handleFormSubmit = async (formAnswers: Record<string, AnswerValue>) => {
    setAnswers(formAnswers);

    try {
      const response = await fetch("/api/generate-process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: formAnswers,
          projectSessionId: selectedSession?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate processes");
      }

      const data = await response.json();
      setProcesses(data.processes);
      setCurrentStep("processes");
      showSuccess(
        "Processes generated successfully! Please select the ones you need."
      );
    } catch (error) {
      console.error("Error generating SOP:", error);
      showError("Failed to generate processes. Please try again.");
    }
  };

  const currentProcess = useMemo(
    () => selectedProcesses[currentProcessIndex] || null,
    [selectedProcesses, currentProcessIndex]
  );

  const formatAnswer = (answer: AnswerValue) => {
    if (answer === null || answer === undefined || answer === "") return null;
    if (Array.isArray(answer)) return answer.join(", ");
    if (typeof answer === "object" && "name" in answer) {
      return (answer as File).name || "File uploaded";
    }
    return String(answer);
  };

  const buildCompanyDetails = () =>
    questions
      .map((question) => {
        const formatted = formatAnswer(answers[question.id]);
        return formatted ? `${question.questionText}: ${formatted}` : null;
      })
      .filter(Boolean)
      .join("\n");

  const handleProcessesSubmit = async (selectedProcs: string[]) => {
    if (selectedProcs.length === 0) {
      showError("Please select at least one process.");
      return;
    }

    if (
      userPlan &&
      !userPlan.isAdmin &&
      selectedProcs.length > userPlan.remainingProcesses
    ) {
      showWarning(
        `You selected ${selectedProcs.length} process(es), but only ${userPlan.remainingProcesses} credits are left. We will generate up to ${userPlan.remainingProcesses}.`
      );
    }

    setSelectedProcesses(selectedProcs);
    setCurrentProcessIndex(0);
    setLoadingMessage("Preparing subprocesses...");
    setCurrentStep("generating");

    const companyDetails = buildCompanyDetails();
    const newSubprocesses: Record<string, string[]> = {};
    const newSelectedSubprocesses: Record<string, string[]> = {};

    try {
      const promises = selectedProcs.map(async (process) => {
        const response = await fetch("/api/generate-subprocesses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            process,
            companyDetails,
            projectSessionId: selectedSession?.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to generate subprocesses for ${process}: ${errorData.error}`
          );
        }

        return await response.json();
      });

      const results = await Promise.all(promises);

      results.forEach((result) => {
        newSubprocesses[result.process] = result.subprocesses;
        newSelectedSubprocesses[result.process] = [];
      });

      setSubprocesses(newSubprocesses);
      setSelectedSubprocesses(newSelectedSubprocesses);
      setCurrentStep("subprocesses");
      showSuccess(
        `Subprocesses loaded for ${selectedProcs.length} process(es)!`
      );
    } catch (error) {
      console.error("Error generating subprocesses:", error);
      showError("Failed to generate subprocesses. Please try again.");
      setCurrentStep("processes");
    }
  };

  const handleSubprocessSubmitForProcess = async (
    process: string,
    subprocessList: string[]
  ) => {
    if (!process) return;

    if (subprocessList.length === 0) {
      showError("Please select at least one subprocess");
      return;
    }

    const updatedSelections = {
      ...selectedSubprocesses,
      [process]: subprocessList,
    };

    const totalSubprocessesSelected = Object.values(updatedSelections).reduce(
      (acc, subs) => acc + subs.length,
      0
    );

    if (
      userPlan &&
      !userPlan.isAdmin &&
      totalSubprocessesSelected > userPlan.remainingSubprocesses
    ) {
      showWarning(
        `You selected ${totalSubprocessesSelected} subprocess(es), but only ${userPlan.remainingSubprocesses} credits are left. We will generate up to ${userPlan.remainingSubprocesses}.`
      );
    }

    setSelectedSubprocesses(updatedSelections);
    setLoadingMessage(`Generating SOP for ${process}...`);
    setCurrentStep("generating");

    try {
      const results: GeneratedSOP[] = [];
      let stoppedForCredits = false;

      for (const subprocess of subprocessList) {
        const response = await fetch("/api/generate-detailed-sop", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            process: process.trim(),
            subprocess: subprocess.trim(),
            projectSessionId: selectedSession?.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 403) {
            stoppedForCredits = true;
            break;
          }
          throw new Error(
            `Failed to generate SOP for ${process} - ${subprocess}: ${errorData.error}`
          );
        }

        results.push(await response.json());
      }

      if (results.length > 0) {
        setGeneratedSOPs((prev) => [
          ...prev.filter((sop) => sop.process !== process),
          ...results,
        ]);
        setCurrentProcessSOPs(results);
        setCurrentStep("results");
        showSuccess(`${results.length} SOP(s) generated for ${process}`);
        if (stoppedForCredits) {
          showWarning(
            "Credits exhausted. We generated what we could for this process."
          );
        }
      } else if (stoppedForCredits) {
        showWarning(
          "Credits exhausted. Please recharge to generate more subprocesses."
        );
        setCurrentStep("subprocesses");
      }
    } catch (error) {
      console.error("Error generating SOPs:", error);
      showError("Failed to generate SOPs. Please try again.");
      setCurrentStep("subprocesses");
    }
  };

  const handleNextProcess = () => {
    if (currentProcessIndex < selectedProcesses.length - 1) {
      setCurrentProcessIndex((prev) => prev + 1);
      setCurrentProcessSOPs([]);
      setCurrentStep("subprocesses");
      return;
    }

    setCurrentStep("completed");
  };

  const handleRestart = () => {
    setCurrentStep("form");
    setGeneratedSOPs([]);
    setSelectedProcesses([]);
    setSelectedSubprocesses({});
    setSubprocesses({});
    setCurrentProcessIndex(0);
    setCurrentProcessSOPs([]);
    setLoadingMessage("");
  };

  if (status === "loading" || loading) return <Loader />;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {currentStep === "session" && (
            <SessionSelection
              sessions={sessions}
              onSelect={handleSessionSelect}
            />
          )}

          {currentStep === "form" && (
            <QuestionForm
              questions={questions}
              initialAnswers={answers}
              onSubmit={handleFormSubmit}
            />
          )}

          {currentStep === "processes" && userPlan && (
            <ProcessSelection
              processes={processes}
              initialSelected={selectedProcesses}
              onSubmit={handleProcessesSubmit}
              onBack={() => setCurrentStep("form")}
              processLimit={userPlan.processLimit}
              isUnlimited={!!userPlan.isAdmin}
            />
          )}

          {currentStep === "subprocesses" && userPlan && currentProcess && (
            <SubProcessSelectionSingle
              key={currentProcess}
              process={currentProcess}
              subprocesses={subprocesses[currentProcess] || []}
              initialSelected={selectedSubprocesses[currentProcess] || []}
              subprocessLimit={userPlan.subprocessLimit}
              isUnlimited={!!userPlan.isAdmin}
              onBack={() => setCurrentStep("processes")}
              onSubmit={(subs) =>
                handleSubprocessSubmitForProcess(currentProcess, subs)
              }
            />
          )}

          {currentStep === "generating" && (
            <Loader
              message={loadingMessage || "Generating SOP..."}
              subMessage="Hang tight while we build your SOP."
            />
          )}

          {currentStep === "results" && currentProcess && (
            <SingleSOPResults
              processName={currentProcess}
              generatedSOPs={currentProcessSOPs}
              onNext={handleNextProcess}
              hasNext={currentProcessIndex < selectedProcesses.length - 1}
            />
          )}

          {currentStep === "completed" && (
            <CompletedStep
              totalProcesses={selectedProcesses.length}
              totalSubprocesses={generatedSOPs.length}
              onRestart={handleRestart}
            />
          )}
        </div>
      </div>
    </div>
  );
}
