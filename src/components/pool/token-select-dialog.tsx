"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TokenConfig } from "@/lib/addresses/types";

interface TokenSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokens: TokenConfig[];
  onSelect: (token: TokenConfig) => void;
  excludeAddress?: string;
  title?: string;
}

export const TokenSelectDialog = ({
  open,
  onOpenChange,
  tokens,
  onSelect,
  excludeAddress,
  title = "Select Token",
}: TokenSelectDialogProps) => {
  const [search, setSearch] = useState("");

  const filteredTokens = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tokens.filter((token) => {
      if (excludeAddress && token.address.toLowerCase() === excludeAddress.toLowerCase()) {
        return false;
      }
      if (!q) return true;
      return (
        token.symbol.toLowerCase().includes(q) ||
        token.name.toLowerCase().includes(q) ||
        token.address.toLowerCase().includes(q)
      );
    });
  }, [search, excludeAddress, tokens]);

  const handleSelect = (token: TokenConfig) => {
    onSelect(token);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-neutral-800 bg-neutral-950 p-0 text-neutral-50 sm:max-w-md">
        <DialogHeader className="border-b border-neutral-800 px-6 py-4">
          <DialogTitle className="text-lg font-semibold text-neutral-50">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or symbol..."
              className="h-10 w-full rounded-none border border-neutral-800 bg-neutral-900 pl-10 pr-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-neutral-700"
            />
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {filteredTokens.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-neutral-500">
              No tokens found
            </div>
          ) : (
            <div className="space-y-1 px-3 pb-3">
              {filteredTokens.map((token) => (
                <button
                  key={token.address}
                  type="button"
                  onClick={() => handleSelect(token)}
                  className="flex w-full items-center gap-3 rounded-none px-3 py-3 text-left transition-colors hover:bg-neutral-900/70"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-neutral-800 bg-neutral-900">
                    <Image
                      src={token.logo}
                      alt={token.symbol}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <span className="text-sm font-semibold text-neutral-100">
                      {token.symbol}
                    </span>
                    <span className="truncate text-xs text-neutral-400">
                      {token.name}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-xs text-neutral-500">
                      {token.address.slice(0, 6)}...{token.address.slice(-4)}
                    </span>
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
