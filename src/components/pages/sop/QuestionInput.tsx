// components/QuestionInput.tsx
import { ChangeEvent } from "react";
import { Question, AnswerValue } from "../../../../types";
import IndustryAutocomplete from "./IndustryAutocomplete";

interface QuestionInputProps {
  question: Question;
  index: number;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
}

export default function QuestionInput({
  question,
  index,
  value,
  onChange,
}: QuestionInputProps) {
  const romanNumerals = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
    "XIII",
    "XIV",
    "XV",
  ];

  const renderInput = () => {
    const currentValue = value ?? "";

    // ⭐⭐⭐ AUTOMATIC INDUSTRY AUTOCOMPLETE — ONLY FOR "Industry" questions
    const text = question.questionText.toLowerCase();
    if (text.includes("industry")) {
      return (
        <IndustryAutocomplete
          value={typeof currentValue === "string" ? currentValue : ""}
          onChange={onChange}
        />
      );
    }

    if (text.includes("annual turnover")) {
      const rawValue =
        typeof currentValue === "number"
          ? String(currentValue)
          : typeof currentValue === "string"
            ? currentValue
            : "";
      const match = rawValue.match(/^\s*([0-9.,]+)\s*(lakh|crore)?\s*$/i);
      const numericValue = (match?.[1] ?? rawValue).replace(/,/g, "");
      const unitValue =
        match?.[2]?.toLowerCase() === "crore" ? "Crore" : "Lakh";

      return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="number"
            value={numericValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const nextNumber = e.target.value;
              if (!nextNumber) {
                onChange("");
                return;
              }
              onChange(`${nextNumber} ${unitValue}`);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter amount..."
            required={question.isRequired}
          />
          <select
            value={unitValue}
            onChange={(e) => {
              const nextUnit = e.target.value;
              if (!numericValue) {
                onChange("");
                return;
              }
              onChange(`${numericValue} ${nextUnit}`);
            }}
            className="w-full sm:w-40 p-3 border border-gray-300 rounded-lg bg-blue-800 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required={question.isRequired}
          >
            <option value="Lakh">Lakh</option>
            <option value="Crore">Crore</option>
          </select>
        </div>
      );
    }

    // 🔽 Existing Input Switch
    switch (question.inputType) {
      case "text":
        return (
          <textarea
            value={typeof currentValue === "string" ? currentValue : ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={1}
            placeholder="Enter your answer..."
            required={question.isRequired}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={typeof currentValue === "number" ? currentValue : ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange(e.target.value ? parseInt(e.target.value, 10) : null)
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter a number..."
            required={question.isRequired}
          />
        );

      case "file":
        return (
          <input
            type="file"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange(e.target.files?.[0] ?? null)
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required={question.isRequired}
          />
        );

      case "dropdown":
        return (
          <select
            value={typeof currentValue === "string" ? currentValue : ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-4 border-2 border-purple-500/40 rounded-lg  text-purple-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all font-medium"
            required={question.isRequired}
          >
            <option value="" className="bg-slate-900 text-purple-200">
              Select an option...
            </option>
            {question.options?.map((option, optionIndex) => (
              <option
                key={optionIndex}
                value={option}
                className="bg-slate-900 text-purple-100"
              >
                {romanNumerals[optionIndex] || optionIndex + 1}. {option}
              </option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div className="space-y-3">
            {question.options?.map((option, optionIndex) => (
              <label
                key={optionIndex}
                className="flex items-center space-x-4 p-4 rounded-lg bg-gradient-to-r from-purple-900/30 to-indigo-900/30 hover:from-purple-800/40 hover:to-indigo-800/40 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {romanNumerals[optionIndex] || optionIndex + 1}
                  </span>
                  <span className="text-purple-100 font-medium group-hover:text-white transition-colors">
                    {option}
                  </span>
                </div>
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={currentValue === option}
                  onChange={(e) => onChange(e.target.value)}
                  required={question.isRequired}
                  className="w-5 h-5 text-purple-600 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                />
              </label>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-3">
            {question.options?.map((option, optionIndex) => {
              const selectedValues = Array.isArray(currentValue)
                ? currentValue
                : [];
              return (
                <label
                  key={optionIndex}
                  className="flex items-center space-x-4 p-4 rounded-lg bg-gradient-to-r from-indigo-900/30 to-purple-900/30 hover:from-indigo-800/40 hover:to-purple-800/40 border border-indigo-500/30 hover:border-indigo-400/50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                      {romanNumerals[optionIndex] || optionIndex + 1}
                    </span>
                    <span className="text-indigo-100 font-medium group-hover:text-white transition-colors">
                      {option}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    value={option}
                    checked={selectedValues.includes(option)}
                    onChange={(e) => {
                      const updatedValues = e.target.checked
                        ? [...selectedValues, option]
                        : selectedValues.filter((v) => v !== option);
                      onChange(updatedValues);
                    }}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  />
                </label>
              );
            })}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={typeof currentValue === "string" ? currentValue : ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your answer..."
            required={question.isRequired}
          />
        );
    }
  };

  return (
    <div className="group relative p-6 rounded-xl bg-slate-800/50 backdrop-blur-lg border border-purple-500/20 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/30">
          {index + 1}
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <label className="block bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent font-bold text-xl leading-relaxed">
              {question.questionText}
            </label>
            {question.isRequired && (
              <span className="text-red-400 text-lg font-bold">*</span>
            )}
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10 transition-all duration-200">
            {renderInput()}
          </div>
        </div>
      </div>
    </div>
  );
}
