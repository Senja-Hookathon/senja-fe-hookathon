"use client";

import { forwardRef } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ActionButtonVariant =
  | "create"
  | "supply"
  | "withdraw"
  | "borrow"
  | "repay";

export interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionButtonVariant;
  isLoading?: boolean;
  isSuccess?: boolean;
  loadingText?: string;
  successText?: string;
  fullWidth?: boolean;
}

const variantStyles: Record<ActionButtonVariant, string> = {
  create:
    "border-(--btn-create-border) bg-(--btn-create) hover:bg-(--btn-create-hover)",
  supply:
    "border-(--btn-supply-border) bg-(--btn-supply) hover:bg-(--btn-supply-hover)",
  withdraw:
    "border-(--btn-withdraw-border) bg-(--btn-withdraw) hover:bg-(--btn-withdraw-hover)",
  borrow:
    "border-(--btn-borrow-border) bg-(--btn-borrow) hover:bg-(--btn-borrow-hover)",
  repay:
    "border-(--btn-repay-border) bg-(--btn-repay) hover:bg-(--btn-repay-hover)",
};

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      variant = "create",
      isLoading = false,
      isSuccess = false,
      loadingText = "Processing...",
      successText = "Success!",
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const renderContent = () => {
      if (isLoading) {
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText}
          </>
        );
      }

      if (isSuccess) {
        return (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {successText}
          </>
        );
      }

      return children;
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading || isSuccess}
        className={cn(
          "inline-flex items-center justify-center rounded-none border px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-all",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variantStyles[variant],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {renderContent()}
      </button>
    );
  }
);

ActionButton.displayName = "ActionButton";
