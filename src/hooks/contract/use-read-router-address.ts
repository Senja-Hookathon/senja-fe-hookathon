"use client";

import { useReadContract } from "wagmi";
import { helperAbi } from "@/lib/abis/helper-abi";
import { getContractAddress, Network } from "@/lib/addresses";

export type HexAddress = `0x${string}`;

const helperAddress = getContractAddress(
  Network.Avalanche,
  "HELPER"
) as HexAddress;

export const useReadRouterAddress = (lendingPoolAddress: HexAddress) => {
  const { data, isLoading, error, refetch } = useReadContract({
    abi: helperAbi,
    address: helperAddress,
    functionName: "getRouter",
    args: [lendingPoolAddress as HexAddress],
    chainId: 43114, // Avalanche C-Chain
    query: {
      enabled:
        !!lendingPoolAddress &&
        lendingPoolAddress !== "0x0000000000000000000000000000000000000000",
      staleTime: Infinity,
      gcTime: Infinity,
      retry: 2,
      retryDelay: 300,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  });

  const routerAddress = data || lendingPoolAddress;

  return {
    routerAddress: routerAddress as HexAddress | undefined,
    routerLoading: isLoading,
    routerError: error,
    refetchRouter: refetch,
  };
};
