import { useQuery } from "@tanstack/react-query";
import {
  usePoolsComplete,
  type PoolComplete,
} from "@/hooks/graphql/use-pools-complete";

export const useSwapPools = (manualSelection: PoolComplete | null) => {
  const { data: allPools = [] } = usePoolsComplete();

  const selectedPool = useQuery({
    queryKey: ["selectedPool", allPools, manualSelection?.id],
    queryFn: () => {
      if (
        manualSelection &&
        allPools.some((p) => p.id === manualSelection.id)
      ) {
        return manualSelection;
      }
      return allPools.length > 0 ? allPools[0] : null;
    },
    enabled: allPools.length > 0,
    staleTime: 30_000,
  });

  return {
    allPools,
    selectedPool: selectedPool.data ?? null,
    isLoading: selectedPool.isLoading,
  };
};
