"use client";

import { useReadContract, useConnection } from "wagmi";
import { formatUnits } from "viem/utils";
import { erc20Abi } from "viem";

export type HexAddress = `0x${string}`;

// Query key factory for token balance - used for invalidation
export const tokenBalanceKeys = {
  all: ["tokenBalance"] as const,
  token: (tokenAddress: string, userAddress: string | undefined) =>
    [...tokenBalanceKeys.all, tokenAddress, userAddress] as const,
};

// Helper function to determine display decimals
const getDisplayDecimals = (decimals: number): number => {
  if (decimals >= 18) return 4;
  if (decimals >= 6) return 2;
  return decimals;
};

export const useUserWalletBalance = (
  tokenAddress: HexAddress,
  decimals: number
) => {
  const { address } = useConnection();

  // Use useReadContract with built-in TanStack Query integration
  const {
    data: rawBalance,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !!tokenAddress,
      refetchInterval: 10000, // Refetch every 10 seconds
      staleTime: 5000, // Consider data stale after 5 seconds
    },
  });

  // Format the balance
  const formatted = rawBalance
    ? parseFloat(formatUnits(rawBalance as bigint, decimals)).toFixed(
        getDisplayDecimals(decimals)
      )
    : "0";

  const parsed = rawBalance
    ? parseFloat(formatUnits(rawBalance as bigint, decimals))
    : 0;

  return {
    userWalletBalance: rawBalance,
    userWalletBalanceFormatted: formatted,
    userWalletBalanceParsed: parsed,
    walletBalanceLoading: isLoading,
    walletBalanceError: error,
    refetchWalletBalance: refetch,
  };
};
