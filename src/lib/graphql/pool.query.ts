import { gql } from "graphql-request";

export const queryPools = () => {
  return gql`
    {
      poolCreatedEvents {
        id
        pool
        collateralToken
        borrowToken
        ltv
      }
    }
  `;
};
