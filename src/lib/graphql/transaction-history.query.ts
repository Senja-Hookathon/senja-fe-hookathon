import { gql } from "graphql-request";

export const queryTransactionHistory = (userAddress?: string) => {
  const userFilter = userAddress
    ? `(where: { user: "${userAddress.toLowerCase()}" }, orderBy: timestamp, orderDirection: desc)`
    : `(orderBy: timestamp, orderDirection: desc, first: 100)`;

  return gql`
    {
      liquiditySuppliedEvents${userFilter} {
        id
        user {
          id
          address
        }
        pool {
          id
          address
          collateralToken
          borrowToken
        }
        amount
        shares
        timestamp
        blockNumber
        transactionHash
      }
      liquidityWithdrawnEvents${userFilter} {
        id
        user {
          id
          address
        }
        pool {
          id
          address
          collateralToken
          borrowToken
        }
        amount
        shares
        timestamp
        blockNumber
        transactionHash
      }
      debtBorrowedEvents${userFilter} {
        id
        user {
          id
          address
        }
        pool {
          id
          address
          collateralToken
          borrowToken
        }
        amount
        shares
        timestamp
        blockNumber
        transactionHash
      }
      debtRepaidEvents${userFilter} {
        id
        user {
          id
          address
        }
        pool {
          id
          address
          collateralToken
          borrowToken
        }
        amount
        shares
        timestamp
        blockNumber
        transactionHash
      }
      collateralSuppliedEvents${userFilter} {
        id
        user {
          id
          address
        }
        pool {
          id
          address
          collateralToken
          borrowToken
        }
        position
        amount
        timestamp
        blockNumber
        transactionHash
      }
      collateralWithdrawnEvents${userFilter} {
        id
        user {
          id
          address
        }
        pool {
          id
          address
          collateralToken
          borrowToken
        }
        amount
        timestamp
        blockNumber
        transactionHash
      }
      tokenSwappedEvents${userFilter} {
        id
        user {
          id
          address
        }
        pool {
          id
          address
          collateralToken
          borrowToken
        }
        tokenIn
        tokenOut
        amountIn
        amountOut
        timestamp
        blockNumber
        transactionHash
      }
    }
  `;
};
