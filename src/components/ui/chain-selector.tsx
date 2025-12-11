"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SUPPORTED_CHAINS, type ChainConfig } from "@/lib/config/chains";

interface ChainSelectorProps {
  selectedChain: ChainConfig;
  onChainChange: (chain: ChainConfig) => void;
}

export const ChainSelector = ({
  selectedChain,
  onChainChange,
}: ChainSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const chains = Object.values(SUPPORTED_CHAINS);

  return (
    <div className="relative">
      <label className="mb-1.5 block text-xs text-neutral-400">
        Destination Chain
      </label>

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between border border-neutral-800 bg-neutral-900 px-3 text-sm text-white hover:bg-neutral-800 focus:outline-none focus:ring-1 focus:ring-pink-500"
      >
        <div className="flex items-center gap-2">
          {selectedChain.logo && (
            <Image
              src={selectedChain.logo}
              alt={selectedChain.name}
              width={20}
              height={20}
              className="h-5 w-5 rounded-full"
            />
          )}
          <span>{selectedChain.name}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-neutral-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute left-0 right-0 top-full z-20 mt-1 border border-neutral-800 bg-neutral-900 shadow-lg">
            {chains.map((chain) => (
              <button
                key={chain.id}
                type="button"
                onClick={() => {
                  onChainChange(chain);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-neutral-800 ${
                  selectedChain.id === chain.id
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-300"
                }`}
              >
                {chain.logo && (
                  <Image
                    src={chain.logo}
                    alt={chain.name}
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-full"
                  />
                )}
                <span className="flex-1 text-left">{chain.name}</span>
                {selectedChain.id === chain.id && (
                  <span className="text-xs text-pink-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
