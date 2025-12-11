"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ActionButton } from "@/components/ui/action-button";
import { TransactionStatusDisplay } from "@/components/ui/transaction-status";
import { AlertMessage } from "@/components/ui/alert-message";
import { PoolPreview } from "@/components/ui/pool-preview";
import { TokenSelect } from "@/components/pool/token-select";
import { useCreatePool } from "@/hooks/mutation/use-pool";
import type { TokenConfig } from "@/lib/addresses/types";

export const CreatePoolButton = () => {
  const [open, setOpen] = useState(false);
  const [collateral, setCollateral] = useState<TokenConfig | null>(null);
  const [borrow, setBorrow] = useState<TokenConfig | null>(null);
  const [ltv, setLtv] = useState("");
  const [supplyBalance, setSupplyBalance] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const { mutation, steps, txHash, approveTxHash, reset } = useCreatePool();

  const handleClose = () => {
    setOpen(false);
    setLocalError(null);
    setLtv("");
    setSupplyBalance("");
    setCollateral(null);
    setBorrow(null);
    reset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!collateral || !borrow) {
      setLocalError("Please select both collateral and borrow tokens.");
      return;
    }
    if (collateral.address.toLowerCase() === borrow.address.toLowerCase()) {
      setLocalError("Collateral and borrow token must be different.");
      return;
    }
    if (!ltv) {
      setLocalError("Please input LTV value.");
      return;
    }
    if (!supplyBalance) {
      setLocalError("Please input supply balance.");
      return;
    }

    const ltvNum = parseFloat(ltv);
    if (isNaN(ltvNum) || ltvNum <= 0 || ltvNum > 100) {
      setLocalError("LTV must be between 0 and 100.");
      return;
    }

    const supplyNum = parseFloat(supplyBalance);
    if (isNaN(supplyNum) || supplyNum <= 0) {
      setLocalError("Supply balance must be greater than 0.");
      return;
    }

    mutation.mutate(
      {
        collateralTokenAddress: collateral.address,
        borrowTokenAddress: borrow.address,
        borrowTokenDecimals: borrow.decimals,
        ltvValue: ltv,
        supplyBalance: supplyBalance,
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            handleClose();
          }, 2000);
        },
      }
    );
  };

  const currentStep = steps[0];
  const isSuccess = currentStep?.status === "success";
  const isPending = mutation.isPending;
  const isFormValid =
    collateral && borrow && ltv.trim() !== "" && supplyBalance.trim() !== "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          className="rounded-none border border-pink-600 bg-pink-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition-all hover:bg-pink-700"
        >
          Create Pool
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[calc(100vw-2rem)] border border-neutral-800 bg-neutral-950 text-neutral-50 sm:max-w-[520px]">
        <DialogHeader className="border-b border-neutral-800 pb-4">
          <DialogTitle className="text-xl font-bold text-neutral-50">
            Create New Pool
          </DialogTitle>
          <p className="text-sm text-neutral-400">
            Set up a new lending pool with your preferred tokens
          </p>
        </DialogHeader>

        <form
          className="space-y-6 overflow-hidden pt-2"
          onSubmit={handleSubmit}
        >
          {/* Token Selection */}
          <div className="space-y-4">
            <TokenSelect
              label="Collateral Token"
              selected={collateral}
              onSelect={setCollateral}
              excludeAddress={borrow?.address}
            />
            <TokenSelect
              label="Borrow Token"
              selected={borrow}
              onSelect={setBorrow}
              excludeAddress={collateral?.address}
            />
          </div>

          {/* LTV Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-200">
              Loan-to-Value (LTV) Ratio
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={ltv}
                onChange={(e) => setLtv(e.target.value)}
                placeholder="75"
                className="h-12 w-full rounded-none border border-neutral-800 bg-neutral-900/50 px-4 pr-12 text-sm text-neutral-100 outline-none transition-colors placeholder:text-neutral-500 focus:border-neutral-700 focus:bg-neutral-900"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-400">
                %
              </span>
            </div>
          </div>

          {/* Supply Balance Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-200">
              Initial Supply Balance
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                step="any"
                value={supplyBalance}
                onChange={(e) => setSupplyBalance(e.target.value)}
                placeholder="1000"
                className="h-12 w-full rounded-none border border-neutral-800 bg-neutral-900/50 px-4 text-sm text-neutral-100 outline-none transition-colors placeholder:text-neutral-500 focus:border-neutral-700 focus:bg-neutral-900"
              />
            </div>
          </div>

          {/* Pool Preview */}
          {collateral && borrow && (
            <PoolPreview
              collateral={collateral}
              borrow={borrow}
              ltv={ltv || "0"}
            />
          )}

          <AlertMessage type="error" message={localError} />

          {/* Transaction Status - Show both steps */}
          {steps.length > 0 &&
            (mutation.isPending || steps.some((s) => s.status !== "idle")) && (
              <div className="space-y-3">
                {steps.map((step) => (
                  <TransactionStatusDisplay
                    key={step.step}
                    status={step.status}
                    title={
                      step.step === 1
                        ? "Step 1: Approving Token"
                        : "Step 2: Creating Pool"
                    }
                    error={step.error}
                    txHash={step.step === 1 ? approveTxHash : txHash}
                  />
                ))}
              </div>
            )}

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-neutral-800 pt-4">
            <ActionButton
              type="submit"
              variant="create"
              isLoading={isPending}
              isSuccess={isSuccess}
              loadingText="Creating..."
              successText="Created!"
              fullWidth
              disabled={!isFormValid || isPending}
            >
              Create Pool
            </ActionButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
