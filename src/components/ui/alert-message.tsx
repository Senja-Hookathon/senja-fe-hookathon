import { XCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertType = "error" | "warning" | "info";

export interface AlertMessageProps {
  type?: AlertType;
  message: string | null;
  className?: string;
}

const alertStyles: Record<
  AlertType,
  { container: string; icon: string; text: string; IconComponent: typeof XCircle }
> = {
  error: {
    container: "border-red-800/60 bg-red-950/40",
    icon: "text-red-400",
    text: "text-red-200",
    IconComponent: XCircle,
  },
  warning: {
    container: "border-yellow-800/60 bg-yellow-950/40",
    icon: "text-yellow-400",
    text: "text-yellow-200",
    IconComponent: AlertTriangle,
  },
  info: {
    container: "border-blue-800/60 bg-blue-950/40",
    icon: "text-blue-400",
    text: "text-blue-200",
    IconComponent: Info,
  },
};

export const AlertMessage = ({ type = "error", message, className }: AlertMessageProps) => {
  if (!message) return null;

  const { container, icon, text, IconComponent } = alertStyles[type];

  return (
    <div className={cn("flex items-start gap-2 overflow-hidden rounded-none border p-3", container, className)}>
      <IconComponent className={cn("h-4 w-4 shrink-0 mt-0.5", icon)} />
      <p className={cn("min-w-0 flex-1 wrap-break-word text-sm", text)}>{message}</p>
    </div>
  );
};
