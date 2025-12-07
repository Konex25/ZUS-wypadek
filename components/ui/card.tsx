import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-lg shadow-md p-6 border border-gray-200",
          className
        )}
        {...props}
      >
        {title && (
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        )}
        {description && (
          <p className="text-sm text-gray-600 mb-4">{description}</p>
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";



