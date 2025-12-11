"use client";

import { useReadContract, useConnection } from "wagmi";
import { routerAbi } from "@/lib/abis/router-abi";
import { useReadRouterAddress } from "./use-read-router-address";

export type HexAddress = `0x${string}`;

export const useReadUserPosition = (lendingPoolAddress: HexAddress) => {
  const { address } = useConnection();
  const { routerAddress, routerLoading } =
    useReadRouterAddress(lendingPoolAddress);

  const {
    data: userPosition,
    isLoading: userPositionLoading,
    error: userPositionError,
    refetch: refetchUserPosition,
  } = useReadContract({
    address: routerAddress,
    abi: routerAbi,
    functionName: "addressPositions",
    args: [
      (address || "0x0000000000000000000000000000000000000000") as HexAddress,
    ],
    chainId: 43114, // Avalanche C-Chain
    query: {
      enabled: !!routerAddress && !!address,
      staleTime: 10000,
      gcTime: 30000,
      refetchInterval: 10000,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  });

  return {
    userPosition: userPosition as HexAddress | undefined,
    userPositionLoading: routerLoading || userPositionLoading,
    userPositionError: userPositionError,
    refetchUserPosition,
    routerAddress,
  };
};
