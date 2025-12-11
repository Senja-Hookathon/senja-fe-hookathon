import { gql } from "graphql-request";

export const queryPools = () => {
  return gql`
    {
      pools {
        borrowAPY
        supplyAPY
        borrowAssets
        supplyAssets
      }
    }
  `;
};
