"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatCompactNumber } from "@/lib/format/pool";
import type { PoolWithTokens } from "@/hooks/graphql/use-pools";
import { usePoolLiquidityByAddress } from "@/hooks/graphql/use-pools-liquidity";

interface PoolRowProps {
  pool: PoolWithTokens;
  index: number;
}

export const PoolRow = ({ pool }: PoolRowProps) => {
  const router = useRouter();

  // Fetch real liquidity data for this pool
  const { data: liquidityData } = usePoolLiquidityByAddress(pool.pool);

  // Format LTV from 1e18 (e.g., 800000000000000000 = 80%)
  const formatLtv = (ltvRaw: string): string => {
    const ltv = (parseFloat(ltvRaw) / 1e18) * 100;
    return `${ltv.toFixed(0)}%`;
  };

  // Format liquidity with borrow token decimals
  const formatLiquidity = (value: string, decimals: number): number => {
    const valueBigInt = BigInt(value || "0");
    return Number(valueBigInt) / Math.pow(10, decimals);
  };

  // Format APY from 1e2 (e.g., 450 = 4.50%)
  const formatApy = (apyRaw: string): string => {
    const apy = parseFloat(apyRaw || "0") / 100;
    return apy.toFixed(2);
  };

  const borrowDecimals = pool.borrow.decimals;
  const totalLiquidity = liquidityData
    ? formatLiquidity(liquidityData.supplyAssets, borrowDecimals)
    : 0;
  const totalBorrow = liquidityData
    ? formatLiquidity(liquidityData.borrowAssets, borrowDecimals)
    : 0;
  const supplyApy = liquidityData ? formatApy(liquidityData.supplyAPY) : "0.00";
  const borrowApy = liquidityData ? formatApy(liquidityData.borrowAPY) : "0.00";

  return (
    <tr
      className="cursor-pointer bg-neutral-950/40 transition-colors hover:bg-neutral-900/70"
      onClick={() => router.push(`/dashboard/${pool.pool}`)}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-12">
            <div className="absolute left-0 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border border-neutral-900 bg-neutral-950">
              <Image
                src={pool.collateral.logoUrl}
                alt={pool.collateral.symbol}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
              />
            </div>
            <div className="absolute right-0 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border border-neutral-900 bg-neutral-950">
              <Image
                src={pool.borrow.logoUrl}
                alt={pool.borrow.symbol}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-neutral-50">
              {pool.collateral.symbol} / {pool.borrow.symbol}
            </span>
            <span className="text-[11px] text-neutral-500">
              {pool.pool.slice(0, 6)}...
              {pool.pool.slice(-4)}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right text-neutral-100">
        ${formatCompactNumber(totalLiquidity)}
      </td>
      <td className="px-4 py-3 text-right text-emerald-400">{supplyApy}%</td>
      <td className="px-4 py-3 text-right text-neutral-100">
        ${formatCompactNumber(totalBorrow)}
      </td>
      <td className="px-4 py-3 text-right text-sky-400">{borrowApy}%</td>
      <td className="px-4 py-3 text-right text-neutral-200">
        {formatLtv(pool.ltv)}
      </td>
    </tr>
  );
};
