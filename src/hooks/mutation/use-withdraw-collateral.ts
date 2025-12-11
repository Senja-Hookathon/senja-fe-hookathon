"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { lendingPoolAbi } from "@/lib/abis/pool-abi";
import { config } from "@/lib/config";
import { useConnection } from "wagmi";

type Status = "idle" | "loading" | "success" | "error";
type HexAddress = `0x${string}`;

interface WithdrawCollateralParams {
  poolAddress: HexAddress;
  amount: string;
  tokenDecimals: number;
}

const isUserRejectedError = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  return message.includes("rejected") || message.includes("denied");
};

export const useWithdrawCollateral = () => {
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
    }: WithdrawCollateralParams) => {
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
          functionName: "withdrawCollateral",
          args: [amountBigInt],
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
        queryClient.invalidateQueries({ queryKey: ["collateralBalance"] });

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
