"use client";
import { useQuery } from "@tanstack/react-query";
import { readContract } from "wagmi/actions";
import { routerAbi } from "@/lib/abis/router-abi";
import { useConnection } from "wagmi";
import { useReadRouterAddress } from "@/hooks/contract/use-read-router-address";
import { config } from "@/lib/config";

export type HexAddress = `0x${string}`;

export const useReadUserBorrowShares = (
  lendingPoolAddress: HexAddress,
  decimal: number
) => {
  const { address } = useConnection();
  const { routerAddress } = useReadRouterAddress(lendingPoolAddress);
  const {
    data: userBorrowShares,
    isLoading: userBorrowSharesLoading,
    error: userBorrowSharesError,
    refetch: refetchUserBorrowShares,
  } = useQuery({
    queryKey: ["userBorrowShares", lendingPoolAddress, address],
    queryFn: async () => {
      if (!address || !routerAddress) {
        return BigInt(0);
      }

      const result = await readContract(config, {
        address: routerAddress,
        abi: routerAbi,
        functionName: "userBorrowShares",
        args: [address as HexAddress],
      });

      return result as bigint;
    },
    enabled: !!address && !!routerAddress,
    refetchInterval: 5000,
    staleTime: 3000,
  });

  const formatUserBorrowShares = (
    rawUserBorrowSharesData: bigint | undefined,
    hasError: boolean
  ): string => {
    if (
      hasError ||
      !rawUserBorrowSharesData ||
      rawUserBorrowSharesData === undefined
    )
      return "0.00000";

    try {
      if (rawUserBorrowSharesData === BigInt(0)) {
        return "0.00000";
      }

      const userBorrowSharesNumber =
        Number(rawUserBorrowSharesData) / Math.pow(10, decimal);

      const decimalPlaces = Math.min(decimal, 6);
      const result = userBorrowSharesNumber.toFixed(decimalPlaces);

      return result;
    } catch {
      return "0.00000";
    }
  };

  const userBorrowSharesFormatted = formatUserBorrowShares(
    userBorrowShares,
    !!userBorrowSharesError
  );

  return {
    userBorrowShares: userBorrowSharesError
      ? BigInt(0)
      : userBorrowShares || BigInt(0),
    userBorrowSharesFormatted,
    userBorrowSharesLoading,
    userBorrowSharesError,
    refetchUserBorrowShares,
  };
};
