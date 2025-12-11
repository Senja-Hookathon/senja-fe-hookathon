"use client";

import { useState, useMemo } from "react";
import { ArrowDown } from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useConnection } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TokenSelectDialog } from "@/components/pool/token-select-dialog";
import { PoolSelectDialog } from "@/components/swap/pool-select-dialog";
import { TokenInput } from "@/components/swap/token-input";
import { ExchangeRateDisplay } from "@/components/swap/exchange-rate-display";
import { Spinner } from "@/components/ui/spinner";
import { TransactionStatusDisplay } from "@/components/ui/transaction-status";
import { TOKENS } from "../../../public/tokens";
import type { TokenConfig } from "@/lib/addresses/types";
import type { PoolComplete } from "@/hooks/graphql/use-pools-complete";
import { useSwapPools } from "@/hooks/swap/use-swap-pools";
import { useSwapCalculations } from "@/hooks/swap/use-swap-calculations";
import { useExchangeRate } from "@/hooks/price/use-exchange-rate";
import { useReadUserCollateralBalance } from "@/hooks/balance/use-user-collateral-balance";
import { useSwap } from "@/hooks/mutation/use-swap";
import { isValidAmount } from "@/lib/utils/formatters";

export const Swap = () => {
  const [inputAmount, setInputAmount] = useState("");
  const [inputToken, setInputToken] = useState<TokenConfig | null>(null);
  const [outputToken, setOutputToken] = useState<TokenConfig | null>(null);
  const [showInputSelect, setShowInputSelect] = useState(false);
  const [showOutputSelect, setShowOutputSelect] = useState(false);
  const [showPoolSelect, setShowPoolSelect] = useState(false);
  const [manualPoolSelection, setManualPoolSelection] =
    useState<PoolComplete | null>(null);

  const { isConnected } = useConnection();
  const { openConnectModal } = useConnectModal();

  const { allPools, selectedPool } = useSwapPools(manualPoolSelection);

  const availableTokens = useMemo(
    () =>
      Object.values(TOKENS).map((token) => ({
        name: token.name,
        symbol: token.symbol,
        address: token.address as `0x${string}`,
        decimals: token.decimals,
        logo: token.logoUrl,
      })),
    []
  );

  // Derive active tokens from state or default from selected pool
  const activeInputToken = useMemo((): TokenConfig | null => {
    if (inputToken) return inputToken;
    if (selectedPool) {
      return {
        name: selectedPool.collateralToken.name,
        symbol: selectedPool.collateralToken.symbol,
        logo: selectedPool.collateralToken.logoUrl,
        decimals: selectedPool.collateralToken.decimals,
        address: selectedPool.collateralToken.address as `0x${string}`,
      };
    }
    return null;
  }, [inputToken, selectedPool]);

  const activeOutputToken = useMemo((): TokenConfig | null => {
    if (outputToken) return outputToken;
    if (selectedPool) {
      return {
        name: selectedPool.borrowToken.name,
        symbol: selectedPool.borrowToken.symbol,
        logo: selectedPool.borrowToken.logoUrl,
        decimals: selectedPool.borrowToken.decimals,
        address: selectedPool.borrowToken.address as `0x${string}`,
      };
    }
    return null;
  }, [outputToken, selectedPool]);

  const { data: exchangeRate, isLoading: exchangeRateLoading } =
    useExchangeRate({
      fromToken: activeInputToken?.symbol,
      toToken: activeOutputToken?.symbol,
      enabled: !!activeInputToken && !!activeOutputToken,
    });

  const { calculatedOutputAmount, inputUsdValue, outputUsdValue } =
    useSwapCalculations(inputAmount, exchangeRate ?? null, activeInputToken, activeOutputToken);

  const {
    userCollateralBalanceFormatted: inputBalance,
    userCollateralBalanceLoading: inputBalanceLoading,
  } = useReadUserCollateralBalance(
    (selectedPool?.pool as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    (activeInputToken?.address as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    activeInputToken?.decimals || 18
  );

  const {
    userCollateralBalanceFormatted: outputBalance,
    userCollateralBalanceLoading: outputBalanceLoading,
  } = useReadUserCollateralBalance(
    (selectedPool?.pool as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    (activeOutputToken?.address as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    activeOutputToken?.decimals || 18
  );

  const swap = useSwap();

  const handlePoolSelect = (pool: PoolComplete) => {
    setManualPoolSelection(pool);
    setInputToken({
      name: pool.collateralToken.name,
      symbol: pool.collateralToken.symbol,
      logo: pool.collateralToken.logoUrl,
      decimals: pool.collateralToken.decimals,
      address: pool.collateralToken.address as `0x${string}`,
    });
    setOutputToken({
      name: pool.borrowToken.name,
      symbol: pool.borrowToken.symbol,
      logo: pool.borrowToken.logoUrl,
      decimals: pool.borrowToken.decimals,
      address: pool.borrowToken.address as `0x${string}`,
    });
    setShowPoolSelect(false);
  };

  const handleSwap = async () => {
    if (
      !selectedPool ||
      !activeInputToken ||
      !activeOutputToken ||
      !isValidAmount(inputAmount)
    ) {
      return;
    }

    try {
      await swap.mutation.mutateAsync({
        poolAddress: selectedPool.pool as `0x${string}`,
        tokenIn: activeInputToken.address as `0x${string}`,
        tokenOut: activeOutputToken.address as `0x${string}`,
        amountIn: inputAmount,
        tokenInDecimals: activeInputToken.decimals,
      });

      setInputAmount("");
    } catch (error) {
      console.error("Swap failed:", error);
    }
  };

  const isSwapDisabled =
    !selectedPool ||
    !activeInputToken ||
    !activeOutputToken ||
    !inputAmount ||
    !isValidAmount(inputAmount) ||
    swap.mutation.isPending;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <Card className="w-full max-w-[480px] border-border bg-card rounded-none shadow-xl shadow-black/5 z-10">
        <CardContent className="p-4 space-y-3">
          {allPools.length > 0 ? (
            <Button
              variant="outline"
              onClick={() => setShowPoolSelect(true)}
              className="w-full rounded-none border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors h-auto py-3"
            >
              <div className="flex items-center justify-between w-full">
                {selectedPool ? (
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <div className="text-sm font-semibold text-foreground">
                        {selectedPool.collateralToken.symbol} /{" "}
                        {selectedPool.borrowToken.symbol} Pool
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {allPools.length} pools available
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Select a Pool
                  </span>
                )}
              </div>
            </Button>
          ) : (
            <div className="w-full rounded-none border border-border/50 bg-muted/20 p-3 text-center text-sm text-muted-foreground">
              No lending pools available
            </div>
          )}

          <TokenInput
            label="Sell"
            amount={inputAmount}
            onAmountChange={setInputAmount}
            token={activeInputToken}
            onTokenSelect={() => setShowInputSelect(true)}
            usdValue={inputUsdValue}
            balance={inputBalance || "0.00"}
            balanceLoading={inputBalanceLoading}
            showMaxButton
          />

          <div className="flex justify-center -my-2 relative z-10">
            <div className="rounded-none border border-border bg-background p-1">
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <TokenInput
            label="Buy"
            amount={calculatedOutputAmount}
            onAmountChange={() => {}}
            token={activeOutputToken}
            onTokenSelect={() => setShowOutputSelect(true)}
            usdValue={outputUsdValue}
            balance={outputBalance || "0.00"}
            balanceLoading={outputBalanceLoading}
            readOnly
          />

          {activeInputToken && activeOutputToken && (
            <ExchangeRateDisplay
              fromSymbol={activeInputToken.symbol}
              toSymbol={activeOutputToken.symbol}
              rate={exchangeRate ?? null}
              loading={exchangeRateLoading}
            />
          )}

          {swap.steps.length > 0 &&
            (swap.mutation.isPending ||
              swap.steps.some((s) => s.status !== "idle")) && (
              <TransactionStatusDisplay
                status={swap.steps[0].status}
                title="Swapping Tokens"
                txHash={swap.txHash}
                error={swap.steps[0].error}
              />
            )}
        </CardContent>

        <CardFooter className="pt-0 px-4 pb-6">
          {!isConnected ? (
            <Button
              size="lg"
              className="w-full text-lg font-bold rounded-none h-14"
              onClick={openConnectModal}
            >
              Connect Wallet
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full text-lg font-bold rounded-none h-14"
              onClick={handleSwap}
              disabled={isSwapDisabled}
            >
              {swap.mutation.isPending ? <Spinner label="Swapping" /> : "Swap"}
            </Button>
          )}
        </CardFooter>
      </Card>

      <TokenSelectDialog
        open={showInputSelect}
        onOpenChange={setShowInputSelect}
        tokens={availableTokens}
        onSelect={(token) => {
          setInputToken(token);
          setShowInputSelect(false);
        }}
        title="Select Input Token"
      />

      <TokenSelectDialog
        open={showOutputSelect}
        onOpenChange={setShowOutputSelect}
        tokens={availableTokens}
        onSelect={(token) => {
          setOutputToken(token);
          setShowOutputSelect(false);
        }}
        title="Select Output Token"
      />

      <PoolSelectDialog
        open={showPoolSelect}
        onOpenChange={setShowPoolSelect}
        pools={allPools}
        onSelect={handlePoolSelect}
        title="Select Pool"
      />
    </div>
  );
};
