"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { lendingPoolAbi } from "@/lib/abis/pool-abi";
import { erc20Abi } from "viem";
import { config } from "@/lib/config";
import { useConnection } from "wagmi";

type Status = "idle" | "loading" | "success" | "error";
type HexAddress = `0x${string}`;

interface SupplyLiquidityParams {
  poolAddress: HexAddress;
  borrowTokenAddress: HexAddress;
  amount: string;
  tokenDecimals: number;
}

const isUserRejectedError = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  return message.includes("rejected") || message.includes("denied");
};

export const useSupplyLiquidity = () => {
  const queryClient = useQueryClient();
  const { address } = useConnection();

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
    }: SupplyLiquidityParams) => {
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

        // STEP 1: Approve
        setSteps([
          { step: 1, status: "loading" },
          { step: 2, status: "idle" },
        ]);

        const approveHash = await writeContract(config, {
          address: borrowTokenAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [poolAddress, amountBigInt],
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

        // STEP 2: Supply
        setSteps([
          { step: 1, status: "success" },
          { step: 2, status: "loading" },
        ]);

        const hash = await writeContract(config, {
          address: poolAddress,
          abi: lendingPoolAbi,
          functionName: "supplyLiquidity",
          args: [address, amountBigInt],
        });
        setTxHash(hash);

        const result = await waitForTransactionReceipt(config, {
          hash,
          confirmations: 1,
          pollingInterval: 1000,
          timeout: 60_000, // 60 seconds timeout
        }).catch(async (error) => {
          // If error is about unfinalized data, wait a bit and try once more
          if (error.message?.includes("unfinalized")) {
            console.warn(
              "⚠️ Unfinalized data error, waiting 2s and retrying..."
            );
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return waitForTransactionReceipt(config, {
              hash,
              confirmations: 1,
              pollingInterval: 2000,
              timeout: 30_000,
            });
          }
          throw error;
        });

        setSteps([
          { step: 1, status: "success" },
          { step: 2, status: "success" },
        ]);

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["pools"] });
        queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
        queryClient.invalidateQueries({ queryKey: ["liquidityBalance"] });

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
