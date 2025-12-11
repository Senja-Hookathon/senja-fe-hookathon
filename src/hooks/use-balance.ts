import { useBalance } from "wagmi";
import { type Address } from "viem";

export const useNativeBalance = (address?: Address) => {
  const { data, isError, isLoading, refetch } = useBalance({
    address,
  });

  return {
    balance: data?.value,
    symbol: data?.symbol,
    decimals: data?.decimals,
    isLoading,
    isError,
    refetch,
  };
};

export default useNativeBalance;
