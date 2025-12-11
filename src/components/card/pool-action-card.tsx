import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Mode, PoolActionCardProps, Tab } from "./pool-action-card.types";
import {
  resolveActionLabel,
  resolveAssetLogo,
  resolveAssetSymbol,
} from "./pool-action-card-helpers";
import { ActionTabs } from "./pool-action-card-tabs";
import { ModeToggle } from "./pool-action-card-mode-toggle";
import { AmountSection } from "./pool-action-card-amount-section";
import { StatsSection } from "./pool-action-card-stats-section";
import { TransactionStatusDisplay } from "@/components/ui/transaction-status";
import { useSupplyCollateral } from "@/hooks/mutation/use-supply-collateral";
import { useSupplyLiquidity } from "@/hooks/mutation/use-supply-liquidity";
import { useBorrow } from "@/hooks/mutation/use-borrow";
import { useWithdrawCollateral } from "@/hooks/mutation/use-withdraw-collateral";
import { useWithdrawLiquidity } from "@/hooks/mutation/use-withdraw-liquidity";
import { useRepay } from "@/hooks/mutation/use-repay";
import { ChainSelector } from "@/components/ui/chain-selector";
import {
  ChainId,
  getDefaultChain,
  type ChainConfig,
} from "@/lib/config/chains";
import { useReadFee } from "@/hooks/contract/use-read-fee";
import { getToken, Network } from "@/lib/addresses";
import { TokenSymbol } from "@/lib/addresses/types";
import { useReadUserBorrowShares } from "@/hooks/balance/use-read-user-borrow";
import { useReadTotalBorrowAssets } from "@/hooks/contract/use-read-total-borrow-asset";
import { useReadTotalBorrowShares } from "@/hooks/contract/use-read-total-borrow-shares";
import { usePoolLiquidityByAddress } from "@/hooks/graphql/use-pools-liquidity";

export const PoolActionCard = ({
  poolAddress,
  ltv,
  collateralSymbol,
  borrowSymbol,
  collateralLogoUrl,
  borrowLogoUrl,
  collateralTokenAddress,
  borrowTokenAddress,
  collateralDecimals,
  borrowDecimals,
  borrowOftAddress,
}: PoolActionCardProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("Supply");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<Mode>("liquidity");
  const [destinationChain, setDestinationChain] = useState<ChainConfig>(
    getDefaultChain()
  );

  // Mutation hooks
  const supplyCollateral = useSupplyCollateral();
  const supplyLiquidity = useSupplyLiquidity();
  const borrow = useBorrow();
  const withdrawCollateral = useWithdrawCollateral();
  const withdrawLiquidity = useWithdrawLiquidity();
  const repay = useRepay(poolAddress as `0x${string}`);

  // Get borrow token config for fee calculation
  const borrowToken = borrowSymbol
    ? getToken(Network.Avalanche, borrowSymbol as TokenSymbol)
    : null;

  // Fallback token config for fee calculation when borrowToken is not available
  const tokenConfigForFee = borrowToken || {
    name: "",
    symbol: "",
    logo: "",
    decimals: borrowDecimals,
    address: borrowTokenAddress as `0x${string}`,
    oftAddress: borrowOftAddress as `0x${string}` | undefined,
  };

  // Calculate crosschain fee for borrow tab
  const isCrosschain =
    activeTab === "Borrow" && destinationChain.id !== ChainId.Avalanche;
  const { fee: crosschainFee, feeError } = useReadFee(
    destinationChain.endpointId,
    amount || "0",
    borrowDecimals,
    tokenConfigForFee
  );

  // Debug logging
  console.log("🔍 Fee Debug:", {
    activeTab,
    isCrosschain,
    borrowToken: borrowToken
      ? {
          symbol: borrowToken.symbol,
          oftAddress: borrowToken.oftAddress,
        }
      : null,
    destinationChain: destinationChain.name,
    endpointId: destinationChain.endpointId,
    amount,
    oftAddressUsed: tokenConfigForFee.oftAddress,
    fee: crosschainFee?.toString(),
    feeError: feeError
      ? {
          message: feeError.message,
          name: feeError.name,
        }
      : null,
  });

  // Show warning if fee calculation failed
  if (feeError && isCrosschain) {
    console.warn("⚠️ Fee calculation failed:", feeError.message);
  }

  // Get user borrow shares for Repay tab
  const { userBorrowSharesFormatted } = useReadUserBorrowShares(
    poolAddress as `0x${string}`,
    borrowDecimals
  );

  // Get total borrow data for shares calculation in Repay
  const { totalBorrowAssets } = useReadTotalBorrowAssets(
    poolAddress as `0x${string}`
  );
  const { totalBorrowShares } = useReadTotalBorrowShares(
    poolAddress as `0x${string}`
  );

  // Calculate shares for Repay tab display
  const calculateShares = (): string => {
    if (activeTab !== "Repay" || !amount || parseFloat(amount) <= 0) {
      return "0";
    }
    const amountFloat = parseFloat(amount);
    const amountBigInt = BigInt(
      Math.floor(amountFloat * Math.pow(10, borrowDecimals))
    );

    if (totalBorrowAssets > 0 && totalBorrowShares > 0) {
      const sharesBigInt =
        (amountBigInt * totalBorrowAssets) / totalBorrowShares;
      const sharesFloat = Number(sharesBigInt) / Math.pow(10, borrowDecimals);
      return sharesFloat.toFixed(6);
    }
    return amountFloat.toFixed(6);
  };

  const calculatedShares = calculateShares();

  // Fetch pool liquidity data for APY
  const { data: liquidityData } = usePoolLiquidityByAddress(poolAddress);

  // Format APY from 1e2 (e.g., 450 = 4.50%)
  const formatApy = (apyRaw: string): number => {
    const apy = parseFloat(apyRaw || "0") / 100;
    return apy;
  };

  const supplyApy = liquidityData ? formatApy(liquidityData.supplyAPY) : 0;
  const borrowApy = liquidityData ? formatApy(liquidityData.borrowAPY) : 0;

  const assetSymbol = resolveAssetSymbol(
    activeTab,
    mode,
    collateralSymbol,
    borrowSymbol
  );
  const assetLogoUrl = resolveAssetLogo(
    activeTab,
    mode,
    collateralLogoUrl,
    borrowLogoUrl
  );
  const actionLabel = resolveActionLabel(activeTab);

  // Determine which token address and decimals to use
  const getTokenInfo = () => {
    if (activeTab === "Supply" || activeTab === "Withdraw") {
      return mode === "collateral"
        ? { address: collateralTokenAddress, decimals: collateralDecimals }
        : { address: borrowTokenAddress, decimals: borrowDecimals };
    }
    // For Borrow and Repay, use borrow token
    return { address: borrowTokenAddress, decimals: borrowDecimals };
  };

  const tokenInfo = getTokenInfo();

  const primaryLabel =
    activeTab === "Supply"
      ? `${activeTab} ${mode === "collateral" ? "Collateral" : "Liquidity"}`
      : activeTab;

  const handleAction = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      if (activeTab === "Supply") {
        if (mode === "collateral") {
          await supplyCollateral.mutation.mutateAsync({
            poolAddress: poolAddress as `0x${string}`,
            collateralTokenAddress: collateralTokenAddress as `0x${string}`,
            amount,
            tokenDecimals: collateralDecimals,
          });
        } else {
          await supplyLiquidity.mutation.mutateAsync({
            poolAddress: poolAddress as `0x${string}`,
            borrowTokenAddress: borrowTokenAddress as `0x${string}`,
            amount,
            tokenDecimals: borrowDecimals,
          });
        }
      } else if (activeTab === "Borrow") {
        await borrow.mutation.mutateAsync({
          poolAddress: poolAddress as `0x${string}`,
          amount,
          tokenDecimals: borrowDecimals,
          destinationChainId: destinationChain.id,
          fee: crosschainFee,
        });
      } else if (activeTab === "Withdraw") {
        if (mode === "collateral") {
          await withdrawCollateral.mutation.mutateAsync({
            poolAddress: poolAddress as `0x${string}`,
            amount,
            tokenDecimals: collateralDecimals,
          });
        } else {
          // Withdraw liquidity uses shares, not amount
          await withdrawLiquidity.mutation.mutateAsync({
            poolAddress: poolAddress as `0x${string}`,
            shares: amount,
            tokenDecimals: borrowDecimals,
          });
        }
      } else if (activeTab === "Repay") {
        await repay.mutation.mutateAsync({
          poolAddress: poolAddress as `0x${string}`,
          borrowTokenAddress: borrowTokenAddress as `0x${string}`,
          amount,
          tokenDecimals: borrowDecimals,
        });
      }
      // Reset amount after successful transaction
      setAmount("");
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const isLoading =
    supplyCollateral.mutation.isPending ||
    supplyLiquidity.mutation.isPending ||
    borrow.mutation.isPending ||
    withdrawCollateral.mutation.isPending ||
    withdrawLiquidity.mutation.isPending ||
    repay.mutation.isPending;

  // Get active mutation data based on tab and mode
  const getActiveMutation = () => {
    if (activeTab === "Supply") {
      return mode === "collateral" ? supplyCollateral : supplyLiquidity;
    } else if (activeTab === "Borrow") {
      return borrow;
    } else if (activeTab === "Withdraw") {
      return mode === "collateral" ? withdrawCollateral : withdrawLiquidity;
    } else if (activeTab === "Repay") {
      return repay;
    }
    return null;
  };

  const activeMutation = getActiveMutation();
  const hasSteps = activeMutation && "steps" in activeMutation;
  const steps = hasSteps ? activeMutation.steps : [];
  const txHash =
    activeMutation && "txHash" in activeMutation ? activeMutation.txHash : null;
  const approveTxHash =
    activeMutation && "approveTxHash" in activeMutation
      ? activeMutation.approveTxHash
      : null;

  // Determine step titles based on action
  const getStepTitles = () => {
    if (activeTab === "Supply") {
      return {
        step1: "Step 1: Approving Token",
        step2:
          mode === "collateral"
            ? "Step 2: Supplying Collateral"
            : "Step 2: Supplying Liquidity",
      };
    } else if (activeTab === "Borrow") {
      return {
        step1: "Borrowing",
        step2: "",
      };
    } else if (activeTab === "Withdraw") {
      return {
        step1:
          mode === "collateral"
            ? "Withdrawing Collateral"
            : "Withdrawing Liquidity",
        step2: "",
      };
    } else if (activeTab === "Repay") {
      return {
        step1: "Step 1: Approving Token",
        step2: "Step 2: Repaying Debt",
      };
    }
    return { step1: "", step2: "" };
  };

  const stepTitles = getStepTitles();

  return (
    <Card className="flex h-full w-104 flex-col rounded-none border-neutral-800 bg-neutral-950 gap-0 p-4">
      <ActionTabs activeTab={activeTab} onChange={setActiveTab} />

      <CardContent className="flex flex-1 flex-col gap-3 p-0">
        <ModeToggle activeTab={activeTab} mode={mode} onChange={setMode} />

        {/* Chain Selector for Borrow Tab */}
        {activeTab === "Borrow" && (
          <ChainSelector
            selectedChain={destinationChain}
            onChainChange={(chain) => setDestinationChain(chain)}
          />
        )}

        <AmountSection
          activeTab={activeTab}
          mode={mode}
          actionLabel={actionLabel}
          assetSymbol={assetSymbol}
          assetLogoUrl={assetLogoUrl}
          amount={amount}
          onAmountChange={setAmount}
          tokenAddress={tokenInfo.address as `0x${string}`}
          tokenDecimals={tokenInfo.decimals}
          poolAddress={poolAddress}
        />

        <StatsSection
          ltv={ltv}
          activeTab={activeTab}
          crosschainFee={crosschainFee}
          isCrosschain={isCrosschain}
          feeError={feeError}
          userBorrowFormatted={userBorrowSharesFormatted}
          borrowSymbol={borrowSymbol}
          amount={amount}
          calculatedShares={calculatedShares}
          supplyApy={supplyApy}
          borrowApy={borrowApy}
        />

        {/* Transaction Status Display */}
        {steps.length > 0 &&
          (isLoading || steps.some((s) => s.status !== "idle")) && (
            <div className="space-y-2">
              {steps.map((step) => (
                <TransactionStatusDisplay
                  key={step.step}
                  status={step.status}
                  title={step.step === 1 ? stepTitles.step1 : stepTitles.step2}
                  error={step.error}
                  txHash={step.step === 1 ? approveTxHash : txHash}
                />
              ))}
            </div>
          )}

        <div className="mt-auto pt-1">
          <Button
            type="button"
            className="h-10 w-full rounded-none bg-pink-600 text-sm font-semibold text-white hover:bg-pink-700 disabled:opacity-50"
            onClick={handleAction}
            disabled={!amount || parseFloat(amount) <= 0 || isLoading}
          >
            {isLoading ? "Processing..." : primaryLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PoolActionCard;
