import React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "@/lib/utils";

export interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  error?: string;
  required?: boolean;
}

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ label, checked, onCheckedChange, error, required }, ref) => {
  if (label) {
    // Checkbox z label - pełny layout
    return (
      <div className="w-full">
        <div className="flex items-start space-x-2 w-full">
          <CheckboxPrimitive.Root
            ref={ref}
            checked={checked}
            onCheckedChange={onCheckedChange}
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 mt-0.5",
              error ? "border-red-500" : "border-gray-300",
              checked && "bg-blue-600 border-blue-600"
            )}
          >
            <CheckboxPrimitive.Indicator className="text-white">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M10 3L4.5 8.5L2 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>
          <label className="text-sm font-medium text-gray-700 cursor-pointer flex-1 min-w-0">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 ml-7">{error}</p>
        )}
      </div>
    );
  }
  
  // Checkbox bez label - tylko checkbox bez dodatkowych wrapperów
  return (
    <>
      <CheckboxPrimitive.Root
        ref={ref}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0",
          error ? "border-red-500" : "border-gray-300",
          checked && "bg-blue-600 border-blue-600"
        )}
      >
        <CheckboxPrimitive.Indicator className="text-white">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M10 3L4.5 8.5L2 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </>
  );
});

Checkbox.displayName = "Checkbox";


