import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Tab, Mode } from "./pool-action-card.types";
import { useUserWalletBalance } from "@/hooks/balance/use-user-token-balance";
import { useReadUserCollateralBalance } from "@/hooks/balance/use-user-collateral-balance";
import { useReadUserLiquidityBalance } from "@/hooks/balance/use-user-liquidity-balance";
import { useReadUserPosition } from "@/hooks/contract/use-read-positon-address";

interface AmountSectionProps {
  activeTab: Tab;
  mode: Mode;
  actionLabel: string;
  assetSymbol: string;
  assetLogoUrl?: string;
  amount: string;
  onAmountChange: (value: string) => void;
  tokenAddress: `0x${string}`;
  tokenDecimals: number;
  poolAddress: string;
}

export const AmountSection = ({
  activeTab,
  mode,
  actionLabel,
  assetSymbol,
  assetLogoUrl,
  amount,
  onAmountChange,
  tokenAddress,
  tokenDecimals,
  poolAddress,
}: AmountSectionProps) => {
  // Fetch wallet balance dynamically
  const {
    userWalletBalanceFormatted,
    userWalletBalanceParsed,
    walletBalanceLoading,
  } = useUserWalletBalance(tokenAddress, tokenDecimals);

  // Fetch collateral balance for withdraw collateral mode
  const {
    userCollateralBalanceFormatted,
    userCollateralBalanceParsed,
    userCollateralBalanceLoading,
  } = useReadUserCollateralBalance(
    poolAddress as `0x${string}`,
    tokenAddress,
    tokenDecimals
  );

  // Fetch liquidity shares for withdraw liquidity mode
  const {
    userLiquiditySharesFormatted,
    userLiquiditySharesParsed,
    userLiquidityBalanceLoading,
  } = useReadUserLiquidityBalance(poolAddress as `0x${string}`, tokenDecimals);

  // Fetch user position for debugging
  const {
    userPosition,
    routerAddress,
    userPositionLoading,
    userPositionError,
  } = useReadUserPosition(poolAddress as `0x${string}`);

  // Console log position and router address for Supply tab
  useEffect(() => {
    if (activeTab === "Supply") {
      console.log("🔍 Amount Section Debug (Supply Tab):", {
        poolAddress,
        routerAddress,
        userPosition,
        userPositionLoading,
        userPositionError: userPositionError?.message,
        hasValidPosition:
          userPosition &&
          userPosition !== "0x0000000000000000000000000000000000000000" &&
          userPosition !== "0x0000000000000000000000000000000000000001",
        mode,
        tokenAddress,
        balances: {
          wallet: userWalletBalanceFormatted,
          collateral: userCollateralBalanceFormatted,
          liquidity: userLiquiditySharesFormatted,
        },
      });
    }
  }, [
    activeTab,
    poolAddress,
    routerAddress,
    userPosition,
    userPositionLoading,
    userPositionError,
    mode,
    tokenAddress,
    userWalletBalanceFormatted,
    userCollateralBalanceFormatted,
    userLiquiditySharesFormatted,
  ]);

  // Determine which balance to use
  const isWithdrawCollateral =
    activeTab === "Withdraw" && mode === "collateral";
  const isWithdrawLiquidity = activeTab === "Withdraw" && mode === "liquidity";

  const displayBalance = isWithdrawCollateral
    ? userCollateralBalanceFormatted
    : isWithdrawLiquidity
    ? userLiquiditySharesFormatted
    : userWalletBalanceFormatted;

  const displayBalanceParsed = isWithdrawCollateral
    ? userCollateralBalanceParsed
    : isWithdrawLiquidity
    ? userLiquiditySharesParsed
    : userWalletBalanceParsed;

  const isBalanceLoading = isWithdrawCollateral
    ? userCollateralBalanceLoading
    : isWithdrawLiquidity
    ? userLiquidityBalanceLoading
    : walletBalanceLoading;

  const balanceLabel = isWithdrawCollateral
    ? "Collateral"
    : isWithdrawLiquidity
    ? "Supplied"
    : "Wallet";

  const handleMaxClick = () => {
    if (displayBalanceParsed > 0) {
      onAmountChange(displayBalanceParsed.toString());
    }
  };

  // All tabs now use the same styling (gray background, no black box)
  return (
    <div className="space-y-3 border border-neutral-800 bg-neutral-900 p-4 text-xs text-neutral-300">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-200">
          {actionLabel} {assetSymbol}
        </span>
        {assetLogoUrl && (
          <Image
            src={assetLogoUrl}
            alt={assetSymbol}
            width={24}
            height={24}
            className="h-6 w-6 rounded-full"
          />
        )}
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0.00"
          className="h-10 w-full bg-transparent text-3xl font-semibold text-neutral-500 outline-none placeholder:text-neutral-700"
          style={{
            MozAppearance: "textfield",
            appearance: "textfield",
          }}
        />
        <Button
          type="button"
          onClick={handleMaxClick}
          className="h-7 rounded-none bg-neutral-800 px-3 text-[11px] font-medium text-neutral-100 hover:bg-neutral-700"
        >
          MAX
        </Button>
      </div>

      <span className="text-[11px] text-neutral-500">
        {balanceLabel}: {isBalanceLoading ? "..." : displayBalance}{" "}
        {assetSymbol}
      </span>

      <style jsx>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
};
