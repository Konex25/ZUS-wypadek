import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";

export interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}

export const Select = React.forwardRef<
  HTMLButtonElement,
  SelectProps
>(({ label, error, helperText, required, options, value, onValueChange, placeholder }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
        <SelectPrimitive.Trigger
          className={cn(
            "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent inline-flex items-center justify-between",
            error ? "border-red-500 focus:ring-red-500" : "border-gray-300"
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder || "Wybierz..."} />
          <SelectPrimitive.Icon className="text-gray-500">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M4 6H11L7.5 10.5L4 6Z"
                fill="currentColor"
              />
            </svg>
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className="overflow-hidden bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="px-4 py-2 rounded-md cursor-pointer hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = "Select";

