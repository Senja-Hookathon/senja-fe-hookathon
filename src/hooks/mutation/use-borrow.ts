"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { writeContract } from "wagmi/actions";
import { lendingPoolAbi } from "@/lib/abis/pool-abi";
import { config } from "@/lib/config";
import { useConnection } from "wagmi";
import { waitForTxReceipt } from "@/lib/utils/wait-for-tx";

type Status = "idle" | "loading" | "success" | "error";
type HexAddress = `0x${string}`;

interface BorrowParams {
  poolAddress: HexAddress;
  amount: string;
  tokenDecimals: number;
  destinationChainId?: number; // Destination chain for crosschain borrow
  fee?: bigint; // Crosschain fee in native token
}

const isUserRejectedError = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  return message.includes("rejected") || message.includes("denied");
};

export const useBorrow = () => {
  const queryClient = useQueryClient();
  const { address } = useConnection();

  const [status, setStatus] = useState<Status>("idle");
  const [txHash, setTxHash] = useState<HexAddress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      poolAddress,
      amount,
      tokenDecimals,
      destinationChainId = 43114, // Default to Avalanche (same chain)
      fee = BigInt(0), // Default fee is 0 for same-chain
    }: BorrowParams) => {
      try {
        if (!address) {
          throw new Error("Wallet not connected");
        }

        setStatus("idle");
        setError(null);

        const amountFloat = parseFloat(amount);
        if (isNaN(amountFloat) || amountFloat <= 0) {
          throw new Error("Invalid amount");
        }

        const amountBigInt = BigInt(
          Math.floor(amountFloat * Math.pow(10, tokenDecimals))
        );

        setStatus("loading");

        const hash = await writeContract(config, {
          address: poolAddress,
          abi: lendingPoolAbi,
          functionName: "borrowDebt",
          args: [amountBigInt, BigInt(destinationChainId), BigInt(65000)],
          value: fee, // Include fee for crosschain
        });
        setTxHash(hash);

        const result = await waitForTxReceipt(hash);

        setStatus("success");

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["pools"] });
        queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
        queryClient.invalidateQueries({ queryKey: ["userBorrowBalance"] });
        queryClient.invalidateQueries({ queryKey: ["userCollateralBalance"] });
        queryClient.invalidateQueries({ queryKey: ["userBorrowShares"] });

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
