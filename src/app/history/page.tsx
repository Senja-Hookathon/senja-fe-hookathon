"use client";

import { useConnection } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { TransactionHistoryTable } from "@/components/history/transaction-history-table";
import { useTransactionHistory } from "@/hooks/graphql/use-transaction-history";
import { Spinner } from "@/components/ui/spinner";
import { PageContainer } from "@/components/layout/page-container";

export default function HistoryPage() {
  const { address, isConnected } = useConnection();
  const { openConnectModal } = useConnectModal();

  const {
    data: transactions,
    isLoading,
    error,
  } = useTransactionHistory(address, isConnected);

  if (!isConnected) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-neutral-50">
              Connect Your Wallet
            </h2>
            <p className="text-neutral-400 max-w-md">
              Please connect your wallet to view transaction history
            </p>
          </div>
          <Button
            size="lg"
            onClick={openConnectModal}
            className="h-12 px-8"
          >
            Connect Wallet
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-50">
            Transaction History
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            View all your protocol interactions
          </p>
        </div>

        {/* Stats Cards */}
        {transactions && transactions.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-neutral-950/80 border border-neutral-800 p-4">
              <div className="text-xs text-neutral-400 mb-1">
                Total Transactions
              </div>
              <div className="text-2xl font-bold text-neutral-50">
                {transactions.length}
              </div>
            </div>
            <div className="bg-neutral-950/80 border border-neutral-800 p-4">
              <div className="text-xs text-neutral-400 mb-1">Supplies</div>
              <div className="text-2xl font-bold text-emerald-400">
                {
                  transactions.filter(
                    (tx) =>
                      tx.type === "supply_liquidity" ||
                      tx.type === "supply_collateral"
                  ).length
                }
              </div>
            </div>
            <div className="bg-neutral-950/80 border border-neutral-800 p-4">
              <div className="text-xs text-neutral-400 mb-1">Borrows</div>
              <div className="text-2xl font-bold text-blue-400">
                {transactions.filter((tx) => tx.type === "borrow").length}
              </div>
            </div>
            <div className="bg-neutral-950/80 border border-neutral-800 p-4">
              <div className="text-xs text-neutral-400 mb-1">Swaps</div>
              <div className="text-2xl font-bold text-amber-400">
                {transactions.filter((tx) => tx.type === "swap").length}
              </div>
            </div>
          </div>
        )}

        {/* Transaction Table */}
        <div className="border border-neutral-800 bg-neutral-950/80 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner label="Loading transactions..." />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-red-400">
                  Failed to Load Transactions
                </h3>
                <p className="text-sm text-neutral-400 max-w-md">
                  {error.message ||
                    "An error occurred while loading your transaction history"}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <TransactionHistoryTable transactions={transactions || []} />
            </div>
          )}
        </div>

        {/* Footer Info */}
        {transactions && transactions.length > 0 && (
          <div className="text-center text-xs text-neutral-500">
            Showing {transactions.length} transaction
            {transactions.length !== 1 ? "s" : ""} for your wallet
          </div>
        )}
      </div>
    </PageContainer>
  );
}
