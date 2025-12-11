"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { lendingPoolAbi } from "@/lib/abis/pool-abi";
import { config } from "@/lib/config";
import { useConnection } from "wagmi";

type Status = "idle" | "loading" | "success" | "error";
type HexAddress = `0x${string}`;

interface SwapParams {
  poolAddress: HexAddress;
  tokenIn: HexAddress;
  tokenOut: HexAddress;
  amountIn: string;
  tokenInDecimals: number;
}

const isUserRejectedError = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  return message.includes("rejected") || message.includes("denied");
};

export const useSwap = () => {
  const queryClient = useQueryClient();
  const { address } = useConnection();

  // Only 1 step now (no approve needed)
  const [steps, setSteps] = useState<
    Array<{
      step: number;
      status: Status;
      error?: string;
    }>
  >([{ step: 1, status: "idle" }]);

  const [txHash, setTxHash] = useState<HexAddress | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      poolAddress,
      tokenIn,
      tokenOut,
      amountIn,
      tokenInDecimals,
    }: SwapParams) => {
      try {
        if (!address) {
          throw new Error("Wallet not connected");
        }

        setSteps([{ step: 1, status: "idle" }]);

        const amountFloat = parseFloat(amountIn);
        if (isNaN(amountFloat) || amountFloat <= 0) {
          throw new Error("Invalid amount");
        }

        // Convert amount to BigInt with proper decimals
        const amountBigInt = BigInt(
          Math.floor(amountFloat * Math.pow(10, tokenInDecimals))
        );

        // STEP 1: Swap (no approve needed)
        setSteps([{ step: 1, status: "loading" }]);

        const hash = await writeContract(config, {
          address: poolAddress,
          abi: lendingPoolAbi,
          functionName: "swapTokenByPosition",
          args: [tokenIn, tokenOut, amountBigInt, BigInt(0)],
        });
        setTxHash(hash);

        const result = await waitForTransactionReceipt(config, {
          hash,
          confirmations: 1,
          pollingInterval: 1000,
        });

        setSteps([{ step: 1, status: "success" }]);

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["pools"] });
        queryClient.invalidateQueries({ queryKey: ["poolsComplete"] });
        queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
        queryClient.invalidateQueries({ queryKey: ["collateralBalance"] });
        queryClient.invalidateQueries({ queryKey: ["exchangeRate"] });

        return result;
      } catch (e) {
        const error = e as Error;

        if (isUserRejectedError(error)) {
          setSteps([{ step: 1, status: "idle" }]);
        } else {
          setSteps([{ step: 1, status: "error", error: error.message }]);
        }

        throw e;
      }
    },
  });

  const reset = () => {
    setSteps([{ step: 1, status: "idle" }]);
    setTxHash(null);
    mutation.reset();
  };

  return { steps, mutation, txHash, reset };
};
