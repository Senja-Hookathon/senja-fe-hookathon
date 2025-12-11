import { Network, ContractAddresses } from "./types";

export const CONTRACT_ADDRESSES: Record<Network, ContractAddresses> = {
  [Network.Avalanche]: {
    FACTORY: "0x3705620C09D43935C00852d3610e31C942595cE8",
    HELPER: "0x4611E31A702BA4945475ce56cE2Dfe19c681538c",
  },
};

export const getContractAddress = (
  network: Network,
  contractName: keyof ContractAddresses
): string | undefined => {
  return CONTRACT_ADDRESSES[network][contractName];
};

export const getContractAddresses = (network: Network): ContractAddresses => {
  return CONTRACT_ADDRESSES[network];
};
