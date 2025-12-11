import { useQuery } from "@tanstack/react-query";
import { graphClient } from "@/lib/graphql/client";
import { gql } from "graphql-request";

interface PoolLiquidityData {
  id: string;
  borrowAPY: string;
  supplyAPY: string;
  borrowAssets: string;
  supplyAssets: string;
}

const queryPoolsLiquidity = () => {
  return gql`
    {
      pools {
        id
        borrowAPY
        supplyAPY
        borrowAssets
        supplyAssets
      }
    }
  `;
};

const fetchPoolsLiquidity = async (): Promise<PoolLiquidityData[]> => {
  try {
    const data = await graphClient.request<{ pools: PoolLiquidityData[] }>(
      queryPoolsLiquidity()
    );
    return data.pools || [];
  } catch (error) {
    console.error("❌ Failed to fetch pools liquidity:", error);
    throw error;
  }
};

export const usePoolsLiquidity = () => {
  return useQuery<PoolLiquidityData[], Error>({
    queryKey: ["poolsLiquidity"],
    queryFn: fetchPoolsLiquidity,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
};

export const usePoolLiquidityByAddress = (poolAddress: string | undefined) => {
  const { data: pools, ...rest } = usePoolsLiquidity();

  const normalized = poolAddress?.toLowerCase();
  const pool =
    normalized && pools
      ? pools.find((p) => p.id.toLowerCase() === normalized) ?? null
      : null;

  return {
    ...rest,
    data: pool,
  };
};
