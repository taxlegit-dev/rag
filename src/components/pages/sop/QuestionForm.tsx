// components/QuestionForm.tsx
import { useState, FormEvent } from "react";
import { Question, AnswerValue } from "../../../../types";
import QuestionInput from "./QuestionInput";
import Loader from "@/components/shared/Loader";

interface QuestionFormProps {
  questions: Question[];
  initialAnswers: Record<string, AnswerValue>;
  onSubmit: (answers: Record<string, AnswerValue>) => void;
}

export default function QuestionForm({
  questions,
  initialAnswers,
  onSubmit,
}: QuestionFormProps) {
  const [answers, setAnswers] =
    useState<Record<string, AnswerValue>>(initialAnswers);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const missingRequired = questions.filter((q) => {
      const answer = answers[q.id];

      if (!q.isRequired) return false;
      if (answer === null || answer === undefined) return true;
      if (typeof answer === "string" && answer.trim().length === 0) return true;
      if (Array.isArray(answer) && answer.length === 0) return true;

      return false;
    });

    if (missingRequired.length > 0) {
      alert("Please fill in all required fields.");
      setSubmitting(false);
      return;
    }

    await onSubmit(answers);
    setSubmitting(false);
  };

  return (
    <div className="relative">
      {submitting ? (
        <Loader
          message="Generating process..."
          subMessage="Hang tight while we build your SOP."
        />
      ) : null}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Generate Your <span className="text-purple-400">SOP</span>
        </h1>
        <p className="text-gray-300 text-lg">
          Fill out the form below to generate a personalized Statement of
          Purpose.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20"
      >
        <div className="space-y-6">
          {questions.map((question, index) => (
            <QuestionInput
              key={question.id}
              question={question}
              index={index}
              value={answers[question.id]}
              onChange={(value) => handleInputChange(question.id, value)}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Generating Process..." : "Generate Process"}
          </button>
        </div>
      </form>
    </div>
  );
}
