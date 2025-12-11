import { useQuery } from "@tanstack/react-query";
import { graphClient } from "@/lib/graphql/client";
import { gql } from "graphql-request";
import { getTokenByAddress, type Token } from "../../../public/tokens";

interface RawPoolCreated {
  id: string;
  pool: string;
  collateralToken: string;
  borrowToken: string;
  ltv: string;
}

interface RawPoolLiquidity {
  id: string;
  borrowAPY: string;
  supplyAPY: string;
  borrowAssets: string;
  supplyAssets: string;
}

export interface PoolComplete {
  id: string;
  pool: string;
  collateralToken: Token & { address: string };
  borrowToken: Token & { address: string };
  ltv: string;
  borrowAPY: string;
  supplyAPY: string;
  borrowAssets: string;
  supplyAssets: string;
}

const queryPoolsComplete = () => {
  return gql`
    {
      poolCreatedEvents {
        id
        pool
        collateralToken
        borrowToken
        ltv
      }
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

const fetchPoolsComplete = async (): Promise<PoolComplete[]> => {
  try {
    const data = await graphClient.request<{
      poolCreatedEvents: RawPoolCreated[];
      pools: RawPoolLiquidity[];
    }>(queryPoolsComplete());

    const poolCreatedEvents = data.poolCreatedEvents || [];
    const poolsLiquidity = data.pools || [];

    // Create a map of pool address to liquidity data
    const liquidityMap = new Map(
      poolsLiquidity.map((p) => [p.id.toLowerCase(), p])
    );

    const mappedPools = poolCreatedEvents
      .map((poolEvent) => {
        const collateral = getTokenByAddress(poolEvent.collateralToken);
        const borrow = getTokenByAddress(poolEvent.borrowToken);

        if (!collateral || !borrow) {
          console.warn("⚠️ Skipping pool - token not found:", {
            poolAddress: poolEvent.pool,
            collateralAddress: poolEvent.collateralToken,
            borrowAddress: poolEvent.borrowToken,
          });
          return null;
        }

        // Get liquidity data for this pool
        const liquidity = liquidityMap.get(poolEvent.pool.toLowerCase());

        return {
          id: poolEvent.pool,
          pool: poolEvent.pool,
          collateralToken: {
            ...collateral,
            address: poolEvent.collateralToken,
          },
          borrowToken: {
            ...borrow,
            address: poolEvent.borrowToken,
          },
          ltv: poolEvent.ltv,
          borrowAPY: liquidity?.borrowAPY || "0",
          supplyAPY: liquidity?.supplyAPY || "0",
          borrowAssets: liquidity?.borrowAssets || "0",
          supplyAssets: liquidity?.supplyAssets || "0",
        };
      })
      .filter((p): p is PoolComplete => p !== null);

    console.log("✅ Fetched complete pools:", mappedPools.length);
    return mappedPools;
  } catch (error) {
    console.error("❌ Failed to fetch complete pools:", error);
    throw error;
  }
};

export const usePoolsComplete = () => {
  return useQuery<PoolComplete[], Error>({
    queryKey: ["poolsComplete"],
    queryFn: fetchPoolsComplete,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
};

export const usePoolCompleteByAddress = (poolAddress: string | undefined) => {
  const { data: pools, ...rest } = usePoolsComplete();

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
