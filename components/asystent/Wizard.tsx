"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  component: React.ReactNode | (() => React.ReactNode);
}

export interface WizardProps {
  steps: WizardStep[];
  onComplete?: () => void;
  onStepChange?: (stepIndex: number) => void;
  currentStep?: number;
}

export const Wizard: React.FC<WizardProps> = ({ steps, onComplete, onStepChange, currentStep: externalCurrentStep }) => {
  const [internalCurrentStep, setInternalCurrentStep] = useState(0);
  const currentStep = externalCurrentStep !== undefined ? externalCurrentStep : internalCurrentStep;

  const goToNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      if (externalCurrentStep === undefined) {
        setInternalCurrentStep(nextStep);
      }
      onStepChange?.(nextStep);
    } else {
      onComplete?.();
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      if (externalCurrentStep === undefined) {
        setInternalCurrentStep(prevStep);
      }
      onStepChange?.(prevStep);
    }
  };

  const goToStep = (stepIndex: number) => {
    // Nie pozwalaj na przeskakiwanie do przodu bez wypełnienia poprzednich kroków
    // Można tylko wracać do wcześniejszych kroków
    if (stepIndex >= 0 && stepIndex < steps.length) {
      if (stepIndex <= currentStep) {
        // Można wracać do wcześniejszych kroków
        if (externalCurrentStep === undefined) {
          setInternalCurrentStep(stepIndex);
        }
        onStepChange?.(stepIndex);
      } else {
        // Nie można przeskakiwać do przodu - pokaż komunikat
        alert("Proszę najpierw uzupełnić wszystkie poprzednie kroki");
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => goToStep(index)}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors",
                  index < currentStep
                    ? "bg-green-500 text-white"
                    : index === currentStep
                    ? "bg-blue-600 text-white ring-4 ring-blue-200"
                    : "bg-gray-200 text-gray-600"
                )}
              >
                {index < currentStep ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 transition-colors",
                    index < currentStep ? "bg-green-500" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-2">
          <p className="text-sm font-medium text-gray-700">
            Krok {currentStep + 1} z {steps.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">{steps[currentStep].title}</p>
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 min-h-[400px] relative">
        {steps[currentStep].description && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600">{steps[currentStep].description}</p>
          </div>
        )}
        <div>
          {typeof steps[currentStep].component === 'function' 
            ? steps[currentStep].component() 
            : steps[currentStep].component}
        </div>
      </div>

      {/* Navigation Buttons - tylko jeśli komponent nie ma własnych przycisków */}
      {/* Przyciski nawigacji są teraz w komponentach kroków */}
    </div>
  );
};

