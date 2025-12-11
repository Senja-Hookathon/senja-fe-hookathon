"use client";
import Image from "next/image";
import { useParams } from "next/navigation";
import CardSupply from "@/components/card/supply-card";
import { usePoolByAddress } from "@/hooks/graphql/use-pools";
import { formatCompactNumber } from "@/lib/format/pool";
import { PageContainer } from "@/components/layout/page-container";
import { getToken, Network } from "@/lib/addresses";
import { TokenSymbol } from "@/lib/addresses/types";
import { usePoolLiquidityByAddress } from "@/hooks/graphql/use-pools-liquidity";

export const PoolPage = () => {
  const params = useParams<{ poolAddress: string }>();
  const poolAddress = params.poolAddress;

  const { data: pool, isLoading, isError } = usePoolByAddress(poolAddress);
  const { data: liquidityData } = usePoolLiquidityByAddress(poolAddress);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-300 lg:px-8">
        Loading pool...
      </div>
    );
  }

  if (isError || !pool) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-red-300 lg:px-8">
        Pool not found.
      </div>
    );
  }

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

  // Format LTV from 1e18
  const formatLtv = (ltvRaw: string): string => {
    const ltv = (parseFloat(ltvRaw) / 1e18) * 100;
    return `${ltv.toFixed(0)}%`;
  };

  const borrowDecimals = pool.borrow.decimals;
  const totalLiquidity = liquidityData
    ? formatLiquidity(liquidityData.supplyAssets, borrowDecimals)
    : 0;
  const totalBorrow = liquidityData
    ? formatLiquidity(liquidityData.borrowAssets, borrowDecimals)
    : 0;
  const supplyApy = liquidityData
    ? parseFloat(formatApy(liquidityData.supplyAPY))
    : 0;
  const borrowApy = liquidityData
    ? parseFloat(formatApy(liquidityData.borrowAPY))
    : 0;

  return (
    <PageContainer>
      <div className="flex flex-col gap-8 lg:flex-row">
        <section className="flex-1 space-y-8">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-16">
                <div className="absolute left-0 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full border border-neutral-800 bg-neutral-950">
                  <Image
                    src={pool.collateral.logoUrl}
                    alt={pool.collateral.symbol}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full"
                  />
                </div>
                <div className="absolute right-0 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full border border-neutral-800 bg-neutral-950">
                  <Image
                    src={pool.borrow.logoUrl}
                    alt={pool.borrow.symbol}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <h1 className="text-xl font-semibold text-neutral-50">
                  {pool.collateral.symbol} / {pool.borrow.symbol}
                </h1>
                <p className="text-xs text-neutral-500">
                  Pool address: {pool.pool}
                </p>
              </div>
            </div>
          </header>

          <div className="grid gap-4 border border-neutral-800 bg-neutral-950/80 p-4 text-sm text-neutral-200 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-xs text-neutral-500">Total Liquidity</div>
              <div className="mt-1 text-base font-semibold text-neutral-50">
                ${formatCompactNumber(totalLiquidity)}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Total Borrow</div>
              <div className="mt-1 text-base font-semibold text-neutral-50">
                ${formatCompactNumber(totalBorrow)}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Supply APY</div>
              <div className="mt-1 text-base font-semibold text-emerald-400">
                {supplyApy.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Interest Rate</div>
              <div className="mt-1 text-base font-semibold text-sky-400">
                {borrowApy.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="space-y-4 border border-neutral-800 bg-neutral-950/80 p-4 text-sm text-neutral-300">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">LTV</span>
              <span className="font-medium text-neutral-50">
                {formatLtv(pool.ltv)}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-neutral-500">
            Loan-to-Value (LTV) represents how much you can borrow based on your collateral value. When your LTV gets close to the limit, your position becomes at risk of liquidation.
            </p>
          </div>
        </section>

        <aside className="w-full shrink-0 lg:w-104">
          <div className="sticky top-24">
            <CardSupply
              poolAddress={pool.pool}
              ltv={pool.ltv}
              collateralSymbol={pool.collateral.symbol}
              borrowSymbol={pool.borrow.symbol}
              collateralLogoUrl={pool.collateral.logoUrl}
              borrowLogoUrl={pool.borrow.logoUrl}
              collateralTokenAddress={pool.collateral.address}
              borrowTokenAddress={pool.borrow.address}
              collateralDecimals={pool.collateral.decimals}
              borrowDecimals={pool.borrow.decimals}
              borrowOftAddress={
                getToken(Network.Avalanche, pool.borrow.symbol as TokenSymbol)
                  ?.oftAddress
              }
            />
          </div>
        </aside>
      </div>
    </PageContainer>
  );
};
