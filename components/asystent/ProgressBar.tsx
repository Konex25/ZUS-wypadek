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
  return (
    <div className="w-full mb-8">
      {/* Wskaźniki kroków */}
      <div className="flex items-start justify-between relative">
        {/* Kółeczka z opisami */}
        {steps.map((step, index) => {
          const isCurrent = index === currentStep;
          // Krok jest ukończony tylko jeśli już go przeszliśmy (index < currentStep)
          const isCompleted = index < currentStep;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1 relative z-10">
              <button
                onClick={() => onStepClick?.(index)}
                className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all relative z-10",
                  isCurrent
                    ? "bg-blue-600 text-white ring-4 ring-blue-200 scale-110"
                    : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600",
                  "hover:scale-105"
                )}
                title={
                  isCompleted
                    ? "Krok uzupełniony"
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
                ) : (
                  index + 1
                )}
              </button>
                {/* Opis kroku pod kółeczkiem */}
                <div className="mt-2 text-center w-full">
                  <p className={cn(
                    "text-xs font-medium",
                    isCurrent ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
                  )}>
                    {step.title}
                  </p>
                </div>
              </div>
              {/* Linia łącząca - między kółeczkami */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 mt-5 transition-colors relative z-0",
                    isCompleted && index + 1 < currentStep ? "bg-green-500" : "bg-gray-200"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};


