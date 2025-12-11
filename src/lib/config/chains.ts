// Chain configuration for cross-chain borrowing
export enum ChainId {
  Avalanche = 43114,
  BSC = 56,
}

export enum EndpointId {
  Avalanche = 30106,
  BSC = 30102,
}

export interface ChainConfig {
  id: ChainId;
  name: string;
  endpointId: EndpointId;
  logo: string;
  isDefault: boolean;
}

export const SUPPORTED_CHAINS: Record<ChainId, ChainConfig> = {
  [ChainId.Avalanche]: {
    id: ChainId.Avalanche,
    name: "Avalanche",
    endpointId: EndpointId.Avalanche,
    logo: "/chain/avax.svg",
    isDefault: true,
  },
  [ChainId.BSC]: {
    id: ChainId.BSC,
    name: "BSC",
    endpointId: EndpointId.BSC,
    logo: "/chain/bsclogo.svg",
    isDefault: false,
  },
};

export const getChainConfig = (chainId: ChainId): ChainConfig => {
  return SUPPORTED_CHAINS[chainId];
};

export const getDefaultChain = (): ChainConfig => {
  return SUPPORTED_CHAINS[ChainId.Avalanche];
};
