"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { lendingPoolAbi } from "@/lib/abis/pool-abi";
import { config } from "@/lib/config";
import { useConnection } from "wagmi";

type Status = "idle" | "loading" | "success" | "error";
type HexAddress = `0x${string}`;

interface WithdrawLiquidityParams {
  poolAddress: HexAddress;
  shares: string;
  tokenDecimals: number; // Borrow token decimals
}

const isUserRejectedError = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  return message.includes("rejected") || message.includes("denied");
};

export const useWithdrawLiquidity = () => {
  const queryClient = useQueryClient();
  const { address } = useConnection();

  const [status, setStatus] = useState<Status>("idle");
  const [txHash, setTxHash] = useState<HexAddress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      poolAddress,
      shares,
      tokenDecimals,
    }: WithdrawLiquidityParams) => {
      try {
        if (!address) {
          throw new Error("Wallet not connected");
        }

        setStatus("idle");
        setError(null);

        const sharesFloat = parseFloat(shares);
        if (isNaN(sharesFloat) || sharesFloat <= 0) {
          throw new Error("Invalid shares amount");
        }

        // Use borrow token decimals for shares calculation
        const sharesBigInt = BigInt(
          Math.floor(sharesFloat * Math.pow(10, tokenDecimals))
        );

        setStatus("loading");

        const hash = await writeContract(config, {
          address: poolAddress,
          abi: lendingPoolAbi,
          functionName: "withdrawLiquidity",
          args: [sharesBigInt],
        });
        setTxHash(hash);

        const result = await waitForTransactionReceipt(config, {
          hash,
          confirmations: 1,
          pollingInterval: 1000,
        });

        setStatus("success");

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["pools"] });
        queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
        queryClient.invalidateQueries({ queryKey: ["liquidityBalance"] });

        return result;
      } catch (e) {
        const err = e as Error;

        if (isUserRejectedError(err)) {
          setStatus("idle");
        } else {
          setStatus("error");
          setError(err.message);
        }

        throw e;
      }
    },
  });

  const reset = () => {
    setStatus("idle");
    setTxHash(null);
    setError(null);
    mutation.reset();
  };

  return { status, mutation, txHash, error, reset };
};
