import { formatLtvFromRaw } from "@/lib/format/pool";
import type { Tab } from "./pool-action-card.types";

interface StatsSectionProps {
  ltv: string;
  activeTab?: Tab;
  crosschainFee?: bigint;
  isCrosschain?: boolean;
  feeError?: Error | null;
  userBorrowFormatted?: string;
  borrowSymbol?: string;
  amount?: string;
  calculatedShares?: string;
  supplyApy?: number;
  borrowApy?: number;
}

export const StatsSection = ({
  ltv,
  activeTab = "Supply",
  crosschainFee = BigInt(0),
  isCrosschain = false,
  feeError = null,
  userBorrowFormatted = "0.00000",
  borrowSymbol = "",
  amount = "0",
  calculatedShares = "0",
  supplyApy = 0,
  borrowApy = 0,
}: StatsSectionProps) => {
  // Format fee from wei to AVAX
  const formatFee = (fee: bigint): string => {
    const feeInAvax = Number(fee) / 1e18;
    return feeInAvax.toFixed(6);
  };

  // Calculate 0.1% fee
  const calculateBorrowFee = (amount: string): string => {
    const amountFloat = parseFloat(amount) || 0;
    const fee = amountFloat * 0.001; // 0.1%
    return fee.toFixed(6);
  };

  // Calculate amount received (amount - fee)
  const calculateAmountReceived = (amount: string): string => {
    const amountFloat = parseFloat(amount) || 0;
    const fee = amountFloat * 0.001; // 0.1%
    const received = amountFloat - fee;
    return received.toFixed(6);
  };

  return (
    <div className="space-y-1 border border-neutral-800 bg-neutral-900 p-3 text-[11px] text-neutral-400">
      {activeTab === "Borrow" ? (
        <>
          <div className="flex items-center justify-between">
            <span>Interest Rate</span>
            <span className="font-medium text-orange-400">
              {borrowApy.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Fee (0.1%)</span>
            <span className="font-medium text-neutral-100">
              {calculateBorrowFee(amount)} {borrowSymbol}
            </span>
          </div>
          {isCrosschain && (
            <div className="flex items-center justify-between">
              <span>Crosschain fee</span>
              {feeError ? (
                <span
                  className="font-medium text-yellow-400"
                  title={feeError.message}
                >
                  Unavailable
                </span>
              ) : (
                <span className="font-medium text-pink-400">
                  {formatFee(crosschainFee)} AVAX
                </span>
              )}
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>Amount Received</span>
            <span className="font-medium text-emerald-400">
              {calculateAmountReceived(amount)} {borrowSymbol}
            </span>
          </div>
        </>
      ) : activeTab === "Repay" ? (
        <>
          <div className="flex items-center justify-between">
            <span>Interest Rate</span>
            <span className="font-medium text-orange-400">
              {borrowApy.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shares</span>
            <span className="font-medium text-sky-400">{calculatedShares}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Your Borrow</span>
            <span className="font-medium text-neutral-100">
              {userBorrowFormatted} {borrowSymbol}
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span>Supply APY</span>
            <span className="font-medium text-emerald-400">
              {supplyApy.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Collateral factor</span>
            <span className="font-medium text-neutral-100">
              {formatLtvFromRaw(ltv)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Health factor (after)</span>
            <span className="font-medium text-neutral-100">1.00 → 1.25</span>
          </div>
        </>
      )}
    </div>
  );
};
