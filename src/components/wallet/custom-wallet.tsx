"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useNativeBalance } from "@/hooks/use-balance";
import { formatUnits } from "viem";
import { useConnection } from "wagmi";

export const WalletButton = () => {
  const { address } = useConnection();
  const { balance, symbol, decimals } = useNativeBalance(address);
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="px-6 py-2.5 bg-(--pink-primary) hover:bg-(--pink-hover) text-white font-medium border-2 border-(--black) dark:border-(--white) transition-all duration-200"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium border-2 border-(--black) dark:border-(--white) transition-all duration-200"
                  >
                    Wrong Network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  {balance && (
                    <div className="hidden sm:flex items-center px-4 h-[42px] bg-(--black) border-2 border-(--pink-primary)">
                      <span className="text-sm font-bold text-white tracking-wide">
                        {decimals
                          ? parseFloat(formatUnits(balance, decimals)).toFixed(
                              4
                            )
                          : "0.0000"}{" "}
                        {symbol || "AVAX"}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={openChainModal}
                    type="button"
                    className="hidden sm:flex items-center gap-2 px-4 h-[42px] bg-(--black) hover:bg-(--gray-dark) border-2 border-(--pink-primary) transition-all duration-200"
                  >
                    {chain.hasIcon && (
                      <div
                        className="w-5 h-5 overflow-hidden flex items-center justify-center border border-(--pink-primary)"
                        style={{ background: chain.iconBackground }}
                      >
                        {chain.iconUrl && (
                          <Image
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            width={16}
                            height={16}
                          />
                        )}
                      </div>
                    )}
                    <span className="text-sm font-bold text-white tracking-wide">
                      {chain.name}
                    </span>
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="px-3 sm:px-4 h-[42px] flex items-center bg-(--black) hover:bg-(--gray-dark) text-white font-bold tracking-wide border-2 border-(--pink-primary) transition-all duration-200 text-sm"
                  >
                    <span className="hidden sm:inline">
                      {account.displayName}
                    </span>
                    <span className="sm:hidden">
                      {account.displayName.slice(0, 6)}
                    </span>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
