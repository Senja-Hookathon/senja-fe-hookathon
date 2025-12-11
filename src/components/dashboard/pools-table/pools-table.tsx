"use client";

import { useMemo, useState } from "react";
import { CreatePoolButton } from "@/components/pool/create-pool-dialog";
import { usePools } from "@/hooks/graphql/use-pools";
import { PoolRow } from "./pool-row";

export const PoolsTable = () => {
  const { data, isLoading, isError, error } = usePools();
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!data) return [];
    if (!q) return data;

    return data.filter((pool) => {
      const pair =
        `${pool.collateral.symbol}/${pool.borrow.symbol}`.toLowerCase();
      const address = pool.pool.toLowerCase();
      return pair.includes(q) || address.includes(q);
    });
  }, [data, search]);

  if (isLoading) {
    return (
      <div className="mt-8 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by pair or address..."
              className="h-9 w-full max-w-xs rounded-none border border-neutral-700 bg-neutral-950 px-3 text-xs text-neutral-100 outline-none placeholder:text-neutral-600"
            />
          </div>
          <CreatePoolButton />
        </div>
        <div className="border border-neutral-800 bg-neutral-950 p-6 text-sm text-neutral-400">
          Loading pools...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-8 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by pair or address..."
              className="h-9 w-full max-w-xs rounded-none border border-neutral-700 bg-neutral-950 px-3 text-xs text-neutral-100 outline-none placeholder:text-neutral-600"
            />
          </div>
          <CreatePoolButton />
        </div>
        <div className="space-y-2 border border-red-800/60 bg-red-950/40 p-6 text-sm text-red-300">
          <div>
            Failed to load pools. Please check your NEXT_PUBLIC_POOL_API
            configuration.
          </div>
          {error && (
            <pre className="max-w-full overflow-x-auto whitespace-pre-wrap wrap-break-word text-[11px] text-red-200/80">
              {error.message}
            </pre>
          )}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="mt-8 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by pair or address..."
              className="h-9 w-full max-w-xs rounded-none border border-neutral-700 bg-neutral-950 px-3 text-xs text-neutral-100 outline-none placeholder:text-neutral-600"
            />
          </div>
          <CreatePoolButton />
        </div>
        <div className="border border-neutral-800 bg-neutral-950 p-6 text-sm text-neutral-400">
          No pools available.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by pair or address..."
            className="h-9 w-full max-w-xs rounded-none border border-neutral-700 bg-neutral-950 px-3 text-xs text-neutral-100 outline-none placeholder:text-neutral-600"
          />
        </div>
        <CreatePoolButton />
      </div>

      <div className="overflow-hidden border border-neutral-800 bg-neutral-950/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-900/80 text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Pool</th>
                <th className="px-4 py-3 text-right font-medium">
                  Total Liquidity
                </th>
                <th className="px-4 py-3 text-right font-medium">APY</th>
                <th className="px-4 py-3 text-right font-medium">
                  Total Borrow
                </th>
                <th className="px-4 py-3 text-right font-medium">Interest Rate</th>
                <th className="px-4 py-3 text-right font-medium">LTV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {filteredData.map((pool, index) => (
                <PoolRow key={pool.id} pool={pool} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
