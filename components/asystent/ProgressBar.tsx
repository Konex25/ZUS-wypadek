"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { getStepCompleteness } from "@/lib/validation/completeness";
import { AccidentReport } from "@/types";

export interface ProgressBarProps {
  steps: Array<{ id: string; title: string; description?: string }>;
  currentStep: number;
  formData: Partial<AccidentReport>;
  onStepClick?: (stepIndex: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  steps,
  currentStep,
  formData,
  onStepClick,
}) => {
  const completionPercentage = React.useMemo(() => {
    // Oblicz procent uzupełnienia na podstawie kroków
    let completedSteps = 0;
    steps.forEach((_, index) => {
      const completeness = getStepCompleteness(formData, index);
      if (completeness.isComplete) {
        completedSteps++;
      }
    });
    return Math.round((completedSteps / steps.length) * 100);
  }, [steps, formData]);

  return (
    <div className="w-full mb-8">
      {/* Progress bar z procentami */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Postęp wypełniania formularza
          </span>
          <span className="text-sm font-semibold text-blue-600">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Wskaźniki kroków */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const completeness = getStepCompleteness(formData, index);
          const isCurrent = index === currentStep;
          const isCompleted = completeness.isComplete;
          const hasMissing = completeness.missingCount > 0;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => onStepClick?.(index)}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all relative",
                  isCurrent
                    ? "bg-blue-600 text-white ring-4 ring-blue-200 scale-110"
                    : isCompleted
                    ? "bg-green-500 text-white"
                    : hasMissing
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200 text-gray-600",
                  "hover:scale-105"
                )}
                title={
                  isCompleted
                    ? "Krok uzupełniony"
                    : hasMissing
                    ? `Brakuje ${completeness.missingCount} elementów`
                    : "Krok nie uzupełniony"
                }
              >
                {isCompleted ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : hasMissing ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
                {/* Czerwona kropka dla brakujących elementów */}
                {hasMissing && !isCurrent && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 transition-colors",
                    isCompleted ? "bg-green-500" : hasMissing ? "bg-yellow-500" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span>Uzupełniony</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-yellow-500" />
          <span>Częściowo uzupełniony</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-gray-200" />
          <span>Nie uzupełniony</span>
        </div>
      </div>
    </div>
  );
};

