import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export const Spinner = ({ size = "md", className, label }: SpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center gap-2">
      <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
};
