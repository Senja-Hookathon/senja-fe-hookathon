"use client";

import { Loader2, CheckCircle2, ExternalLink, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type TransactionStatus = "idle" | "loading" | "success" | "error";

export interface TransactionStatusDisplayProps {
  status: TransactionStatus;
  title?: string;
  txHash?: string | null;
  error?: string;
  isCrosschain?: boolean;
  className?: string;
}

export const TransactionStatusDisplay = ({
  status,
  title = "Transaction",
  txHash,
  error,
  isCrosschain = false,
  className,
}: TransactionStatusDisplayProps) => {
  if (status === "idle") return null;

  const isSuccess = status === "success";
  const isLoading = status === "loading";
  const isError = status === "error";

  // Generate explorer URL
  const getExplorerUrl = () => {
    if (!txHash) return null;

    if (isCrosschain) {
      // LayerZero scan for crosschain transactions
      return `https://layerzeroscan.com/tx/${txHash}`;
    }

    // Avalanche C-Chain explorer for regular transactions
    return `https://snowtrace.io/tx/${txHash}`;
  };

  const explorerUrl = getExplorerUrl();

  return (
    <div
      className={cn(
        "overflow-hidden rounded-none border p-3",
        isSuccess && "border-emerald-800/60 bg-emerald-950/40",
        isLoading && "border-neutral-800 bg-neutral-900/50",
        isError && "border-red-800/60 bg-red-950/40",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {isLoading && (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-400" />
        )}
        {isSuccess && (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
        )}
        {isError && <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />}
        <span className="text-sm font-medium text-neutral-100">{title}</span>
      </div>

      {isError && error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {isSuccess && explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300"
        >
          <span>View on {isCrosschain ? "LayerZero Scan" : "Explorer"}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
};
