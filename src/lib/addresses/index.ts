export * from "./types";
export * from "./tokens";
export * from "./contracts";

import { Network, TokensConfig, ContractAddresses } from "./types";
import { TOKENS } from "./tokens";
import { CONTRACT_ADDRESSES } from "./contracts";

export const getAddresses = (
  network: Network
): {
  tokens: TokensConfig;
  contracts: ContractAddresses;
} => {
  return {
    tokens: TOKENS[network],
    contracts: CONTRACT_ADDRESSES[network],
  };
};
