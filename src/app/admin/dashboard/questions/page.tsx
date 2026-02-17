"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Edit2, Trash2 } from "lucide-react";

interface Question {
  id: string;
  questionText: string;
  inputType: string;
  options: string[] | null;
  isRequired: boolean;
  sortOrder: number | null;
  createdAt: string;
}

export default function QuestionsListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(
    null
  );

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/admin/questions");
      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }
      const data = await response.json();
      setQuestions(data.questions);
    } catch (err) {
      console.log(err);
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (question: Question) => {
    setQuestionToDelete(question);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!questionToDelete) return;

    setDeleteLoading(questionToDelete.id);
    try {
      const response = await fetch(
        `/api/admin/questions?id=${questionToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      // Remove from local state
      setQuestions(questions.filter((q) => q.id !== questionToDelete.id));
      setShowDeleteModal(false);
      setQuestionToDelete(null);
    } catch (err) {
      console.log(err);
      setError("Failed to delete question");
    } finally {
      setDeleteLoading(null);
    }
  };

  const getInputTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      text: "Text",
      number: "Number",
      file: "File",
      dropdown: "Dropdown",
      radio: "Radio",
      checkbox: "Checkbox",
    };
    return labels[type] || type;
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== "ADMIN") {
    router.push("/admin/login");
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dynamic Questions</h1>
        <Link
          href="/admin/dashboard/questions/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Create New Question
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No questions found.</p>
          <Link
            href="/admin/dashboard/questions/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Create your first question
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Options
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Required
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {question.sortOrder ?? "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {question.questionText}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getInputTypeLabel(question.inputType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {question.options ? question.options.join(", ") : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          question.isRequired
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {question.isRequired ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(question.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/dashboard/questions/edit/${question.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          aria-label="Edit question"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(question)}
                          disabled={deleteLoading === question.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Delete question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && questionToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Delete Question
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this question? This action
                  cannot be undone.
                </p>
                <p className="mt-2 text-sm font-medium text-gray-900">
                  &quot;{questionToDelete.questionText}&quot;
                </p>
              </div>
              <div className="flex items-center px-4 py-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-900 text-base font-medium rounded-md w-full mr-2 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading === questionToDelete.id}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full ml-2 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading === questionToDelete.id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
