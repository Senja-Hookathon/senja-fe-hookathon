import { useReadContract } from "wagmi";
import { type Address, erc20Abi } from "viem";

interface UseTokenBalanceProps {
  tokenAddress?: Address;
  ownerAddress?: Address;
}

export const useTokenBalance = ({
  tokenAddress,
  ownerAddress,
}: UseTokenBalanceProps) => {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: ownerAddress ? [ownerAddress] : undefined,
    query: {
      enabled: !!tokenAddress && !!ownerAddress,
    },
  });

  return {
    balance: data,
    isLoading,
    isError,
    refetch,
  };
};
