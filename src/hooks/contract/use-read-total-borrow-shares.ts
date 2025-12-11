import { useReadContract } from "wagmi";

import { routerAbi } from "@/lib/abis/router-abi";
import { useReadRouterAddress } from "./use-read-router-address";

export type HexAddress = `0x${string}`;

export const useReadTotalBorrowShares = (lendingPoolAddress: HexAddress) => {
  const { routerAddress } = useReadRouterAddress(lendingPoolAddress);
  const {
    data: totalBorrowShares,
    isLoading: totalBorrowSharesLoading,
    error: totalBorrowSharesError,
    refetch: refetchTotalBorrowShares,
  } = useReadContract({
    address: routerAddress,
    abi: routerAbi,
    functionName: "totalBorrowShares",
    args: [],
  });

  const effectiveTotalBorrowShares =
    totalBorrowSharesError || !totalBorrowShares
      ? BigInt(0)
      : totalBorrowShares;

  return {
    totalBorrowShares: effectiveTotalBorrowShares,
    totalBorrowSharesLoading: totalBorrowSharesLoading,
    totalBorrowSharesError: totalBorrowSharesError,
    refetchTotalBorrowShares,
  };
};
