"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { lendingPoolAbi } from "@/lib/abis/pool-abi";
import { erc20Abi } from "viem";
import { config } from "@/lib/config";
import { useConnection } from "wagmi";
import { useReadTotalBorrowAssets } from "@/hooks/contract/use-read-total-borrow-asset";
import { useReadTotalBorrowShares } from "@/hooks/contract/use-read-total-borrow-shares";

type Status = "idle" | "loading" | "success" | "error";
type HexAddress = `0x${string}`;

interface RepayParams {
  poolAddress: HexAddress;
  borrowTokenAddress: HexAddress;
  amount: string;
  tokenDecimals: number;
}

const isUserRejectedError = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  return message.includes("rejected") || message.includes("denied");
};

export const useRepay = (poolAddress?: HexAddress) => {
  const queryClient = useQueryClient();
  const { address } = useConnection();

  // Fetch total borrow assets and shares for conversion
  const { totalBorrowAssets } = useReadTotalBorrowAssets(
    poolAddress || ("0x0000000000000000000000000000000000000000" as HexAddress)
  );
  const { totalBorrowShares } = useReadTotalBorrowShares(
    poolAddress || ("0x0000000000000000000000000000000000000000" as HexAddress)
  );

  const [steps, setSteps] = useState<
    Array<{
      step: number;
      status: Status;
      error?: string;
    }>
  >([
    { step: 1, status: "idle" },
    { step: 2, status: "idle" },
  ]);

  const [txHash, setTxHash] = useState<HexAddress | null>(null);
  const [approveTxHash, setApproveTxHash] = useState<HexAddress | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      poolAddress,
      borrowTokenAddress,
      amount,
      tokenDecimals,
    }: RepayParams) => {
      try {
        if (!address) {
          throw new Error("Wallet not connected");
        }

        setSteps([
          { step: 1, status: "idle" },
          { step: 2, status: "idle" },
        ]);

        const amountFloat = parseFloat(amount);
        if (isNaN(amountFloat) || amountFloat <= 0) {
          throw new Error("Invalid amount");
        }

        const amountBigInt = BigInt(
          Math.floor(amountFloat * Math.pow(10, tokenDecimals))
        );

        // Calculate shares from amount
        // shares = (amount * totalBorrowAssets) / totalBorrowShares
        let sharesBigInt = amountBigInt;
        if (totalBorrowAssets > 0 && totalBorrowShares > 0) {
          sharesBigInt = (amountBigInt * totalBorrowAssets) / totalBorrowShares;
        }

        // Add 10% buffer to approve amount to account for interest accrual
        const approveAmount = (amountBigInt * BigInt(110)) / BigInt(100);

        // STEP 1: Approve with 10% buffer
        setSteps([
          { step: 1, status: "loading" },
          { step: 2, status: "idle" },
        ]);

        const approveHash = await writeContract(config, {
          address: borrowTokenAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [poolAddress, approveAmount],
        });
        setApproveTxHash(approveHash);

        await waitForTransactionReceipt(config, {
          hash: approveHash,
          confirmations: 1,
          pollingInterval: 1000,
        });

        setSteps([
          { step: 1, status: "success" },
          { step: 2, status: "idle" },
        ]);

        // STEP 2: Repay using repayWithSelectedToken with calculated shares
        setSteps([
          { step: 1, status: "success" },
          { step: 2, status: "loading" },
        ]);

        const hash = await writeContract(config, {
          address: poolAddress,
          abi: lendingPoolAbi,
          functionName: "repayWithSelectedToken",
          args: [
            address, // _user
            borrowTokenAddress, // _token
            sharesBigInt, // _shares (calculated from amount)
            BigInt(0), // _amountOutMinimum
            false, // _fromPosition
          ],
        });
        setTxHash(hash);

        const result = await waitForTransactionReceipt(config, {
          hash,
          confirmations: 1,
          pollingInterval: 1000,
        });

        setSteps([
          { step: 1, status: "success" },
          { step: 2, status: "success" },
        ]);

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["pools"] });
        queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
        queryClient.invalidateQueries({ queryKey: ["userBorrowBalance"] });
        queryClient.invalidateQueries({ queryKey: ["userBorrowShares"] });

        return result;
      } catch (e) {
        const error = e as Error;

        if (isUserRejectedError(error)) {
          setSteps([
            { step: 1, status: "idle" },
            { step: 2, status: "idle" },
          ]);
        } else {
          setSteps((prev) =>
            prev.map((step) =>
              step.status === "loading"
                ? { ...step, status: "error", error: error.message }
                : step
            )
          );
        }

        throw e;
      }
    },
  });

  const reset = () => {
    setSteps([
      { step: 1, status: "idle" },
      { step: 2, status: "idle" },
    ]);
    setTxHash(null);
    setApproveTxHash(null);
    mutation.reset();
  };

  return { steps, mutation, txHash, approveTxHash, reset };
};
