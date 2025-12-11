"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import type { PoolComplete } from "@/hooks/graphql/use-pools-complete";

interface PoolSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pools: PoolComplete[];
  onSelect: (pool: PoolComplete) => void;
  title?: string;
}

export const PoolSelectDialog = ({
  open,
  onOpenChange,
  pools,
  onSelect,
  title = "Select Pool",
}: PoolSelectDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPools = pools.filter((pool) => {
    const query = searchQuery.toLowerCase();
    return (
      pool.collateralToken.symbol.toLowerCase().includes(query) ||
      pool.borrowToken.symbol.toLowerCase().includes(query) ||
      pool.id.toLowerCase().includes(query)
    );
  });

  const handleSelect = (pool: PoolComplete) => {
    onSelect(pool);
    onOpenChange(false);
    setSearchQuery("");
  };

  // Format APY from 1e2 (e.g., 450 = 4.50%)
  const formatApy = (apyRaw: string): string => {
    const apy = parseFloat(apyRaw || "0") / 100;
    return apy.toFixed(2);
  };

  // Format LTV from 1e18 (e.g., 800000000000000000 = 0.8 = 80%)
  const formatLtv = (ltvRaw: string): string => {
    const ltv = parseFloat(ltvRaw || "0") / 1e18;
    return (ltv * 100).toFixed(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-none border-border bg-card p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search by token or pool address..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              className="flex h-10 w-full rounded-none border border-border bg-muted/30 px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {filteredPools.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No pools found
            </div>
          ) : (
            <div className="space-y-1 px-3 pb-3">
              {filteredPools.map((pool) => (
                <button
                  key={pool.id}
                  onClick={() => handleSelect(pool)}
                  className="w-full rounded-none border border-transparent p-3 text-left transition-all hover:border-border hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Token Logos */}
                      <div className="flex -space-x-2">
                        <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-card">
                          <Image
                            src={pool.collateralToken.logoUrl}
                            alt={pool.collateralToken.symbol}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-card">
                          <Image
                            src={pool.borrowToken.logoUrl}
                            alt={pool.borrowToken.symbol}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>

                      {/* Pool Info */}
                      <div>
                        <div className="font-semibold">
                          {pool.collateralToken.symbol} /{" "}
                          {pool.borrowToken.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          LTV: {formatLtv(pool.ltv)}% • APY:{" "}
                          {formatApy(pool.supplyAPY)}%
                        </div>
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <div className="text-muted-foreground">→</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
