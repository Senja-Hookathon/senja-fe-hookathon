"use client";

import { useReadContract, useConnection } from "wagmi";
import { useMemo } from "react";
import { helperAbi } from "@/lib/abis/helper-abi";
import { getContractAddress, Network } from "@/lib/addresses";
import type { TokenConfig } from "@/lib/addresses/types";

export type HexAddress = `0x${string}`;

const helperAddress = getContractAddress(
  Network.Avalanche,
  "HELPER"
) as HexAddress;

const parseAmountToBigIntSafe = (amount: string, decimals: number): bigint => {
  try {
    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      return BigInt(0);
    }
    return BigInt(Math.floor(amountFloat * Math.pow(10, decimals)));
  } catch {
    return BigInt(0);
  }
};

export const useReadFee = (
  destinationEndpoint: number,
  amount: string | bigint,
  decimal: number,
  token: TokenConfig
) => {
  const { address } = useConnection();
  const oftAddress = token.oftAddress;

  // Parse amount to bigint with proper decimal handling
  const parsedAmount = useMemo(() => {
    if (typeof amount === "bigint") {
      return amount;
    }
    return parseAmountToBigIntSafe(amount, decimal);
  }, [amount, decimal]);

  // Avalanche endpoint = no fee (onchain)
  const isAvalancheEndpoint = destinationEndpoint === 30106;

  const {
    data: rawFee,
    isLoading: feeLoading,
    error: feeError,
    refetch: refetchFee,
  } = useReadContract({
    address: helperAddress,
    abi: helperAbi,
    functionName: "getFee",
    args: [
      (oftAddress ||
        "0x0000000000000000000000000000000000000000") as HexAddress,
      destinationEndpoint,
      (address || "0x0000000000000000000000000000000000000000") as HexAddress,
      parsedAmount,
    ],
    chainId: 43114,
    query: {
      enabled:
        !isAvalancheEndpoint &&
        parsedAmount > 0 &&
        !!address &&
        !!oftAddress &&
        oftAddress !== "0x0000000000000000000000000000000000000000",
    },
  });

  const fee = useMemo(() => {
    if (isAvalancheEndpoint) {
      return BigInt(0);
    }

    if (!rawFee) {
      return BigInt(0);
    }

    return rawFee as bigint;
  }, [rawFee, isAvalancheEndpoint]);

  return {
    fee,
    feeLoading: isAvalancheEndpoint ? false : feeLoading,
    feeError: isAvalancheEndpoint ? null : feeError,
    refetchFee,
    parsedAmount,
  };
};
