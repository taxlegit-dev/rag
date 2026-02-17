import { useRouter } from "next/navigation";
import { ProjectSession, GeneratedSOP, SubUser } from "../../../types/index";
import SOPResults from "@/components/pages/sop/SOPResults";
import { ArrowLeft, Lightbulb, ScrollText } from "lucide-react";

interface SOPSectionProps {
  projectSessions: ProjectSession[];
  viewingSOPs: GeneratedSOP[] | null;
  viewingSessionName: string;
  viewingSessionId: string;
  subUsers: SubUser[];
  isSubUser: boolean;
  onViewSOPs: (sessionId: string, sessionName: string) => void;
  onDeleteSession: (session: ProjectSession) => void;
  onAssignSOP: (process: string, subUserId: string) => Promise<void>;
  onRemoveSOP: (process: string, subUserId: string) => Promise<void>;
  onBackToSessions: () => void;
}

export default function SOPSection({
  projectSessions,
  viewingSOPs,
  subUsers,
  isSubUser,
  onViewSOPs,
  onDeleteSession,
  onAssignSOP,
  onRemoveSOP,
  onBackToSessions,
}: SOPSectionProps) {
  const router = useRouter();

  if (isSubUser) return null;

  if (viewingSOPs) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={onBackToSessions}
            className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-3" />
            Back to Sessions
          </button>
        </div>
        <SOPResults
          generatedSOPs={viewingSOPs}
          onRestart={onBackToSessions}
          onAssign={onAssignSOP}
          onRemove={onRemoveSOP}
          showAssignButton={true}
          subUsers={subUsers}
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-purple-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-white">SOPs</h3>
        <button
          onClick={() => router.push("/generate-sop")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center"
        >
          <Lightbulb className="w-5 h-5 mr-3 text-yellow-400" />
          Generate SOP
        </button>
      </div>
      <div className="space-y-4">
        {projectSessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between py-4 px-4 bg-slate-700 rounded-lg border border-slate-600"
          >
            <div>
              <p className="text-lg font-medium text-white">{session.name}</p>
              <p className="text-sm text-gray-400">
                Created {new Date(session.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onViewSOPs(session.id, session.name)}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
              >
                View
              </button>
              <button
                onClick={() => onDeleteSession(session)}
                className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {projectSessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ScrollText className="w-16 h-16 text-gray-400 mb-3" />
            <p className="text-gray-400 text-lg">No SOPs created yet.</p>
            <p className="text-gray-500 mt-2">
              Generate your first SOP to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
