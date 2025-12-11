"use client";

import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";
import { formatUnits } from "viem";
import Image from "next/image";
import {
  type Transaction,
  type TransactionType,
  formatTransactionType,
} from "@/hooks/graphql/use-transaction-history";
import { getTokenLogo } from "../../../public/tokens";

interface TransactionHistoryTableProps {
  transactions: Transaction[];
}

const SNOWTRACE_BASE_URL = "https://snowscan.xyz/";

const TYPE_COLORS = {
  supply_liquidity: "text-emerald-400",
  withdraw_liquidity: "text-red-400",
  borrow: "text-blue-400",
  repay: "text-purple-400",
  supply_collateral: "text-emerald-400",
  withdraw_collateral: "text-red-400",
  swap: "text-amber-400",
};

const getTransactionBadge = (type: TransactionType) => {
  const color = TYPE_COLORS[type] || "text-neutral-400";
  return (
    <span className={`text-sm font-medium ${color}`}>
      {formatTransactionType(type)}
    </span>
  );
};

const formatAmount = (amount: string, decimals: number = 18): string => {
  try {
    const formatted = formatUnits(BigInt(amount), decimals);
    const num = parseFloat(formatted);

    if (num === 0) return "0";
    if (num < 0.0001) return "< 0.0001";
    if (num < 1) return num.toFixed(4);
    if (num < 1000) return num.toFixed(2);
    if (num < 1000000) return `${(num / 1000).toFixed(2)}K`;

    return `${(num / 1000000).toFixed(2)}M`;
  } catch (error) {
    return "N/A";
  }
};

export const TransactionHistoryTable = ({
  transactions,
}: TransactionHistoryTableProps) => {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-neutral-400">
            No Transactions Yet
          </h3>
          <p className="text-sm text-neutral-500 max-w-md">
            Your transaction history will appear here once you start interacting
            with the protocol.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-neutral-900/80 text-xs uppercase tracking-wide text-neutral-400">
          <tr>
            <th className="text-left py-3 px-4 font-medium">
              Type
            </th>
            <th className="text-left py-3 px-4 font-medium">
              Pool
            </th>
            <th className="text-right py-3 px-4 font-medium">
              Amount
            </th>
            <th className="text-left py-3 px-4 font-medium">
              Time
            </th>
            <th className="text-center py-3 px-4 font-medium">
              Tx Hash
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/80">
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              className="hover:bg-neutral-900/50 transition-colors"
            >
              <td className="py-4 px-4">
                {getTransactionBadge(tx.type)}
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-neutral-900 bg-neutral-800">
                      <Image
                        src={getTokenLogo(tx.collateralToken.address)}
                        alt={tx.collateralToken.symbol}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-neutral-900 bg-neutral-800">
                      <Image
                        src={getTokenLogo(tx.borrowToken.address)}
                        alt={tx.borrowToken.symbol}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-neutral-50">
                      {tx.collateralToken.symbol} / {tx.borrowToken.symbol}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {tx.poolAddress.slice(0, 6)}...{tx.poolAddress.slice(-4)}
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                {tx.type === "swap" ? (
                  <div className="flex items-center justify-end gap-2">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-neutral-50">
                          {formatAmount(tx.amountIn || "0")}
                        </span>
                        <div className="relative w-5 h-5 rounded-full overflow-hidden border border-neutral-700 bg-neutral-800">
                          <Image
                            src={getTokenLogo(tx.tokenIn?.address || "")}
                            alt={tx.tokenIn?.symbol || ""}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-neutral-500">
                          → {formatAmount(tx.amountOut || "0")}
                        </span>
                        <div className="relative w-4 h-4 rounded-full overflow-hidden border border-neutral-700 bg-neutral-800">
                          <Image
                            src={getTokenLogo(tx.tokenOut?.address || "")}
                            alt={tx.tokenOut?.symbol || ""}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-2">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-neutral-50">
                        {formatAmount(tx.amount)}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {tx.type.includes("collateral")
                          ? tx.collateralToken.symbol
                          : tx.borrowToken.symbol}
                      </span>
                    </div>
                    <div className="relative w-6 h-6 rounded-full overflow-hidden border border-neutral-700 bg-neutral-800">
                      <Image
                        src={getTokenLogo(
                          tx.type.includes("collateral")
                            ? tx.collateralToken.address
                            : tx.borrowToken.address
                        )}
                        alt={
                          tx.type.includes("collateral")
                            ? tx.collateralToken.symbol
                            : tx.borrowToken.symbol
                        }
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </td>
              <td className="py-4 px-4">
                <span className="text-sm text-neutral-400">
                  {formatDistanceToNow(new Date(tx.timestamp * 1000), {
                    addSuffix: true,
                  })}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex justify-center">
                  <a
                    href={`${SNOWTRACE_BASE_URL}/tx/${tx.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span className="hidden lg:inline">
                      {tx.transactionHash.slice(0, 6)}...
                      {tx.transactionHash.slice(-4)}
                    </span>
                    <span className="lg:hidden">View</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
