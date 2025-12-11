"use client";
import { useReadContract } from "wagmi";
import { erc20Abi } from "viem";

export type HexAddress = `0x${string}`;

interface TokenInfo {
  symbol: string | undefined;
  decimals: number | undefined;
  name: string | undefined;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Hook to fetch token information (symbol, decimals, name) from an ERC20 contract
 * @param tokenAddress - The address of the ERC20 token
 * @returns TokenInfo object with symbol, decimals, name, and loading states
 */
export function useTokenInfo(tokenAddress?: HexAddress): TokenInfo {
  const { data: symbol, isLoading: isLoadingSymbol } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "symbol",
    query: {
      enabled: !!tokenAddress,
    },
  });

  const { data: decimals, isLoading: isLoadingDecimals } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "decimals",
    query: {
      enabled: !!tokenAddress,
    },
  });

  const { data: name, isLoading: isLoadingName } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "name",
    query: {
      enabled: !!tokenAddress,
    },
  });

  return {
    symbol: symbol as string | undefined,
    decimals: decimals as number | undefined,
    name: name as string | undefined,
    isLoading: isLoadingSymbol || isLoadingDecimals || isLoadingName,
    isError: !tokenAddress || (!symbol && !decimals && !name),
  };
}

/**
 * Hook to fetch only token decimals from an ERC20 contract
 * @param tokenAddress - The address of the ERC20 token
 * @returns Decimals value and loading state
 */
export function useTokenDecimals(tokenAddress?: HexAddress) {
  const {
    data: decimals,
    isLoading,
    isError,
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "decimals",
    query: {
      enabled: !!tokenAddress,
    },
  });

  return {
    decimals: decimals as number | undefined,
    isLoading,
    isError,
  };
}

/**
 * Hook to fetch token balance for a specific address
 * @param tokenAddress - The address of the ERC20 token
 * @param accountAddress - The address to check balance for
 * @returns Balance as BigInt and loading state
 */
export function useTokenBalance(
  tokenAddress?: HexAddress,
  accountAddress?: HexAddress
) {
  const {
    data: balance,
    isLoading,
    isError,
    refetch,
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: accountAddress ? [accountAddress] : undefined,
    query: {
      enabled: !!tokenAddress && !!accountAddress,
    },
  });

  return {
    balance: balance as bigint | undefined,
    isLoading,
    isError,
    refetch,
  };
}
