import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { graphClient } from "@/lib/graphql/client";
import { queryTransactionHistory } from "@/lib/graphql/transaction-history.query";
import { getTokenByAddress } from "../../../public/tokens";

// Raw event interfaces from GraphQL
interface RawUser {
  id: string;
  address: string;
}

interface RawPool {
  id: string;
  address: string;
  collateralToken: string;
  borrowToken: string;
}

interface BaseEvent {
  id: string;
  user: RawUser;
  pool: RawPool;
  timestamp: string;
  blockNumber: string;
  transactionHash: string;
}

interface RawLiquiditySuppliedEvent extends BaseEvent {
  amount: string;
  shares: string;
}

interface RawLiquidityWithdrawnEvent extends BaseEvent {
  amount: string;
  shares: string;
}

interface RawDebtBorrowedEvent extends BaseEvent {
  amount: string;
  shares: string;
}

interface RawDebtRepaidEvent extends BaseEvent {
  amount: string;
  shares: string;
}

interface RawCollateralSuppliedEvent extends BaseEvent {
  position: string;
  amount: string;
}

interface RawCollateralWithdrawnEvent extends BaseEvent {
  amount: string;
}

interface RawTokenSwappedEvent extends BaseEvent {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
}

interface GraphQLResponse {
  liquiditySuppliedEvents: RawLiquiditySuppliedEvent[];
  liquidityWithdrawnEvents: RawLiquidityWithdrawnEvent[];
  debtBorrowedEvents: RawDebtBorrowedEvent[];
  debtRepaidEvents: RawDebtRepaidEvent[];
  collateralSuppliedEvents: RawCollateralSuppliedEvent[];
  collateralWithdrawnEvents: RawCollateralWithdrawnEvent[];
  tokenSwappedEvents: RawTokenSwappedEvent[];
}

// Transaction type enum
export type TransactionType =
  | "supply_liquidity"
  | "withdraw_liquidity"
  | "borrow"
  | "repay"
  | "supply_collateral"
  | "withdraw_collateral"
  | "swap";

// Unified transaction interface
export interface Transaction {
  id: string;
  type: TransactionType;
  userAddress: string;
  poolAddress: string;
  collateralToken: {
    address: string;
    symbol: string;
    name: string;
  };
  borrowToken: {
    address: string;
    symbol: string;
    name: string;
  };
  amount: string;
  amountFormatted?: string;
  shares?: string;
  tokenIn?: {
    address: string;
    symbol: string;
    name: string;
  };
  tokenOut?: {
    address: string;
    symbol: string;
    name: string;
  };
  amountIn?: string;
  amountOut?: string;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
}

const formatTransactionType = (type: TransactionType): string => {
  const typeMap: Record<TransactionType, string> = {
    supply_liquidity: "Supply Liquidity",
    withdraw_liquidity: "Withdraw Liquidity",
    borrow: "Borrow",
    repay: "Repay",
    supply_collateral: "Supply Collateral",
    withdraw_collateral: "Withdraw Collateral",
    swap: "Swap",
  };
  return typeMap[type];
};

const fetchTransactionHistory = async (
  userAddress?: string
): Promise<Transaction[]> => {
  const query = queryTransactionHistory(userAddress);

  try {
    const data = await graphClient.request<GraphQLResponse>(query);

    const transactions: Transaction[] = [];

    // Process Liquidity Supplied Events
    data.liquiditySuppliedEvents?.forEach((event) => {
      const collateralToken = getTokenByAddress(event.pool.collateralToken);
      const borrowToken = getTokenByAddress(event.pool.borrowToken);

      if (collateralToken && borrowToken) {
        transactions.push({
          id: event.id,
          type: "supply_liquidity",
          userAddress: event.user.address,
          poolAddress: event.pool.address,
          collateralToken: {
            address: event.pool.collateralToken,
            symbol: collateralToken.symbol,
            name: collateralToken.name,
          },
          borrowToken: {
            address: event.pool.borrowToken,
            symbol: borrowToken.symbol,
            name: borrowToken.name,
          },
          amount: event.amount,
          shares: event.shares,
          timestamp: parseInt(event.timestamp),
          blockNumber: parseInt(event.blockNumber),
          transactionHash: event.transactionHash,
        });
      }
    });

    // Process Liquidity Withdrawn Events
    data.liquidityWithdrawnEvents?.forEach((event) => {
      const collateralToken = getTokenByAddress(event.pool.collateralToken);
      const borrowToken = getTokenByAddress(event.pool.borrowToken);

      if (collateralToken && borrowToken) {
        transactions.push({
          id: event.id,
          type: "withdraw_liquidity",
          userAddress: event.user.address,
          poolAddress: event.pool.address,
          collateralToken: {
            address: event.pool.collateralToken,
            symbol: collateralToken.symbol,
            name: collateralToken.name,
          },
          borrowToken: {
            address: event.pool.borrowToken,
            symbol: borrowToken.symbol,
            name: borrowToken.name,
          },
          amount: event.amount,
          shares: event.shares,
          timestamp: parseInt(event.timestamp),
          blockNumber: parseInt(event.blockNumber),
          transactionHash: event.transactionHash,
        });
      }
    });

    // Process Debt Borrowed Events
    data.debtBorrowedEvents?.forEach((event) => {
      const collateralToken = getTokenByAddress(event.pool.collateralToken);
      const borrowToken = getTokenByAddress(event.pool.borrowToken);

      if (collateralToken && borrowToken) {
        transactions.push({
          id: event.id,
          type: "borrow",
          userAddress: event.user.address,
          poolAddress: event.pool.address,
          collateralToken: {
            address: event.pool.collateralToken,
            symbol: collateralToken.symbol,
            name: collateralToken.name,
          },
          borrowToken: {
            address: event.pool.borrowToken,
            symbol: borrowToken.symbol,
            name: borrowToken.name,
          },
          amount: event.amount,
          shares: event.shares,
          timestamp: parseInt(event.timestamp),
          blockNumber: parseInt(event.blockNumber),
          transactionHash: event.transactionHash,
        });
      }
    });

    // Process Debt Repaid Events
    data.debtRepaidEvents?.forEach((event) => {
      const collateralToken = getTokenByAddress(event.pool.collateralToken);
      const borrowToken = getTokenByAddress(event.pool.borrowToken);

      if (collateralToken && borrowToken) {
        transactions.push({
          id: event.id,
          type: "repay",
          userAddress: event.user.address,
          poolAddress: event.pool.address,
          collateralToken: {
            address: event.pool.collateralToken,
            symbol: collateralToken.symbol,
            name: collateralToken.name,
          },
          borrowToken: {
            address: event.pool.borrowToken,
            symbol: borrowToken.symbol,
            name: borrowToken.name,
          },
          amount: event.amount,
          shares: event.shares,
          timestamp: parseInt(event.timestamp),
          blockNumber: parseInt(event.blockNumber),
          transactionHash: event.transactionHash,
        });
      }
    });

    // Process Collateral Supplied Events
    data.collateralSuppliedEvents?.forEach((event) => {
      const collateralToken = getTokenByAddress(event.pool.collateralToken);
      const borrowToken = getTokenByAddress(event.pool.borrowToken);

      if (collateralToken && borrowToken) {
        transactions.push({
          id: event.id,
          type: "supply_collateral",
          userAddress: event.user.address,
          poolAddress: event.pool.address,
          collateralToken: {
            address: event.pool.collateralToken,
            symbol: collateralToken.symbol,
            name: collateralToken.name,
          },
          borrowToken: {
            address: event.pool.borrowToken,
            symbol: borrowToken.symbol,
            name: borrowToken.name,
          },
          amount: event.amount,
          timestamp: parseInt(event.timestamp),
          blockNumber: parseInt(event.blockNumber),
          transactionHash: event.transactionHash,
        });
      }
    });

    // Process Collateral Withdrawn Events
    data.collateralWithdrawnEvents?.forEach((event) => {
      const collateralToken = getTokenByAddress(event.pool.collateralToken);
      const borrowToken = getTokenByAddress(event.pool.borrowToken);

      if (collateralToken && borrowToken) {
        transactions.push({
          id: event.id,
          type: "withdraw_collateral",
          userAddress: event.user.address,
          poolAddress: event.pool.address,
          collateralToken: {
            address: event.pool.collateralToken,
            symbol: collateralToken.symbol,
            name: collateralToken.name,
          },
          borrowToken: {
            address: event.pool.borrowToken,
            symbol: borrowToken.symbol,
            name: borrowToken.name,
          },
          amount: event.amount,
          timestamp: parseInt(event.timestamp),
          blockNumber: parseInt(event.blockNumber),
          transactionHash: event.transactionHash,
        });
      }
    });

    // Process Token Swapped Events
    data.tokenSwappedEvents?.forEach((event) => {
      const collateralToken = getTokenByAddress(event.pool.collateralToken);
      const borrowToken = getTokenByAddress(event.pool.borrowToken);
      const tokenIn = getTokenByAddress(event.tokenIn);
      const tokenOut = getTokenByAddress(event.tokenOut);

      if (collateralToken && borrowToken && tokenIn && tokenOut) {
        transactions.push({
          id: event.id,
          type: "swap",
          userAddress: event.user.address,
          poolAddress: event.pool.address,
          collateralToken: {
            address: event.pool.collateralToken,
            symbol: collateralToken.symbol,
            name: collateralToken.name,
          },
          borrowToken: {
            address: event.pool.borrowToken,
            symbol: borrowToken.symbol,
            name: borrowToken.name,
          },
          amount: event.amountIn,
          tokenIn: {
            address: event.tokenIn,
            symbol: tokenIn.symbol,
            name: tokenIn.name,
          },
          tokenOut: {
            address: event.tokenOut,
            symbol: tokenOut.symbol,
            name: tokenOut.name,
          },
          amountIn: event.amountIn,
          amountOut: event.amountOut,
          timestamp: parseInt(event.timestamp),
          blockNumber: parseInt(event.blockNumber),
          transactionHash: event.transactionHash,
        });
      }
    });

    // Sort by timestamp descending (newest first)
    transactions.sort((a, b) => b.timestamp - a.timestamp);

    return transactions;
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    throw error;
  }
};

type TransactionHistoryQueryResult = UseQueryResult<Transaction[], Error>;

export const useTransactionHistory = (
  userAddress?: string,
  enabled: boolean = true
): TransactionHistoryQueryResult => {
  return useQuery<Transaction[], Error>({
    queryKey: ["transactionHistory", userAddress],
    queryFn: () => fetchTransactionHistory(userAddress),
    staleTime: 30_000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
    enabled,
  });
};

export { formatTransactionType };
