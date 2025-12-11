"use client";

import { useReadContract, useConnection } from "wagmi";
import { routerAbi } from "@/lib/abis/router-abi";
import { formatUnits } from "viem";
import { useReadRouterAddress } from "../contract/use-read-router-address";

export type HexAddress = `0x${string}`;

export const liquidityBalanceKeys = {
  all: ["liquidityBalance"] as const,
  balance: (
    lendingPoolAddress: string,
    routerAddress: string | undefined,
    userAddress: string | undefined
  ) =>
    [
      ...liquidityBalanceKeys.all,
      lendingPoolAddress,
      routerAddress,
      userAddress,
    ] as const,
};

const getDisplayDecimals = (decimals: number): number => {
  if (decimals >= 18) return 4;
  if (decimals >= 6) return 2;
  return decimals;
};

export const useReadUserLiquidityBalance = (
  lendingPoolAddress: HexAddress,
  decimals: number
) => {
  const { address } = useConnection();
  const { routerAddress, routerLoading } =
    useReadRouterAddress(lendingPoolAddress);

  const {
    data: rawShares,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: routerAddress,
    abi: routerAbi,
    functionName: "userSupplyShares",
    args: [
      (address || "0x0000000000000000000000000000000000000000") as HexAddress,
    ],
    chainId: 43114,
    query: {
      enabled: !!routerAddress && !!address,
      staleTime: 10000,
      gcTime: 30000,
      retry: 2,
      retryDelay: 400,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    },
  });

  const formatted = rawShares
    ? parseFloat(formatUnits(rawShares as bigint, decimals)).toFixed(
        getDisplayDecimals(decimals)
      )
    : "0";

  const parsed = rawShares
    ? parseFloat(formatUnits(rawShares as bigint, decimals))
    : 0;

  return {
    userLiquidityShares: rawShares || BigInt(0),
    userLiquiditySharesFormatted: formatted,
    userLiquiditySharesParsed: parsed,
    userLiquidityBalanceLoading: routerLoading || isLoading,
    userLiquidityBalanceError: error,
    refetchUserLiquidityBalance: refetch,
  };
};
