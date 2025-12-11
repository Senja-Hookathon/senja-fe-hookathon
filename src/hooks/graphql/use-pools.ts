import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { graphClient } from "@/lib/graphql/client";
import { queryPools } from "@/lib/graphql/pool.query";
import { getTokenByAddress, type Token } from "../../../public/tokens";

interface RawPool {
  id: string;
  pool: string;
  collateralToken: string;
  borrowToken: string;
  ltv: string;
}

export interface PoolWithTokens extends RawPool {
  collateral: Token & { address: string };
  borrow: Token & { address: string };
}

const fetchPools = async (): Promise<PoolWithTokens[]> => {
  const query = queryPools();

  console.log("🔍 Fetching pools from GraphQL...");
  console.log("GraphQL Endpoint:", process.env.NEXT_PUBLIC_POOL_API);
  console.log("Query:", query);

  try {
    const data = await graphClient.request<{ poolCreatedEvents: RawPool[] }>(
      query
    );

    console.log("✅ GraphQL Response:", data);
    console.log("Pools count:", data.poolCreatedEvents?.length || 0);

    const pools = data.poolCreatedEvents || [];

    const mappedPools = pools
      .map((pool: RawPool) => {
        console.log("Processing pool:", pool);
        const collateral = getTokenByAddress(pool.collateralToken);
        const borrow = getTokenByAddress(pool.borrowToken);

        console.log("Collateral token:", collateral);
        console.log("Borrow token:", borrow);

        if (!collateral || !borrow) {
          console.warn("⚠️ Skipping pool - token not found:", {
            poolAddress: pool.pool,
            collateralAddress: pool.collateralToken,
            borrowAddress: pool.borrowToken,
          });
          return null;
        }

        return {
          ...pool,
          collateral,
          borrow,
        };
      })
      .filter((p: PoolWithTokens | null): p is PoolWithTokens => p !== null);

    console.log("✅ Mapped pools:", mappedPools);
    return mappedPools;
  } catch (error) {
    console.error("❌ GraphQL Error:", error);
    throw error;
  }
};

type PoolsQueryResult = UseQueryResult<PoolWithTokens[], Error>;

export const usePools = () => {
  return useQuery<PoolWithTokens[], Error>({
    queryKey: ["pools"],
    queryFn: async () => {
      try {
        console.log("🔄 usePools: Starting fetch...");
        const result = await fetchPools();
        console.log("✅ usePools: Fetch complete, pools:", result);
        return result;
      } catch (err) {
        console.error("❌ usePools: Failed to fetch pools", err);
        throw err as Error;
      }
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
};

type PoolByAddressResult = Omit<PoolsQueryResult, "data"> & {
  data: PoolWithTokens | null;
};

export const usePoolByAddress = (
  poolAddress: string | undefined | null
): PoolByAddressResult => {
  const poolsQuery = usePools();
  const { data: pools, ...rest } = poolsQuery;

  const normalized = poolAddress?.toLowerCase();
  const pool =
    normalized && pools
      ? pools.find((p) => p.pool.toLowerCase() === normalized) ?? null
      : null;

  return {
    ...rest,
    data: pool,
  };
};
