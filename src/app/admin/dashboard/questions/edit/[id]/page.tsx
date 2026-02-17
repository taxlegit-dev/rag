"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  CheckCircle,
  FileText,
  Hash,
  List,
  Loader2,
  AlertCircle,
  Save,
  Type,
  X,
} from "lucide-react";

type QuestionResponse = {
  question: {
    id: string;
    questionText: string;
    inputType: string;
    options: string[] | null;
    isRequired: boolean;
    sortOrder: number | null;
  };
};

export default function EditQuestionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const questionId =
    typeof params.id === "string" ? params.id : params.id?.[0];

  const [formData, setFormData] = useState({
    questionText: "",
    inputType: "text",
    options: "",
    isRequired: false,
    sortOrder: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputTypes = [
    { value: "text", label: "Text", icon: Type },
    { value: "number", label: "Number", icon: Hash },
    { value: "file", label: "File", icon: FileText },
    { value: "dropdown", label: "Dropdown", icon: List },
    { value: "radio", label: "Radio", icon: Check },
    { value: "checkbox", label: "Checkbox", icon: Check },
  ];

  const showOptionsField = ["dropdown", "radio", "checkbox"].includes(
    formData.inputType
  );

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "ADMIN") {
      router.push("/admin/login");
      return;
    }

    if (!questionId) {
      setError("Invalid question ID");
      setLoading(false);
      return;
    }

    const fetchQuestion = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/questions?id=${questionId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch question");
        }
        const data = (await response.json()) as QuestionResponse;
        const question = data.question;

        setFormData({
          questionText: question.questionText || "",
          inputType: question.inputType || "text",
          options: Array.isArray(question.options)
            ? question.options.join(", ")
            : "",
          isRequired: Boolean(question.isRequired),
          sortOrder:
            typeof question.sortOrder === "number"
              ? String(question.sortOrder)
              : "",
        });
      } catch (err) {
        console.log(err);
        setError("Failed to load question");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId, router, session, status]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionId) return;

    setSaving(true);
    setError("");
    setSuccess("");

    if (!formData.questionText.trim()) {
      setError("Question text is required");
      setSaving(false);
      return;
    }

    const sortOrderValue = formData.sortOrder.trim();
    let sortOrder: number | null = null;
    if (sortOrderValue) {
      const parsedSortOrder = Number(sortOrderValue);
      if (!Number.isInteger(parsedSortOrder) || parsedSortOrder < 1) {
        setError("Display order must be a positive whole number");
        setSaving(false);
        return;
      }
      sortOrder = parsedSortOrder;
    }

    if (showOptionsField && !formData.options.trim()) {
      setError("Options are required for dropdown, radio, and checkbox types");
      setSaving(false);
      return;
    }

    try {
      const optionsArray = showOptionsField
        ? formData.options
            .split(",")
            .map((opt) => opt.trim())
            .filter((opt) => opt)
        : null;

      const payload = {
        questionText: formData.questionText.trim(),
        inputType: formData.inputType,
        options: optionsArray,
        isRequired: formData.isRequired,
        sortOrder,
      };

      const response = await fetch(`/api/admin/questions?id=${questionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update question");
      }

      setSuccess("Question updated successfully!");
      setTimeout(() => {
        router.push("/admin/dashboard/questions");
      }, 1500);
    } catch (err) {
      console.log(err);
      setError("Failed to update question. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <p className="text-gray-600 text-sm">Loading question...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900">Edit Question</h1>
          <p className="text-gray-600 text-sm mt-1">
            Update an existing question in your SOP questionnaire
          </p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text *
              </label>
              <input
                type="text"
                name="questionText"
                value={formData.questionText}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter your question"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                name="sortOrder"
                min={1}
                step={1}
                value={formData.sortOrder}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first in the user form
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Input Type *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {inputTypes.map((type) => {
                  const IconComponent = type.icon;
                  const isSelected = formData.inputType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          inputType: type.value,
                        }))
                      }
                      className={`p-3 rounded-lg border text-xs font-medium transition-all duration-200 flex flex-col items-center space-y-1 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence>
              {showOptionsField && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options * (comma separated)
                  </label>
                  <textarea
                    name="options"
                    value={formData.options}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                    placeholder="Option 1, Option 2, Option 3"
                    rows={3}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate options with commas
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="checkbox"
                  id="isRequired"
                  name="isRequired"
                  checked={formData.isRequired}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isRequired: !prev.isRequired,
                    }))
                  }
                  className={`w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${
                    formData.isRequired ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <motion.div
                    animate={{
                      x: formData.isRequired ? 20 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-3 h-3 bg-white rounded-full shadow-sm m-1"
                  />
                </div>
              </div>
              <label
                htmlFor="isRequired"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Required field
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Question</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin/dashboard/questions")}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
