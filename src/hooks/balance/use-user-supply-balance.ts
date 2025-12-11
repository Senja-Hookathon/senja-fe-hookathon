"use client";

import { useReadContract } from "wagmi";
import { erc20Abi, formatUnits } from "viem";
import { useReadUserPosition } from "../contract/use-read-positon-address";

export type HexAddress = `0x${string}`;

export const supplyBalanceKeys = {
  all: ["supplyBalance"] as const,
  balance: (
    lendingPoolAddress: string,
    tokenAddress: string,
    userPosition: string | undefined
  ) =>
    [
      ...supplyBalanceKeys.all,
      lendingPoolAddress,
      tokenAddress,
      userPosition,
    ] as const,
};

const getDisplayDecimals = (decimals: number): number => {
  if (decimals >= 18) return 4;
  if (decimals >= 6) return 2;
  return decimals;
};

export const useReadUserSupplyBalance = (
  lendingPoolAddress: HexAddress,
  tokenAddress: HexAddress,
  decimals: number
) => {
  const { userPosition, userPositionLoading, userPositionError } =
    useReadUserPosition(lendingPoolAddress);

  const hasValidPosition =
    userPosition &&
    userPosition !== "0x0000000000000000000000000000000000000000" &&
    userPosition !== "0x0000000000000000000000000000000000000001";

  const {
    data: rawBalance,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [
      (userPosition ||
        "0x0000000000000000000000000000000000000000") as `0x${string}`,
    ],
    chainId: 43114,
    query: {
      enabled:
        hasValidPosition &&
        !userPositionLoading &&
        !userPositionError &&
        !!tokenAddress &&
        tokenAddress !== "0x0000000000000000000000000000000000000000" &&
        !!lendingPoolAddress &&
        lendingPoolAddress !== "0x0000000000000000000000000000000000000000",
      staleTime: 10000,
      gcTime: 30000,
      retry: 2,
      retryDelay: 400,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    },
  });

  const formatted = rawBalance
    ? parseFloat(formatUnits(rawBalance as bigint, decimals)).toFixed(
        getDisplayDecimals(decimals)
      )
    : "0";

  const parsed = rawBalance
    ? parseFloat(formatUnits(rawBalance as bigint, decimals))
    : 0;

  return {
    userSupplyBalance: rawBalance || BigInt(0),
    userSupplyBalanceFormatted: formatted,
    userSupplyBalanceParsed: parsed,
    userSupplyBalanceLoading: userPositionLoading || isLoading,
    userSupplyBalanceError: userPositionError || error,
    refetchUserSupplyBalance: refetch,
    hasValidPosition,
  };
};
