import { useReadContract } from "wagmi";

import { routerAbi } from "@/lib/abis/router-abi";
import { useReadRouterAddress } from "./use-read-router-address";

export type HexAddress = `0x${string}`;

export const useReadTotalBorrowAssets = (lendingPoolAddress: HexAddress) => {
  const { routerAddress } = useReadRouterAddress(lendingPoolAddress);
  const {
    data: totalBorrowAssets,
    isLoading: totalBorrowAssetsLoading,
    error: totalBorrowAssetsError,
    refetch: refetchTotalBorrowAssets,
  } = useReadContract({
    address: routerAddress,
    abi: routerAbi,
    functionName: "totalBorrowAssets",
    args: [],
  });

  const effectiveTotalBorrowAssets =
    totalBorrowAssetsError || !totalBorrowAssets
      ? BigInt(0)
      : totalBorrowAssets;

  return {
    totalBorrowAssets: effectiveTotalBorrowAssets,
    totalBorrowAssetsLoading: totalBorrowAssetsLoading,
    totalBorrowAssetsError: totalBorrowAssetsError,
    refetchTotalBorrowAssets,
  };
};
