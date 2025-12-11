"use client";

import { useQuery } from "@tanstack/react-query";
import { readContract } from "wagmi/actions";
import { useReadUserPosition } from "./use-read-positon-address";
import { getContractAddress, Network } from "@/lib/addresses";
import { helperAbi } from "@/lib/abis/helper-abi";
import { config } from "@/lib/config";

export type HexAddress = `0x${string}`;

const helperAddress = getContractAddress(
  Network.Avalanche,
  "HELPER"
) as HexAddress;

export const useReadExchangeRate = (
  lendingPoolAddress: HexAddress,
  fromTokenAddress: HexAddress,
  toTokenAddress: HexAddress,
  amountIn: number,
  fromTokenDecimals: number,
  toTokenDecimals: number
) => {
  const { userPosition, userPositionLoading, userPositionError } =
    useReadUserPosition(lendingPoolAddress);

  // Validate amountIn to prevent Infinity or invalid values
  const isValidAmount = amountIn > 0 && isFinite(amountIn) && !isNaN(amountIn);

  // Use a minimum amount for exchange rate calculation
  const getSafeAmountIn = () => {
    if (isValidAmount) return Math.floor(amountIn);
    // Use 0.01 in token units for better exchange rate calculation
    return Math.pow(10, fromTokenDecimals - 2);
  };

  const safeAmountIn = getSafeAmountIn();

  // Allow exchange rate calculation when we have all required data
  const canCalculateRate =
    !!userPosition &&
    !userPositionLoading &&
    !userPositionError &&
    !!fromTokenAddress &&
    !!toTokenAddress &&
    fromTokenAddress !== "0x0000000000000000000000000000000000000000" &&
    toTokenAddress !== "0x0000000000000000000000000000000000000000" &&
    lendingPoolAddress !== "0x0000000000000000000000000000000000000000";

  // Ensure safeAmountIn is a valid integer for BigInt conversion
  const safeAmountInBigInt =
    Number.isInteger(safeAmountIn) && safeAmountIn > 0
      ? BigInt(safeAmountIn)
      : BigInt(1);

  const {
    data: exchangeRate,
    isLoading: exchangeRateLoading,
    error: exchangeRateError,
    refetch: refetchExchangeRate,
  } = useQuery({
    queryKey: [
      "exchangeRate",
      lendingPoolAddress,
      fromTokenAddress,
      toTokenAddress,
      safeAmountIn,
    ],
    queryFn: async () => {
      if (!canCalculateRate) {
        console.log("❌ Exchange Rate: Cannot calculate", {
          userPosition,
          userPositionLoading,
          userPositionError,
          fromTokenAddress,
          toTokenAddress,
          lendingPoolAddress,
        });
        return BigInt(0);
      }

      console.log("🔄 Fetching Exchange Rate:", {
        helperAddress,
        fromTokenAddress,
        toTokenAddress,
        safeAmountInBigInt: safeAmountInBigInt.toString(),
        userPosition,
      });

      const result = await readContract(config, {
        address: helperAddress,
        abi: helperAbi,
        functionName: "getExchangeRate",
        args: [
          fromTokenAddress,
          toTokenAddress,
          safeAmountInBigInt,
          userPosition as `0x${string}`,
        ],
      });

      console.log("✅ Exchange Rate Result:", result?.toString());
      return result as bigint;
    },
    enabled:
      canCalculateRate && Number.isInteger(safeAmountIn) && safeAmountIn > 0,
    refetchInterval: 5000,
    staleTime: 3000,
  });

  // Parse exchange rate
  const parsedExchangeRate =
    !exchangeRateError && exchangeRate && safeAmountIn > 0
      ? Number(exchangeRate) /
        Math.pow(10, toTokenDecimals) /
        (safeAmountIn / Math.pow(10, fromTokenDecimals))
      : 0;

  console.log("📊 Exchange Rate Debug:", {
    exchangeRate: exchangeRate?.toString(),
    parsedExchangeRate,
    exchangeRateLoading,
    exchangeRateError: exchangeRateError?.toString(),
    canCalculateRate,
    enabled:
      canCalculateRate && Number.isInteger(safeAmountIn) && safeAmountIn > 0,
  });

  return {
    exchangeRate: exchangeRateError ? BigInt(0) : exchangeRate || BigInt(0),
    exchangeRateLoading: exchangeRateLoading || userPositionLoading,
    parsedExchangeRate,
    exchangeRateError: exchangeRateError || userPositionError,
    refetchExchangeRate,
  };
};
